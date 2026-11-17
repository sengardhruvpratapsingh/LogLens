from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.analysis import Analysis
from backend.app.models.log_entry import LogEntry
from backend.app.models.error_pattern import ErrorPattern
from backend.app.services.export_service import (
    generate_csv_export,
    generate_json_export,
    generate_txt_report,
)

router = APIRouter(prefix="/analyses", tags=["Export"])


@router.get("/{analysis_id}/export/csv")
def export_csv(analysis_id: str, db: Session = Depends(get_db)):
    """Downloads all log records of the analysis as CSV."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis with ID '{analysis_id}' was not found."
        )

    logs = db.query(LogEntry).filter(LogEntry.analysis_id == analysis_id).order_by(LogEntry.id.asc()).all()
    csv_content = generate_csv_export(analysis, logs)

    filename = f"loglens_{analysis.filename.replace('.', '_')}_{analysis_id[:8]}.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@router.get("/{analysis_id}/export/json")
def export_json(analysis_id: str, db: Session = Depends(get_db)):
    """Downloads structured analysis JSON report."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis with ID '{analysis_id}' was not found."
        )

    logs = db.query(LogEntry).filter(LogEntry.analysis_id == analysis_id).order_by(LogEntry.id.asc()).all()
    patterns = db.query(ErrorPattern).filter(ErrorPattern.analysis_id == analysis_id).order_by(ErrorPattern.occurrence_count.desc()).all()

    json_content = generate_json_export(analysis, logs, patterns)

    filename = f"loglens_{analysis.filename.replace('.', '_')}_{analysis_id[:8]}.json"
    return Response(
        content=json_content,
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@router.get("/{analysis_id}/export/txt")
def export_txt(analysis_id: str, db: Session = Depends(get_db)):
    """Downloads human-readable diagnostic text report."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis with ID '{analysis_id}' was not found."
        )

    logs = db.query(LogEntry).filter(LogEntry.analysis_id == analysis_id).order_by(LogEntry.id.asc()).all()
    patterns = db.query(ErrorPattern).filter(ErrorPattern.analysis_id == analysis_id).order_by(ErrorPattern.occurrence_count.desc()).all()

    txt_content = generate_txt_report(analysis, logs, patterns)

    filename = f"loglens_report_{analysis.filename.replace('.', '_')}_{analysis_id[:8]}.txt"
    return Response(
        content=txt_content,
        media_type="text/plain; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
