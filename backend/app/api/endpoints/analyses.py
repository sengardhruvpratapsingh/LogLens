from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc
from backend.app.database.session import get_db
from backend.app.models.analysis import Analysis
from backend.app.models.log_entry import LogEntry
from backend.app.models.error_pattern import ErrorPattern
from backend.app.schemas.analysis import (
    AnalysisSummaryResponse,
    AnalysisDetailResponse,
    PaginatedAnalysisResponse,
    SeverityDistribution,
    TimelinePoint,
    TopErrorCategory,
)
from backend.app.schemas.log_entry import PaginatedLogResponse, LogEntryResponse
from backend.app.schemas.error_pattern import ErrorPatternResponse
from backend.app.services.analyzer import categorize_error, compute_analysis_metrics
from backend.app.services.parser import ParsedRecord

router = APIRouter(prefix="/analyses", tags=["Analyses"])


@router.get("/stats/overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    """
    Returns aggregated KPI metrics and recent analyses for the main dashboard.
    All metrics are computed from real saved data.
    """
    total_analyses = db.query(func.count(Analysis.id)).scalar() or 0
    total_logs = db.query(func.sum(Analysis.total_records)).scalar() or 0
    total_errors = db.query(func.sum(Analysis.error_count)).scalar() or 0
    total_warnings = db.query(func.sum(Analysis.warning_count)).scalar() or 0
    total_criticals = db.query(func.sum(Analysis.critical_count)).scalar() or 0
    total_info = db.query(func.sum(Analysis.info_count)).scalar() or 0
    total_debug = db.query(func.sum(Analysis.debug_count)).scalar() or 0
    total_unknown = db.query(func.sum(Analysis.unknown_count)).scalar() or 0

    recent_query = db.query(Analysis).order_by(desc(Analysis.created_at)).limit(5).all()
    recent_items = []
    for item in recent_query:
        total = item.total_records or 1
        err_pct = round(((item.error_count + item.critical_count) / total) * 100.0, 2)
        summary = AnalysisSummaryResponse.model_validate(item)
        summary.error_percentage = err_pct
        recent_items.append(summary)

    # Top overall recurring error patterns
    top_patterns_query = (
        db.query(
            ErrorPattern.normalized_message,
            ErrorPattern.severity,
            func.sum(ErrorPattern.occurrence_count).label("total_occurrences")
        )
        .group_by(ErrorPattern.normalized_message, ErrorPattern.severity)
        .order_by(desc("total_occurrences"))
        .limit(5)
        .all()
    )
    top_patterns = [
        {"pattern": p[0], "severity": p[1], "count": int(p[2])}
        for p in top_patterns_query
    ]

    return {
        "total_analyses": total_analyses,
        "total_logs": total_logs,
        "total_errors": total_errors,
        "total_warnings": total_warnings,
        "total_criticals": total_criticals,
        "total_info": total_info,
        "total_debug": total_debug,
        "total_unknown": total_unknown,
        "recent_analyses": recent_items,
        "top_patterns": top_patterns,
    }


@router.get("", response_model=PaginatedAnalysisResponse)
def get_analyses_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Returns paginated analysis history with optional filename search."""
    query = db.query(Analysis)
    if search:
        query = query.filter(Analysis.filename.ilike(f"%{search.strip()}%"))

    total = query.count()
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    offset = (page - 1) * page_size

    items = query.order_by(desc(Analysis.created_at)).offset(offset).limit(page_size).all()
    response_items = []
    for a in items:
        tot = a.total_records or 1
        pct = round(((a.error_count + a.critical_count) / tot) * 100.0, 2)
        res = AnalysisSummaryResponse.model_validate(a)
        res.error_percentage = pct
        response_items.append(res)

    return PaginatedAnalysisResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        items=response_items
    )


@router.get("/{analysis_id}", response_model=AnalysisDetailResponse)
def get_analysis_detail(
    analysis_id: str,
    db: Session = Depends(get_db)
):
    """Returns full details, charts data, and recurring patterns for a single analysis."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis with ID '{analysis_id}' was not found."
        )

    # Patterns
    patterns = (
        db.query(ErrorPattern)
        .filter(ErrorPattern.analysis_id == analysis_id)
        .order_by(desc(ErrorPattern.occurrence_count))
        .all()
    )
    pattern_responses = [ErrorPatternResponse.model_validate(p) for p in patterns]

    # Fetch logs for timeline and category breakdown calculation
    logs = db.query(LogEntry).filter(LogEntry.analysis_id == analysis_id).all()
    
    # Convert logs to ParsedRecord to compute timeline & categories
    dummy_records = [
        ParsedRecord(
            timestamp=l.timestamp,
            severity=l.severity,
            source=l.source,
            message=l.message,
            original_line=l.original_line,
            parsed=l.parsed
        )
        for l in logs
    ]
    computed = compute_analysis_metrics(dummy_records)

    total = analysis.total_records or 1
    err_pct = round(((analysis.error_count + analysis.critical_count) / total) * 100.0, 2)

    return AnalysisDetailResponse(
        id=analysis.id,
        filename=analysis.filename,
        file_hash=analysis.file_hash,
        file_size=analysis.file_size,
        detected_format=analysis.detected_format,
        created_at=analysis.created_at,
        total_records=analysis.total_records,
        parsed_records=analysis.parsed_records,
        unparsed_records=analysis.unparsed_records,
        critical_count=analysis.critical_count,
        error_count=analysis.error_count,
        warning_count=analysis.warning_count,
        info_count=analysis.info_count,
        debug_count=analysis.debug_count,
        unknown_count=analysis.unknown_count,
        status=analysis.status,
        first_timestamp=analysis.first_timestamp,
        last_timestamp=analysis.last_timestamp,
        error_percentage=err_pct,
        severity_distribution=computed["severity_distribution"],
        timeline=computed["timeline"],
        top_patterns=pattern_responses,
        top_categories=computed["top_categories"],
    )


@router.get("/{analysis_id}/logs", response_model=PaginatedLogResponse)
def get_analysis_logs(
    analysis_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    search: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    """Returns paginated, searchable, and filtered log records."""
    # Verify analysis exists
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis with ID '{analysis_id}' was not found."
        )

    query = db.query(LogEntry).filter(LogEntry.analysis_id == analysis_id)

    if severity and severity.upper() != "ALL":
        query = query.filter(LogEntry.severity == severity.upper())

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            (LogEntry.message.ilike(search_term)) |
            (LogEntry.source.ilike(search_term)) |
            (LogEntry.original_line.ilike(search_term))
        )

    # Sort
    order_func = asc if sort_order == "asc" else desc
    query = query.order_by(order_func(LogEntry.id))

    total = query.count()
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    offset = (page - 1) * page_size

    logs = query.offset(offset).limit(page_size).all()
    items = [LogEntryResponse.model_validate(l) for l in logs]

    return PaginatedLogResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        items=items
    )


@router.get("/{analysis_id}/patterns", response_model=List[ErrorPatternResponse])
def get_analysis_patterns(
    analysis_id: str,
    db: Session = Depends(get_db)
):
    """Returns recurring error patterns for the specified analysis."""
    patterns = (
        db.query(ErrorPattern)
        .filter(ErrorPattern.analysis_id == analysis_id)
        .order_by(desc(ErrorPattern.occurrence_count))
        .all()
    )
    return [ErrorPatternResponse.model_validate(p) for p in patterns]


@router.delete("/{analysis_id}", status_code=status.HTTP_200_OK)
def delete_analysis(
    analysis_id: str,
    db: Session = Depends(get_db)
):
    """Deletes an analysis and cascades deletion to all associated logs and error patterns."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis with ID '{analysis_id}' was not found."
        )

    db.delete(analysis)
    db.commit()
    return {"message": f"Analysis '{analysis_id}' and all associated records have been permanently deleted."}
