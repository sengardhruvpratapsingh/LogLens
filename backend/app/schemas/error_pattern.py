from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ErrorPatternBase(BaseModel):
    normalized_message: str
    original_message: str
    severity: str = "ERROR"
    occurrence_count: int = 1
    first_occurrence: Optional[datetime] = None
    last_occurrence: Optional[datetime] = None


class ErrorPatternCreate(ErrorPatternBase):
    pass


class ErrorPatternResponse(ErrorPatternBase):
    id: int
    analysis_id: str

    model_config = ConfigDict(from_attributes=True)
