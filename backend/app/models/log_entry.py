from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.database.session import Base


class LogEntry(Base):
    __tablename__ = "log_entries"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    analysis_id = Column(
        String(36),
        ForeignKey("analyses.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    timestamp = Column(DateTime, nullable=True, index=True)
    severity = Column(String(20), default="UNKNOWN", nullable=False, index=True)
    source = Column(String(100), default="system", nullable=False)
    message = Column(Text, nullable=False)
    original_line = Column(Text, nullable=False)
    parsed = Column(Boolean, default=True, nullable=False)
    metadata_json = Column(Text, nullable=True)

    analysis = relationship("Analysis", back_populates="log_entries")

    __table_args__ = (
        Index("idx_log_analysis_severity", "analysis_id", "severity"),
        Index("idx_log_analysis_timestamp", "analysis_id", "timestamp"),
    )
