from pydantic import BaseModel, Field

class RouteQueryRequest(BaseModel):
    query: str = Field(..., description="The natural language query string in English or Kannada")
