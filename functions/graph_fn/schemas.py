from pydantic import BaseModel, Field

class TraverseRequest(BaseModel):
    canonical_id: str = Field(..., description="The canonical suspect identifier to traverse relationships for")
