from pydantic import BaseModel, Field
from rbac import Resource

class CheckAccessRequest(BaseModel):
    resource: str = Field(..., description="The name of the resource to check access for")
