from dataclasses import dataclass, field
from datetime import datetime
import logging
import math
import os
from typing import Optional, List
from fastapi import APIRouter, Request, HTTPException, status
from pydantic import BaseModel
from rapidfuzz.distance import JaroWinkler
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger("appsail.case_twin")
router = APIRouter(prefix="/server/case_twin_fn")

_EMBED_MODEL_ID = os.getenv("NARRATIVE_EMBED_MODEL", "krutrim-ai-labs/Vyakyarth")
_embed_model = None
_embed_unavailable = False

class CaseRecordModel(BaseModel):
    case_id: str
    crime_type: str
    modus_operandi: str
    narrative_text: str
    latitude: float
    longitude: float
    date_time: str  # ISO string or standard datetime string
    weapon: Optional[str] = None
    canonical_suspect_ids: List[str] = []

class MatchRequest(BaseModel):
    target: CaseRecordModel
    candidates: List[CaseRecordModel]
    top_k: int = 3

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

def _get_embed_model():
    global _embed_model, _embed_unavailable
    if _embed_model is not None or _embed_unavailable:
        return _embed_model
    try:
        from sentence_transformers import SentenceTransformer
        _embed_model = SentenceTransformer(_EMBED_MODEL_ID)
        logger.info(f"Loaded narrative embedding model: {_EMBED_MODEL_ID}")
    except Exception as e:
        _embed_unavailable = True
        _embed_model = None
        logger.warning(f"Embedding model '{_EMBED_MODEL_ID}' unavailable ({e}); falling back to TF-IDF.")
    return _embed_model

def _tfidf_narrative_similarity(a_text: str, b_text: str) -> float:
    vec = TfidfVectorizer().fit([a_text, b_text])
    vectors = vec.transform([a_text, b_text])
    return float(cosine_similarity(vectors[0], vectors[1])[0][0])

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
    a_text = (a.narrative_text or "").strip()
    b_text = (b.narrative_text or "").strip()
    if not a_text or not b_text:
        return 0.0

    model = _get_embed_model()
    if model is not None:
        try:
            emb = model.encode([a_text, b_text], normalize_embeddings=True)
            cos = float(emb[0] @ emb[1])
            return max(0.0, min(1.0, cos))
        except Exception as e:
            logger.warning(f"Embedding similarity failed ({e}); using TF-IDF.")

    return _tfidf_narrative_similarity(a_text, b_text)

def shared_suspect_score(a: CaseRecord, b: CaseRecord) -> float:
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

def parse_iso_datetime(dt_str: str) -> datetime:
    try:
        # Tries standard formats
        if "T" in dt_str:
            dt_str = dt_str.replace("Z", "+00:00")
            return datetime.fromisoformat(dt_str)
        return datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
    except Exception:
        return datetime.now()

@router.get("/health")
def health():
    return {"status": "ok", "module": "case_twin_fn"}

@router.post("/match")
def match(req: MatchRequest, request: Request):
    target = CaseRecord(
        case_id=req.target.case_id,
        crime_type=req.target.crime_type,
        modus_operandi=req.target.modus_operandi,
        narrative_text=req.target.narrative_text,
        latitude=req.target.latitude,
        longitude=req.target.longitude,
        date_time=parse_iso_datetime(req.target.date_time),
        weapon=req.target.weapon,
        canonical_suspect_ids=req.target.canonical_suspect_ids
    )
    
    candidates = []
    for c in req.candidates:
        candidates.append(CaseRecord(
            case_id=c.case_id,
            crime_type=c.crime_type,
            modus_operandi=c.modus_operandi,
            narrative_text=c.narrative_text,
            latitude=c.latitude,
            longitude=c.longitude,
            date_time=parse_iso_datetime(c.date_time),
            weapon=c.weapon,
            canonical_suspect_ids=c.canonical_suspect_ids
        ))
        
    scores = []
    for c in candidates:
        if c.case_id == target.case_id:
            continue
        breakdown = {
            "location": location_similarity(target, c),
            "time": time_pattern_similarity(target, c),
            "mo": mo_similarity(target, c),
            "weapon": weapon_similarity(target, c),
            "narrative": narrative_similarity(target, c),
        }
        total = sum(WEIGHTS[k] * v for k, v in breakdown.items())
        shared = shared_suspect_score(target, c) == 1.0
        scores.append({
            "case": c,
            "total_score": total,
            "breakdown": breakdown,
            "shared_confirmed_suspect": shared
        })
        
    ranked = sorted(scores, key=lambda s: s["total_score"], reverse=True)
    top_scores = ranked[:req.top_k]
    flagged_scores = [s for s in ranked if s["shared_confirmed_suspect"] and s not in top_scores]
    
    # Serialize responses
    def serialize_score(s):
        c = s["case"]
        return {
            "case_id": c.case_id,
            "crime_type": c.crime_type,
            "modus_operandi": c.modus_operandi,
            "narrative_text": c.narrative_text,
            "latitude": c.latitude,
            "longitude": c.longitude,
            "date_time": c.date_time.strftime('%Y-%m-%d %H:%M:%S'),
            "weapon": c.weapon,
            "total_score": s["total_score"],
            "breakdown": s["breakdown"],
            "shared_confirmed_suspect": s["shared_confirmed_suspect"]
        }
        
    return {
        "top_matches": [serialize_score(s) for s in top_scores],
        "flagged_linkages": [serialize_score(s) for s in flagged_scores]
    }
