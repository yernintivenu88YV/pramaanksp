"""
entity_resolution.py

Core entity-resolution engine for the Pramaan crime intelligence platform.

Resolves person records from multiple source tables (FIR filings, vehicle
registry, phone/CDR records, financial records) to a single canonical
identity, using a two-tier approach:

  1. Deterministic tier -- exact match on strong identifiers (phone,
     vehicle registration). These almost never agree by chance, so a
     match here is treated as conclusive.
  2. Probabilistic tier -- a simplified Fellegi-Sunter style weighted
     score across name similarity (Jaro-Winkler), address token overlap,
     and age proximity, for record pairs with no shared strong identifier.

The field weights below are hand-specified starting points, not
EM-estimated from real data -- an honest simplification for a prototype
with limited sample data. Before a production deployment these should be
re-estimated against a labeled sample of real KSP records using an EM
algorithm, which is exactly what a library like `splink` automates.

Every scored pair returns not just a decision but the evidence behind it.
A merge this system makes has to be explainable and reversible -- not a
silent join -- because a false merge here means attaching one person's
record to a different person, not just a software bug.
"""

from dataclasses import dataclass
from enum import Enum
from typing import Optional
import re
from rapidfuzz.distance import JaroWinkler


class MatchDecision(Enum):
    AUTO_MERGE = "auto_merge"
    REVIEW_QUEUE = "review_queue"
    REJECT = "reject"


@dataclass
class PersonRecord:
    """A person record as it exists in one source table, pre-resolution."""
    source_id: str
    source_table: str
    name: str
    phone: Optional[str] = None
    vehicle_reg: Optional[str] = None
    address: Optional[str] = None
    age: Optional[int] = None
    name_kannada: Optional[str] = None


@dataclass
class MatchResult:
    record_a: PersonRecord
    record_b: PersonRecord
    decision: MatchDecision
    score: float
    evidence: list


# ---------------------------------------------------------------------------
# Normalization -- the unglamorous step that makes everything else work
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# Field-level similarity scores (each returns 0.0-1.0)
# ---------------------------------------------------------------------------

def name_similarity(name_a: str, name_b: str) -> float:
    """
    Whole-string Jaro-Winkler alone is vulnerable to first-name dominance:
    a strong prefix match on a common first name ("Mohammed"/"Mohammad")
    can carry the score even when the surname changes completely ("Rafi"
    -> "Sharif"), because nothing separately checks whether the more
    discriminating token -- typically the surname -- actually agrees.

    This compares tokens with best-match pairing (so legitimate reordering
    like "Praveen Kumar S" vs "S. Praveen Kumar" isn't penalized) and takes
    the more conservative of the token-level and whole-string views, so a
    genuine surname mismatch can't be masked by a matching first name.
    """
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
        return 0.5  # missing data -- neither supports nor contradicts a match
    tokens_a, tokens_b = set(a.split()), set(b.split())
    if not tokens_a or not tokens_b:
        return 0.5
    overlap = len(tokens_a & tokens_b)
    return overlap / max(len(tokens_a), len(tokens_b))


def age_similarity(age_a: Optional[int], age_b: Optional[int]) -> float:
    if age_a is None or age_b is None:
        return 0.5  # unknown -- neither supports nor contradicts a match
    diff = abs(age_a - age_b)
    if diff <= 1:
        return 1.0
    if diff >= 6:
        return 0.0
    return 1.0 - (diff / 6)


# ---------------------------------------------------------------------------
# Deterministic tier
# ---------------------------------------------------------------------------

def deterministic_match(a: PersonRecord, b: PersonRecord) -> Optional[str]:
    """Returns a reason string if a strong identifier matches, else None."""
    phone_a, phone_b = normalize_phone(a.phone), normalize_phone(b.phone)
    if phone_a and phone_b and phone_a == phone_b:
        return f"exact phone match ({phone_a})"

    reg_a, reg_b = normalize_vehicle_reg(a.vehicle_reg), normalize_vehicle_reg(b.vehicle_reg)
    if reg_a and reg_b and reg_a == reg_b:
        return f"exact vehicle registration match ({reg_a})"

    return None


# ---------------------------------------------------------------------------
# Probabilistic tier -- simplified Fellegi-Sunter style weighted scoring
# ---------------------------------------------------------------------------

# Hand-specified weights (log-likelihood-ratio style contributions).
# Starting points for a prototype -- not EM-estimated from real data.
NAME_WEIGHT = 3.0
ADDRESS_WEIGHT = 2.0
AGE_WEIGHT = 1.0

HIGH_CONFIDENCE_THRESHOLD = 5.0   # auto-merge at or above this
LOW_CONFIDENCE_THRESHOLD = 2.5    # reject below this; between the two -> review queue


def probabilistic_score(a: PersonRecord, b: PersonRecord):
    name_sim = name_similarity(a.name, b.name)
    addr_sim = address_similarity(a.address, b.address)
    age_sim = age_similarity(a.age, b.age)

    # Each field's similarity is centered at 0.5 (neutral) and scaled so
    # strong agreement pushes the total score up, strong disagreement
    # pushes it down -- rather than every field only ever adding evidence.
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


def resolve_pair(a: PersonRecord, b: PersonRecord) -> MatchResult:
    det_reason = deterministic_match(a, b)
    if det_reason:
        return MatchResult(a, b, MatchDecision.AUTO_MERGE, score=float("inf"),
                            evidence=[det_reason])

    score, evidence = probabilistic_score(a, b)

    if score >= HIGH_CONFIDENCE_THRESHOLD:
        decision = MatchDecision.AUTO_MERGE
    elif score >= LOW_CONFIDENCE_THRESHOLD:
        decision = MatchDecision.REVIEW_QUEUE
    else:
        decision = MatchDecision.REJECT

    return MatchResult(a, b, decision, score, evidence)
