"""
schemas.py

Pydantic validation models for the case twin function.
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from case_twin import CaseRecord


class CaseRecordInput(BaseModel):
    case_id: str
    crime_type: str
    modus_operandi: str
    narrative_text: str
    latitude: float
    longitude: float
    date_time: datetime
    weapon: Optional[str] = None
    canonical_suspect_ids: List[str] = []

    def to_case_record(self) -> CaseRecord:
        return CaseRecord(
            case_id=self.case_id,
            crime_type=self.crime_type,
            modus_operandi=self.modus_operandi,
            narrative_text=self.narrative_text,
            latitude=self.latitude,
            longitude=self.longitude,
            date_time=self.date_time,
            weapon=self.weapon,
            canonical_suspect_ids=self.canonical_suspect_ids,
        )


class MatchRequest(BaseModel):
    target: CaseRecordInput
    candidates: List[CaseRecordInput]
    top_k: Optional[int] = 3
