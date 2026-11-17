from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from backend.app.schemas.error_pattern import ErrorPatternResponse


class SeverityDistribution(BaseModel):
    critical: int = 0
    error: int = 0
    warning: int = 0
    info: int = 0
    debug: int = 0
    unknown: int = 0
    percentages: Dict[str, float] = {}


class TimelinePoint(BaseModel):
    timestamp: str
    total: int
    error: int
    warning: int
    info: int
    critical: int
    debug: int


class TopErrorCategory(BaseModel):
    category: str
    count: int
    percentage: float


class AnalysisBase(BaseModel):
    filename: str
    file_size: int
    detected_format: str
    total_records: int
    parsed_records: int
    unparsed_records: int
    critical_count: int
    error_count: int
    warning_count: int
    info_count: int
    debug_count: int
    unknown_count: int
    status: str
    first_timestamp: Optional[datetime] = None
    last_timestamp: Optional[datetime] = None


class AnalysisSummaryResponse(AnalysisBase):
    id: str
    file_hash: str
    created_at: datetime
    error_percentage: float = 0.0

    model_config = ConfigDict(from_attributes=True)


class AnalysisDetailResponse(AnalysisSummaryResponse):
    severity_distribution: SeverityDistribution
    timeline: List[TimelinePoint]
    top_patterns: List[ErrorPatternResponse]
    top_categories: List[TopErrorCategory]


class PaginatedAnalysisResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: List[AnalysisSummaryResponse]


class SampleFileItem(BaseModel):
    id: str
    name: str
    filename: str
    format: str
    description: str
    size_bytes: int
