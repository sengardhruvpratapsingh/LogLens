from datetime import datetime
from backend.app.services.parser import ParsedRecord
from backend.app.services.pattern_detector import (
    normalize_error_message,
    detect_error_patterns,
)


def test_normalize_error_message():
    msg1 = "Connection failed to host 192.168.1.50:8080 for user usr_94821"
    norm1 = normalize_error_message(msg1)
    assert "<IP>" in norm1
    assert "<ID>" in norm1
    assert "192.168.1.50" not in norm1

    msg2 = "Transaction c56a4180-65aa-42ec-a945-5fd21dec0538 failed with status 500"
    norm2 = normalize_error_message(msg2)
    assert "<UUID>" in norm2
    assert "c56a4180" not in norm2


def test_detect_error_patterns_grouping():
    records = [
        ParsedRecord(
            timestamp=datetime(2026, 11, 17, 8, 0, 0),
            severity="ERROR",
            source="db",
            message="Database connection failed: retry timeout",
            original_line="...",
            parsed=True
        ),
        ParsedRecord(
            timestamp=datetime(2026, 11, 17, 8, 2, 0),
            severity="INFO",
            source="api",
            message="Health check ok",
            original_line="...",
            parsed=True
        ),
        ParsedRecord(
            timestamp=datetime(2026, 11, 17, 8, 5, 0),
            severity="ERROR",
            source="db",
            message="Database connection failed: retry timeout",
            original_line="...",
            parsed=True
        ),
        ParsedRecord(
            timestamp=datetime(2026, 11, 17, 8, 10, 0),
            severity="ERROR",
            source="gateway",
            message="Gateway timeout from Stripe: request_id=req_12345",
            original_line="...",
            parsed=True
        ),
        ParsedRecord(
            timestamp=datetime(2026, 11, 17, 8, 15, 0),
            severity="ERROR",
            source="gateway",
            message="Gateway timeout from Stripe: request_id=req_67890",
            original_line="...",
            parsed=True
        ),
        ParsedRecord(
            timestamp=datetime(2026, 11, 17, 8, 20, 0),
            severity="ERROR",
            source="db",
            message="Database connection failed: retry timeout",
            original_line="...",
            parsed=True
        ),
    ]

    patterns = detect_error_patterns(records)
    assert len(patterns) == 2

    # Most frequent pattern should be first
    top = patterns[0]
    assert "Database connection failed" in top.normalized_message
    assert top.occurrence_count == 3
    assert top.first_occurrence == datetime(2026, 11, 17, 8, 0, 0)
    assert top.last_occurrence == datetime(2026, 11, 17, 8, 20, 0)

    # Second pattern normalized req_12345 and req_67890 together
    second = patterns[1]
    assert second.occurrence_count == 2
    assert "<ID>" in second.normalized_message
