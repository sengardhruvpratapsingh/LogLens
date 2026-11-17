import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.orm import relationship
from backend.app.database.session import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    filename = Column(String(255), nullable=False)
    file_hash = Column(String(64), nullable=False, index=True)
    file_size = Column(Integer, nullable=False)
    detected_format = Column(String(50), nullable=False, default="unknown")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    
    # Counts
    total_records = Column(Integer, default=0, nullable=False)
    parsed_records = Column(Integer, default=0, nullable=False)
    unparsed_records = Column(Integer, default=0, nullable=False)
    critical_count = Column(Integer, default=0, nullable=False)
    error_count = Column(Integer, default=0, nullable=False)
    warning_count = Column(Integer, default=0, nullable=False)
    info_count = Column(Integer, default=0, nullable=False)
    debug_count = Column(Integer, default=0, nullable=False)
    unknown_count = Column(Integer, default=0, nullable=False)
    
    # Time Range
    first_timestamp = Column(DateTime, nullable=True)
    last_timestamp = Column(DateTime, nullable=True)
    
    # Status
    status = Column(String(50), default="COMPLETED", nullable=False)

    # Relationships with cascade delete
    log_entries = relationship(
        "LogEntry",
        back_populates="analysis",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    error_patterns = relationship(
        "ErrorPattern",
        back_populates="analysis",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
