"""
case_twin.py

Case-twin / signature matching -- runs AFTER entity resolution, on
canonicalized case records. Ranks candidate cases against a target case
using a weighted combination of structured features (location, time
pattern, modus operandi, weapon) plus narrative text similarity plus
one signal that only exists because entity resolution ran first: do
these two cases already share a canonicalized suspect?

Narrative similarity uses multilingual sentence embeddings (Vyakyarth,
Krutrim AI Labs -- purpose-built for Indic languages incl. Kannada) as
the PRIMARY signal, with TF-IDF + cosine as a graceful fallback if the
embedding model can't be loaded in the deployed environment. See
narrative_similarity() for the language-handling contract and
_get_embed_model() for the fallback behaviour.
"""

from dataclasses import dataclass, field
from typing import Optional, List
from datetime import datetime
import os
import math
import logging
from rapidfuzz.distance import JaroWinkler
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

# Model id is overridable via env var so deployment can pin a different
# checkpoint (e.g. BGE-M3) without a code change. Default is Vyakyarth --
# chosen empirically over BGE-M3 on the Kannada + English narrative set;
# see functions/case_twin_fn/EMBEDDINGS_EVAL.md for the numbers.
_EMBED_MODEL_ID = os.getenv("NARRATIVE_EMBED_MODEL", "krutrim-ai-labs/Vyakyarth")
_embed_model = None          # cached SentenceTransformer, loaded lazily once
_embed_unavailable = False   # set True after a failed load so we don't retry


def _get_embed_model():
    """
    Lazily load and cache the sentence-embedding model. If sentence-
    transformers / torch / the weights aren't available in this
    environment, record that once and return None so narrative_similarity
    falls back to TF-IDF instead of raising -- the same fail-soft posture
    graph_fn uses when Neo4j credentials are absent.
    """
    global _embed_model, _embed_unavailable
    if _embed_model is not None or _embed_unavailable:
        return _embed_model
    try:
        from sentence_transformers import SentenceTransformer
        _embed_model = SentenceTransformer(_EMBED_MODEL_ID)
        logger.info("Loaded narrative embedding model: %s", _EMBED_MODEL_ID)
    except Exception as e:  # missing deps, no weights, OOM, etc.
        _embed_unavailable = True
        _embed_model = None
        logger.warning(
            "Embedding model '%s' unavailable (%s); narrative_similarity "
            "falling back to TF-IDF.", _EMBED_MODEL_ID, e)
    return _embed_model


def _tfidf_narrative_similarity(a_text: str, b_text: str) -> float:
    """TF-IDF cosine fallback -- the original baseline, kept intact."""
    vec = TfidfVectorizer().fit([a_text, b_text])
    vectors = vec.transform([a_text, b_text])
    return float(cosine_similarity(vectors[0], vectors[1])[0][0])


@dataclass
class CaseRecord:
    case_id: str
    crime_type: str
    modus_operandi: str
    narrative_text: str
    latitude: float
    longitude: float
    date_time: datetime
    weapon: Optional[str] = None
    canonical_suspect_ids: List[str] = field(default_factory=list)


@dataclass
class TwinScore:
    case: CaseRecord
    total_score: float
    breakdown: dict
    shared_confirmed_suspect: bool = False


# ---------------------------------------------------------------------------
# Structured sub-scores (each 0.0-1.0)
# ---------------------------------------------------------------------------

def haversine_km(lat1, lon1, lat2, lon2) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def location_similarity(a: CaseRecord, b: CaseRecord, decay_km: float = 5.0) -> float:
    dist = haversine_km(a.latitude, a.longitude, b.latitude, b.longitude)
    return math.exp(-dist / decay_km)


def time_pattern_similarity(a: CaseRecord, b: CaseRecord) -> float:
    same_dow = 1.0 if a.date_time.weekday() == b.date_time.weekday() else 0.0
    hour_diff = abs(a.date_time.hour - b.date_time.hour)
    hour_diff = min(hour_diff, 24 - hour_diff)
    hour_score = max(0.0, 1.0 - hour_diff / 12)
    return (same_dow + hour_score) / 2


def mo_similarity(a: CaseRecord, b: CaseRecord) -> float:
    crime_type_match = 1.0 if a.crime_type.lower() == b.crime_type.lower() else 0.0
    mo_text_sim = JaroWinkler.similarity(a.modus_operandi.lower(), b.modus_operandi.lower())
    return (crime_type_match + mo_text_sim) / 2


def weapon_similarity(a: CaseRecord, b: CaseRecord) -> float:
    if not a.weapon or not b.weapon:
        return 0.5
    return 1.0 if a.weapon.lower() == b.weapon.lower() else 0.0


def narrative_similarity(a: CaseRecord, b: CaseRecord) -> float:
    """
    Similarity between two case narratives, in [0.0, 1.0].

    DO NOT TRANSLATE before comparing. Kannada narratives are embedded and
    compared IN KANNADA -- the multilingual model shares one vector space
    across languages, so a Kannada narrative and its English twin land near
    each other without any translate-then-process step. This mirrors the
    decision already made in intent_router_fn for queries. If a future pass
    is tempted to "simplify" this into translate-to-English-first: don't --
    that reintroduces MT error and loses Kannada-specific police idiom.

    Primary path: sentence embeddings (Vyakyarth). Fallback: TF-IDF cosine
    if the model can't be loaded here (see _get_embed_model). TF-IDF is
    lexical-overlap only and does NOT handle Kannada<->English or synonymy,
    so it is a safety net for availability, not an equivalent substitute.
    """
    a_text = (a.narrative_text or "").strip()
    b_text = (b.narrative_text or "").strip()
    if not a_text or not b_text:
        return 0.0

    model = _get_embed_model()
    if model is not None:
        try:
            emb = model.encode([a_text, b_text], normalize_embeddings=True)
            # cosine of L2-normalized vectors == dot product, in [-1, 1];
            # clamp to [0, 1] to match the other sub-scores' scale.
            cos = float(emb[0] @ emb[1])
            return max(0.0, min(1.0, cos))
        except Exception as e:
            logger.warning("Embedding similarity failed (%s); using TF-IDF.", e)

    return _tfidf_narrative_similarity(a_text, b_text)


def shared_suspect_score(a: CaseRecord, b: CaseRecord) -> float:
    """
    The strongest possible signal, and one that only works because
    entity resolution already ran: if the same person appeared under
    two different name spellings across these two cases, this still
    catches the connection, because it looks up canonical_id -- not
    raw, unresolved names.
    """
    if not a.canonical_suspect_ids or not b.canonical_suspect_ids:
        return 0.0
    shared = set(a.canonical_suspect_ids) & set(b.canonical_suspect_ids)
    return 1.0 if shared else 0.0


WEIGHTS = {
    "location": 0.25,
    "time": 0.15,
    "mo": 0.30,
    "weapon": 0.10,
    "narrative": 0.20,
}
# shared_suspect is deliberately NOT in this blend -- see score_pair.


def score_pair(a: CaseRecord, b: CaseRecord) -> TwinScore:
    breakdown = {
        "location": location_similarity(a, b),
        "time": time_pattern_similarity(a, b),
        "mo": mo_similarity(a, b),
        "weapon": weapon_similarity(a, b),
        "narrative": narrative_similarity(a, b),
    }
    total = sum(WEIGHTS[k] * v for k, v in breakdown.items())
    # A confirmed shared suspect (via entity resolution) is categorically
    # different evidence from "these cases look similar" -- it doesn't
    # get a blend weight, because any weight chosen would be an arbitrary
    # knob tuned to make one example rank the way it "should." Instead it
    # surfaces as its own explicit signal, alongside the similarity score,
    # for the investigator to weigh -- not silently folded into one number.
    shared = shared_suspect_score(a, b) == 1.0
    return TwinScore(case=b, total_score=total, breakdown=breakdown,
                      shared_confirmed_suspect=shared)


def find_twins(target: CaseRecord, candidates: List[CaseRecord], top_k: int = 3):
    """
    Returns (ranked_by_similarity, flagged_by_shared_suspect) -- the
    second list surfaces any case sharing a confirmed canonical suspect
    with the target that *didn't* already make the top_k on similarity
    alone, so a real connection can't get silently buried by cases that
    are merely structurally similar without being actually connected.
    """
    scores = [score_pair(target, c) for c in candidates if c.case_id != target.case_id]
    ranked = sorted(scores, key=lambda s: s.total_score, reverse=True)
    top = ranked[:top_k]
    flagged = [s for s in ranked if s.shared_confirmed_suspect and s not in top]
    return top, flagged
