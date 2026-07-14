"""
case_twin.py

Case-twin / signature matching -- runs AFTER entity resolution, on
canonicalized case records. Ranks candidate cases against a target case
using a weighted combination of structured features (location, time
pattern, modus operandi, weapon) plus narrative text similarity plus
one signal that only exists because entity resolution ran first: do
these two cases already share a canonicalized suspect?

Narrative similarity here uses TF-IDF + cosine similarity, an honest,
fully-testable baseline -- this sandbox has no network access to model
hubs (Vyakyarth, BGE-M3), so it can't download and verify a real
embedding model the way it verified everything else in this project.
Swapping in real sentence embeddings later is a drop-in replacement for
narrative_similarity() only; nothing else in this module needs to change.
"""

from dataclasses import dataclass, field
from typing import Optional, List
from datetime import datetime
import math
from rapidfuzz.distance import JaroWinkler
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


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
    vec = TfidfVectorizer().fit([a.narrative_text, b.narrative_text])
    vectors = vec.transform([a.narrative_text, b.narrative_text])
    return float(cosine_similarity(vectors[0], vectors[1])[0][0])


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
