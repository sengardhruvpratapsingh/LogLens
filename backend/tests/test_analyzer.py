from datetime import datetime
from backend.app.services.parser import ParsedRecord
from backend.app.services.analyzer import compute_analysis_metrics, categorize_error


def test_compute_analysis_metrics_empty():
    metrics = compute_analysis_metrics([])
    assert metrics["total_records"] == 0
    assert metrics["error_percentage"] == 0.0
    assert metrics["first_timestamp"] is None
    assert len(metrics["timeline"]) == 0


def test_compute_analysis_metrics_calculations():
    records = [
        ParsedRecord(
            timestamp=datetime(2026, 11, 17, 8, 0, 0),
            severity="CRITICAL",
            source="system",
            message="Out of memory",
            original_line="...",
            parsed=True
        ),
        ParsedRecord(
            timestamp=datetime(2026, 11, 17, 8, 5, 0),
            severity="ERROR",
            source="database",
            message="SQL lock timeout in transaction",
            original_line="...",
            parsed=True
        ),
        ParsedRecord(
            timestamp=datetime(2026, 11, 17, 8, 10, 0),
            severity="WARNING",
            source="cache",
            message="Cache miss rate high",
            original_line="...",
            parsed=True
        ),
        ParsedRecord(
            timestamp=datetime(2026, 11, 17, 8, 15, 0),
            severity="INFO",
            source="api",
            message="Request processed",
            original_line="...",
            parsed=True
        ),
    ]

    metrics = compute_analysis_metrics(records)
    assert metrics["total_records"] == 4
    assert metrics["critical_count"] == 1
    assert metrics["error_count"] == 1
    assert metrics["warning_count"] == 1
    assert metrics["info_count"] == 1
    assert metrics["error_percentage"] == 50.0  # (1 crit + 1 err) / 4 * 100
    assert metrics["first_timestamp"] == datetime(2026, 11, 17, 8, 0, 0)
    assert metrics["last_timestamp"] == datetime(2026, 11, 17, 8, 15, 0)

    # Top categories
    cats = {c.category: c.count for c in metrics["top_categories"]}
    assert cats.get("System & Resource") == 1
    assert cats.get("Database") == 1
