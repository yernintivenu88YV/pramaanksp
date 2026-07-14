"""
ingestion.py

Helper utilities to parse and ingest raw case inputs.
"""

from typing import List
from schemas import CaseRecordInput
from case_twin import CaseRecord


def parse_case(raw_case: dict) -> CaseRecord:
    return CaseRecordInput(**raw_case).to_case_record()


def parse_candidates(raw_candidates: List[dict]) -> List[CaseRecord]:
    return [CaseRecordInput(**item).to_case_record() for item in raw_candidates]
