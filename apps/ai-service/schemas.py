from pydantic import BaseModel, Field

class ProcessRequest(BaseModel):
    text: str = Field(..., min_length=1, description="The input text to process.")

class ProcessResponse(BaseModel):
    embedding: list[float]
    tags: list[str]
