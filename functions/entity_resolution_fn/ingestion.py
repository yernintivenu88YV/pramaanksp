"""
ingestion.py

Single point of change for data format assumptions. Currently assumes
JSON input. If the datathon dataset is CSV or a database dump, only
this file changes.
"""

from schemas import PersonRecordInput
from entity_resolution import PersonRecord


def parse_records(raw_data: list[dict]) -> list[PersonRecord]:
    """
    Validate and convert raw JSON dicts to PersonRecord instances.
    Pydantic handles validation; this function is the single place
    that knows the input format.
    """
    return [PersonRecordInput(**item).to_person_record() for item in raw_data]
