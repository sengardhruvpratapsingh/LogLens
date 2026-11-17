import csv
import json
import io
from datetime import datetime
from typing import List
from backend.app.models.analysis import Analysis
from backend.app.models.log_entry import LogEntry
from backend.app.models.error_pattern import ErrorPattern


def generate_csv_export(analysis: Analysis, logs: List[LogEntry]) -> str:
    """
    Generates CSV content of all log records in the analysis.
    """
    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)
    
    # Header
    writer.writerow(["Index", "Timestamp", "Severity", "Source", "Message", "Parsed"])
    
    for idx, entry in enumerate(logs, 1):
        ts_str = entry.timestamp.strftime("%Y-%m-%d %H:%M:%S") if entry.timestamp else ""
        writer.writerow([
            idx,
            ts_str,
            entry.severity,
            entry.source,
            entry.message,
            "Yes" if entry.parsed else "No"
        ])
        
    return output.getvalue()


def generate_json_export(analysis: Analysis, logs: List[LogEntry], patterns: List[ErrorPattern]) -> str:
    """
    Generates a structured JSON report containing analysis metadata,
    recurring patterns, and all log entries.
    """
    data = {
        "analysis_id": analysis.id,
        "filename": analysis.filename,
        "file_hash": analysis.file_hash,
        "file_size_bytes": analysis.file_size,
        "detected_format": analysis.detected_format,
        "created_at": analysis.created_at.isoformat() if analysis.created_at else None,
        "time_range": {
            "first_timestamp": analysis.first_timestamp.isoformat() if analysis.first_timestamp else None,
            "last_timestamp": analysis.last_timestamp.isoformat() if analysis.last_timestamp else None,
        },
        "summary": {
            "total_records": analysis.total_records,
            "parsed_records": analysis.parsed_records,
            "unparsed_records": analysis.unparsed_records,
            "critical_count": analysis.critical_count,
            "error_count": analysis.error_count,
            "warning_count": analysis.warning_count,
            "info_count": analysis.info_count,
            "debug_count": analysis.debug_count,
            "unknown_count": analysis.unknown_count,
            "error_percentage": round(
                ((analysis.error_count + analysis.critical_count) / analysis.total_records * 100.0)
                if analysis.total_records else 0.0, 2
            ),
            "status": analysis.status,
        },
        "recurring_error_patterns": [
            {
                "id": p.id,
                "pattern": p.normalized_message,
                "original_example": p.original_message,
                "severity": p.severity,
                "occurrences": p.occurrence_count,
                "first_seen": p.first_occurrence.isoformat() if p.first_occurrence else None,
                "last_seen": p.last_occurrence.isoformat() if p.last_occurrence else None,
            }
            for p in patterns
        ],
        "logs": [
            {
                "id": entry.id,
                "timestamp": entry.timestamp.isoformat() if entry.timestamp else None,
                "severity": entry.severity,
                "source": entry.source,
                "message": entry.message,
                "parsed": entry.parsed,
            }
            for entry in logs
        ]
    }
    return json.dumps(data, indent=2)


def generate_txt_report(analysis: Analysis, logs: List[LogEntry], patterns: List[ErrorPattern]) -> str:
    """
    Generates a clean human-readable diagnostic text report.
    """
    total = analysis.total_records or 1
    err_total = analysis.error_count + analysis.critical_count
    err_pct = round((err_total / total) * 100.0, 2)
    created_str = analysis.created_at.strftime("%Y-%m-%d %H:%M:%S UTC") if analysis.created_at else "N/A"
    ts_start = analysis.first_timestamp.strftime("%Y-%m-%d %H:%M:%S") if analysis.first_timestamp else "N/A"
    ts_end = analysis.last_timestamp.strftime("%Y-%m-%d %H:%M:%S") if analysis.last_timestamp else "N/A"

    lines = [
        "=" * 80,
        " LOGLENS DIAGNOSTIC ANALYSIS REPORT",
        "=" * 80,
        f" Report Generated : {created_str}",
        f" Analysis ID      : {analysis.id}",
        f" Target File      : {analysis.filename}",
        f" File Hash (SHA256: {analysis.file_hash}",
        f" File Size        : {analysis.file_size:,} bytes",
        f" Detected Format  : {analysis.detected_format.upper()}",
        f" Time Range       : {ts_start} -> {ts_end}",
        "-" * 80,
        " EXECUTIVE SUMMARY",
        "-" * 80,
        f" Total Log Records: {analysis.total_records:,}",
        f" Parsed Records   : {analysis.parsed_records:,} ({round(analysis.parsed_records / total * 100, 1)}%)",
        f" Unparsed Records : {analysis.unparsed_records:,} ({round(analysis.unparsed_records / total * 100, 1)}%)",
        f" Failure Rate     : {err_pct}% (Errors + Criticals)",
        "",
        " SEVERITY BREAKDOWN:",
        f"  [CRITICAL] : {analysis.critical_count:,} ({round(analysis.critical_count / total * 100, 1)}%)",
        f"  [ERROR]    : {analysis.error_count:,} ({round(analysis.error_count / total * 100, 1)}%)",
        f"  [WARNING]  : {analysis.warning_count:,} ({round(analysis.warning_count / total * 100, 1)}%)",
        f"  [INFO]     : {analysis.info_count:,} ({round(analysis.info_count / total * 100, 1)}%)",
        f"  [DEBUG]    : {analysis.debug_count:,} ({round(analysis.debug_count / total * 100, 1)}%)",
        f"  [UNKNOWN]  : {analysis.unknown_count:,} ({round(analysis.unknown_count / total * 100, 1)}%)",
        "-" * 80,
        f" RECURRING ERROR PATTERNS ({len(patterns)} DETECTED)",
        "-" * 80,
    ]

    if not patterns:
        lines.append("  No repeated error patterns detected in this log dataset.")
    else:
        for idx, p in enumerate(patterns, 1):
            p_first = p.first_occurrence.strftime("%Y-%m-%d %H:%M:%S") if p.first_occurrence else "N/A"
            p_last = p.last_occurrence.strftime("%Y-%m-%d %H:%M:%S") if p.last_occurrence else "N/A"
            lines.extend([
                f" [{idx}] Occurrences: {p.occurrence_count}x | Severity: {p.severity}",
                f"     Pattern   : {p.normalized_message}",
                f"     First Seen: {p_first}",
                f"     Last Seen : {p_last}",
                f"     Example   : {p.original_message[:120]}...",
                ""
            ])

    lines.extend([
        "-" * 80,
        " CRITICAL & ERROR LOG SAMPLES",
        "-" * 80,
    ])

    err_logs = [log for log in logs if log.severity in ("CRITICAL", "ERROR")]
    if not err_logs:
        lines.append("  No error or critical entries found.")
    else:
        for log in err_logs[:15]:
            ts_label = log.timestamp.strftime("%Y-%m-%d %H:%M:%S") if log.timestamp else "NO_TIMESTAMP"
            lines.append(f"  [{ts_label}] [{log.severity}] ({log.source}):")
            for subline in log.message.splitlines():
                lines.append(f"    {subline}")
            lines.append("")

    lines.extend([
        "=" * 80,
        " END OF LOGLENS REPORT — https://github.com/placeholder/loglens",
        "=" * 80,
    ])

    return "\n".join(lines)
