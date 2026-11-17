import pandas as pd
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from collections import Counter
from backend.app.services.parser import ParsedRecord
from backend.app.schemas.analysis import (
    SeverityDistribution,
    TimelinePoint,
    TopErrorCategory,
)


def categorize_error(message: str) -> str:
    msg_lower = message.lower()
    if any(k in msg_lower for k in ("db", "database", "sql", "sqlite", "postgres", "mysql", "pdo", "commit", "transaction", "pool")):
        return "Database"
    if any(k in msg_lower for k in ("http", "gateway", "502", "500", "503", "404", "401", "403", "socket", "timeout", "network", "connect")):
        return "Network & HTTP"
    if any(k in msg_lower for k in ("auth", "token", "jwt", "permission", "forbidden", "unauthorized", "session", "credential")):
        return "Authentication & Security"
    if any(k in msg_lower for k in ("memory", "oom", "sigsegv", "disk", "cpu", "kernel", "resource", "allocate")):
        return "System & Resource"
    if any(k in msg_lower for k in ("file", "corrupt", "header", "magic", "directory", "path", "ioerror", "filenotfound")):
        return "File & Storage"
    return "Application Logic"


def compute_analysis_metrics(records: List[ParsedRecord]) -> Dict[str, Any]:
    """
    Computes statistical metrics, severity distribution, timeline activity,
    and category breakdowns for the given parsed records.
    """
    total = len(records)
    if total == 0:
        return {
            "total_records": 0,
            "parsed_records": 0,
            "unparsed_records": 0,
            "critical_count": 0,
            "error_count": 0,
            "warning_count": 0,
            "info_count": 0,
            "debug_count": 0,
            "unknown_count": 0,
            "error_percentage": 0.0,
            "first_timestamp": None,
            "last_timestamp": None,
            "severity_distribution": SeverityDistribution(),
            "timeline": [],
            "top_categories": [],
        }

    # Count by severity
    sev_counts = Counter(r.severity for r in records)
    crit_c = sev_counts.get("CRITICAL", 0)
    err_c = sev_counts.get("ERROR", 0)
    warn_c = sev_counts.get("WARNING", 0)
    info_c = sev_counts.get("INFO", 0)
    deb_c = sev_counts.get("DEBUG", 0)
    unk_c = sev_counts.get("UNKNOWN", 0)

    parsed_c = sum(1 for r in records if r.parsed)
    unparsed_c = total - parsed_c
    error_pct = round(((err_c + crit_c) / total) * 100.0, 2) if total > 0 else 0.0

    # Timestamps
    timestamps = [r.timestamp for r in records if r.timestamp is not None]
    first_ts = min(timestamps) if timestamps else None
    last_ts = max(timestamps) if timestamps else None

    # Severity distribution
    sev_dist = SeverityDistribution(
        critical=crit_c,
        error=err_c,
        warning=warn_c,
        info=info_c,
        debug=deb_c,
        unknown=unk_c,
        percentages={
            "CRITICAL": round((crit_c / total) * 100.0, 1) if total else 0.0,
            "ERROR": round((err_c / total) * 100.0, 1) if total else 0.0,
            "WARNING": round((warn_c / total) * 100.0, 1) if total else 0.0,
            "INFO": round((info_c / total) * 100.0, 1) if total else 0.0,
            "DEBUG": round((deb_c / total) * 100.0, 1) if total else 0.0,
            "UNKNOWN": round((unk_c / total) * 100.0, 1) if total else 0.0,
        }
    )

    # Timeline aggregation
    timeline: List[TimelinePoint] = []
    if timestamps and len(timestamps) > 0:
        # Determine appropriate bucket resolution
        time_span_seconds = (last_ts - first_ts).total_seconds() if (last_ts and first_ts) else 0

        # Build list of rows with timestamp and severity
        data = []
        for r in records:
            if r.timestamp:
                data.append({"ts": r.timestamp, "sev": r.severity})

        if data:
            df = pd.DataFrame(data)
            # Decide resampling frequency
            if time_span_seconds <= 3600:  # <= 1 hour -> 1 minute or 5 minute
                freq = "1min" if time_span_seconds <= 600 else "5min"
            elif time_span_seconds <= 86400:  # <= 24 hours -> 15 min or 1 hour
                freq = "30min" if time_span_seconds <= 21600 else "1h"
            else:
                freq = "1D"

            try:
                df["time_bucket"] = df["ts"].dt.floor(freq)
                grouped = df.groupby(["time_bucket", "sev"]).size().unstack(fill_value=0)

                for t_bucket, row in grouped.iterrows():
                    b_crit = int(row.get("CRITICAL", 0))
                    b_err = int(row.get("ERROR", 0))
                    b_warn = int(row.get("WARNING", 0))
                    b_info = int(row.get("INFO", 0))
                    b_deb = int(row.get("DEBUG", 0))
                    b_total = b_crit + b_err + b_warn + b_info + b_deb + int(row.get("UNKNOWN", 0))

                    # Format label
                    label = t_bucket.strftime("%H:%M:%S" if time_span_seconds <= 86400 else "%Y-%m-%d %H:%M")
                    timeline.append(TimelinePoint(
                        timestamp=label,
                        total=b_total,
                        error=b_err,
                        warning=b_warn,
                        info=b_info,
                        critical=b_crit,
                        debug=b_deb
                    ))
            except Exception:
                # Fallback simple timeline
                pass

    # Top Error Categories
    error_records = [r for r in records if r.severity in ("ERROR", "CRITICAL")]
    categories_counter = Counter(categorize_error(r.message) for r in error_records)
    total_errors = len(error_records)

    top_categories: List[TopErrorCategory] = []
    for cat, count in categories_counter.most_common(5):
        top_categories.append(TopErrorCategory(
            category=cat,
            count=count,
            percentage=round((count / total_errors) * 100.0, 1) if total_errors else 0.0
        ))

    return {
        "total_records": total,
        "parsed_records": parsed_c,
        "unparsed_records": unparsed_c,
        "critical_count": crit_c,
        "error_count": err_c,
        "warning_count": warn_c,
        "info_count": info_c,
        "debug_count": deb_c,
        "unknown_count": unk_c,
        "error_percentage": error_pct,
        "first_timestamp": first_ts,
        "last_timestamp": last_ts,
        "severity_distribution": sev_dist,
        "timeline": timeline,
        "top_categories": top_categories,
    }
