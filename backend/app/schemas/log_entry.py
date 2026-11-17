from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class LogEntryBase(BaseModel):
    timestamp: Optional[datetime] = None
    severity: str = "UNKNOWN"
    source: str = "system"
    message: str
    original_line: str
    parsed: bool = True
    metadata_json: Optional[str] = None


class LogEntryCreate(LogEntryBase):
    pass


class LogEntryResponse(LogEntryBase):
    id: int
    analysis_id: str

    model_config = ConfigDict(from_attributes=True)


class PaginatedLogResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: list[LogEntryResponse]
