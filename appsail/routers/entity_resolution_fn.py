from dataclasses import dataclass
from enum import Enum
import logging
import re
from typing import Optional, List
from fastapi import APIRouter, Request, HTTPException, status
from pydantic import BaseModel
from rapidfuzz.distance import JaroWinkler

logger = logging.getLogger("appsail.entity_resolution")
router = APIRouter(prefix="/server/entity_resolution_fn")

class MatchDecision(str, Enum):
    AUTO_MERGE = "auto_merge"
    REVIEW_QUEUE = "review_queue"
    REJECT = "reject"

class PersonRecordModel(BaseModel):
    source_id: str
    source_table: str
    name: str
    phone: Optional[str] = None
    vehicle_reg: Optional[str] = None
    address: Optional[str] = None
    age: Optional[int] = None
    name_kannada: Optional[str] = None

class ResolveRequest(BaseModel):
    record_a: PersonRecordModel
    record_b: PersonRecordModel

@dataclass
class PersonRecord:
    source_id: str
    source_table: str
    name: str
    phone: Optional[str] = None
    vehicle_reg: Optional[str] = None
    address: Optional[str] = None
    age: Optional[int] = None
    name_kannada: Optional[str] = None

def normalize_phone(phone: Optional[str]) -> Optional[str]:
    if not phone:
        return None
    digits = re.sub(r"\D", "", phone)
    return digits[-10:] if len(digits) >= 10 else (digits or None)

def normalize_vehicle_reg(reg: Optional[str]) -> Optional[str]:
    if not reg:
        return None
    return re.sub(r"[\s\-]", "", reg).upper()

def normalize_name(name: str) -> str:
    name = name.lower().strip()
    name = re.sub(r"\bmohd\.?\b", "mohammed", name)
    name = re.sub(r"\bmd\.?\b", "mohammed", name)
    name = re.sub(r"[.\-]", " ", name)
    name = re.sub(r"\s+", " ", name)
    return name.strip()

def normalize_address(address: Optional[str]) -> Optional[str]:
    if not address:
        return None
    address = address.lower()
    address = re.sub(r"[.,]", "", address)
    address = re.sub(r"\s+", " ", address)
    return address.strip()

def name_similarity(name_a: str, name_b: str) -> float:
    norm_a, norm_b = normalize_name(name_a), normalize_name(name_b)
    whole_string_sim = JaroWinkler.similarity(norm_a, norm_b)

    tokens_a, tokens_b = norm_a.split(), norm_b.split()
    if not tokens_a or not tokens_b:
        return whole_string_sim

    shorter, longer = (tokens_a, tokens_b) if len(tokens_a) <= len(tokens_b) else (tokens_b, tokens_a)
    best_per_token = [max(JaroWinkler.similarity(t, other) for other in longer) for t in shorter]
    token_sim = sum(best_per_token) / len(best_per_token)

    return min(whole_string_sim, token_sim)

def address_similarity(addr_a: Optional[str], addr_b: Optional[str]) -> float:
    a, b = normalize_address(addr_a), normalize_address(addr_b)
    if not a or not b:
        return 0.5
    tokens_a, tokens_b = set(a.split()), set(b.split())
    if not tokens_a or not tokens_b:
        return 0.5
    overlap = len(tokens_a & tokens_b)
    return overlap / max(len(tokens_a), len(tokens_b))

def age_similarity(age_a: Optional[int], age_b: Optional[int]) -> float:
    if age_a is None or age_b is None:
        return 0.5
    diff = abs(age_a - age_b)
    if diff <= 1:
        return 1.0
    if diff >= 6:
        return 0.0
    return 1.0 - (diff / 6)

def deterministic_match(a: PersonRecord, b: PersonRecord) -> Optional[str]:
    phone_a, phone_b = normalize_phone(a.phone), normalize_phone(b.phone)
    if phone_a and phone_b and phone_a == phone_b:
        return f"exact phone match ({phone_a})"

    reg_a, reg_b = normalize_vehicle_reg(a.vehicle_reg), normalize_vehicle_reg(b.vehicle_reg)
    if reg_a and reg_b and reg_a == reg_b:
        return f"exact vehicle registration match ({reg_a})"

    return None

NAME_WEIGHT = 3.0
ADDRESS_WEIGHT = 2.0
AGE_WEIGHT = 1.0
HIGH_CONFIDENCE_THRESHOLD = 5.0
LOW_CONFIDENCE_THRESHOLD = 2.5

def probabilistic_score(a: PersonRecord, b: PersonRecord):
    name_sim = name_similarity(a.name, b.name)
    addr_sim = address_similarity(a.address, b.address)
    age_sim = age_similarity(a.age, b.age)

    name_contrib = NAME_WEIGHT * (name_sim - 0.5) * 2
    addr_contrib = ADDRESS_WEIGHT * (addr_sim - 0.5) * 2
    age_contrib = AGE_WEIGHT * (age_sim - 0.5) * 2

    total = name_contrib + addr_contrib + age_contrib
    evidence = [
        f"name similarity {name_sim:.2f} (contributes {name_contrib:+.2f})",
        f"address token overlap {addr_sim:.2f} (contributes {addr_contrib:+.2f})",
        f"age similarity {age_sim:.2f} (contributes {age_contrib:+.2f})",
    ]
    return total, evidence

def resolve_pair(a: PersonRecord, b: PersonRecord):
    det_reason = deterministic_match(a, b)
    if det_reason:
        return MatchDecision.AUTO_MERGE, float("inf"), [det_reason]

    score, evidence = probabilistic_score(a, b)
    if score >= HIGH_CONFIDENCE_THRESHOLD:
        decision = MatchDecision.AUTO_MERGE
    elif score >= LOW_CONFIDENCE_THRESHOLD:
        decision = MatchDecision.REVIEW_QUEUE
    else:
        decision = MatchDecision.REJECT

    return decision, score, evidence

@router.get("/health")
def health():
    return {"status": "ok", "module": "entity_resolution_fn"}

@router.post("/resolve")
def resolve(req: ResolveRequest, request: Request):
    a = PersonRecord(
        source_id=req.record_a.source_id,
        source_table=req.record_a.source_table,
        name=req.record_a.name,
        phone=req.record_a.phone,
        vehicle_reg=req.record_a.vehicle_reg,
        address=req.record_a.address,
        age=req.record_a.age,
        name_kannada=req.record_a.name_kannada
    )
    b = PersonRecord(
        source_id=req.record_b.source_id,
        source_table=req.record_b.source_table,
        name=req.record_b.name,
        phone=req.record_b.phone,
        vehicle_reg=req.record_b.vehicle_reg,
        address=req.record_b.address,
        age=req.record_b.age,
        name_kannada=req.record_b.name_kannada
    )
    
    decision, score, evidence = resolve_pair(a, b)
    
    return {
        "decision": decision.value,
        "score": None if score == float("inf") else score,
        "evidence": evidence
    }
