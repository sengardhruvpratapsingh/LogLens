import hashlib
import json
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.database.session import get_db
from backend.app.models.analysis import Analysis
from backend.app.models.log_entry import LogEntry
from backend.app.models.error_pattern import ErrorPattern
from backend.app.schemas.analysis import AnalysisSummaryResponse
from backend.app.utils.security import sanitize_filename, validate_file_content
from backend.app.services.parser import parse_log_content
from backend.app.services.pattern_detector import detect_error_patterns
from backend.app.services.analyzer import compute_analysis_metrics
from backend.app.api.endpoints.samples import SAMPLE_DEFINITIONS

router = APIRouter(prefix="/analyze", tags=["Analyze"])


def process_and_save_analysis(
    filename: str,
    content_bytes: bytes,
    db: Session
) -> Analysis:
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    is_valid, decoded_text, err_msg = validate_file_content(content_bytes, max_bytes)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err_msg)

    file_hash = hashlib.sha256(content_bytes).hexdigest()
    safe_name = sanitize_filename(filename)

    # Parse content
    detected_format, parsed_records = parse_log_content(decoded_text)
    if not parsed_records:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file contains no readable log records."
        )

    # Compute metrics & patterns
    metrics = compute_analysis_metrics(parsed_records)
    patterns = detect_error_patterns(parsed_records)

    # Create Analysis record
    analysis = Analysis(
        filename=safe_name,
        file_hash=file_hash,
        file_size=len(content_bytes),
        detected_format=detected_format,
        total_records=metrics["total_records"],
        parsed_records=metrics["parsed_records"],
        unparsed_records=metrics["unparsed_records"],
        critical_count=metrics["critical_count"],
        error_count=metrics["error_count"],
        warning_count=metrics["warning_count"],
        info_count=metrics["info_count"],
        debug_count=metrics["debug_count"],
        unknown_count=metrics["unknown_count"],
        first_timestamp=metrics["first_timestamp"],
        last_timestamp=metrics["last_timestamp"],
        status="COMPLETED"
    )
    db.add(analysis)
    db.flush()  # Populates analysis.id

    # Add Error Patterns
    for p in patterns:
        db.add(ErrorPattern(
            analysis_id=analysis.id,
            normalized_message=p.normalized_message,
            original_message=p.original_message,
            severity=p.severity,
            occurrence_count=p.occurrence_count,
            first_occurrence=p.first_occurrence,
            last_occurrence=p.last_occurrence
        ))

    # Add Log Entries in bulk
    log_entities = []
    for r in parsed_records:
        log_entities.append(LogEntry(
            analysis_id=analysis.id,
            timestamp=r.timestamp,
            severity=r.severity,
            source=r.source,
            message=r.message,
            original_line=r.original_line,
            parsed=r.parsed,
            metadata_json=json.dumps(r.metadata) if r.metadata else None
        ))
    db.bulk_save_objects(log_entities)

    db.commit()
    db.refresh(analysis)
    return analysis


@router.post("", response_model=AnalysisSummaryResponse, status_code=status.HTTP_201_CREATED)
async def analyze_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Accepts multipart file upload, validates extension, size, and content,
    performs complete log analysis, and stores the results.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is missing."
        )

    ext = Path(file.filename).suffix.lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Supported formats: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    content_bytes = await file.read()
    analysis = process_and_save_analysis(file.filename, content_bytes, db)

    total = analysis.total_records or 1
    err_pct = round(((analysis.error_count + analysis.critical_count) / total) * 100.0, 2)

    res = AnalysisSummaryResponse.model_validate(analysis)
    res.error_percentage = err_pct
    return res


@router.post("/sample/{sample_id}", response_model=AnalysisSummaryResponse, status_code=status.HTTP_201_CREATED)
def analyze_sample_log(
    sample_id: str,
    db: Session = Depends(get_db)
):
    """
    Triggers analysis of a preloaded sample log file from the project.
    """
    target_sample = next((s for s in SAMPLE_DEFINITIONS if s["id"] == sample_id), None)
    if not target_sample:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sample '{sample_id}' not found. Available samples: {', '.join(s['id'] for s in SAMPLE_DEFINITIONS)}"
        )

    sample_path = Path(settings.SAMPLE_DATA_DIR) / target_sample["filename"]
    if not sample_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sample file '{target_sample['filename']}' could not be located on disk."
        )

    with open(sample_path, "rb") as f:
        content_bytes = f.read()

    analysis = process_and_save_analysis(target_sample["filename"], content_bytes, db)

    total = analysis.total_records or 1
    err_pct = round(((analysis.error_count + analysis.critical_count) / total) * 100.0, 2)

    res = AnalysisSummaryResponse.model_validate(analysis)
    res.error_percentage = err_pct
    return res
