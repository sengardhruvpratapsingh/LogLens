from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.database.session import Base


class ErrorPattern(Base):
    __tablename__ = "error_patterns"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    analysis_id = Column(
        String(36),
        ForeignKey("analyses.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    normalized_message = Column(Text, nullable=False)
    original_message = Column(Text, nullable=False)
    severity = Column(String(20), default="ERROR", nullable=False)
    occurrence_count = Column(Integer, default=1, nullable=False)
    first_occurrence = Column(DateTime, nullable=True)
    last_occurrence = Column(DateTime, nullable=True)

    analysis = relationship("Analysis", back_populates="error_patterns")

    __table_args__ = (
        Index("idx_pattern_analysis_count", "analysis_id", "occurrence_count"),
    )
