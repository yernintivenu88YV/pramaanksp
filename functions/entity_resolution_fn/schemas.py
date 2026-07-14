"""
schemas.py

Pydantic models for HTTP input validation. These wrap the existing
PersonRecord dataclass for JSON deserialization -- they don't replace
the scoring logic, which stays in entity_resolution.py untouched.
"""

from typing import Optional
from pydantic import BaseModel

from entity_resolution import PersonRecord


class PersonRecordInput(BaseModel):
    """Validates incoming JSON before converting to the internal PersonRecord dataclass."""
    source_id: str
    source_table: str
    name: str
    phone: Optional[str] = None
    vehicle_reg: Optional[str] = None
    address: Optional[str] = None
    age: Optional[int] = None

    def to_person_record(self) -> PersonRecord:
        return PersonRecord(
            source_id=self.source_id,
            source_table=self.source_table,
            name=self.name,
            phone=self.phone,
            vehicle_reg=self.vehicle_reg,
            address=self.address,
            age=self.age,
        )


class ResolveRequest(BaseModel):
    """Two records to compare."""
    record_a: PersonRecordInput
    record_b: PersonRecordInput
