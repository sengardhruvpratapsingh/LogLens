import pytest
from datetime import datetime
from backend.app.services.parser import (
    parse_log_content,
    detect_format,
    parse_timestamp_str,
)
from backend.app.services.classifier import normalize_severity, classify_severity_from_text


def test_timestamp_parsing():
    assert parse_timestamp_str("2026-11-17 10:30:00") == datetime(2026, 11, 17, 10, 30, 0)
    assert parse_timestamp_str("2026-11-17 10:30:00,123") == datetime(2026, 11, 17, 10, 30, 0, 123000)
    assert parse_timestamp_str("2026-11-17T10:30:00Z") == datetime(2026, 11, 17, 10, 30, 0)
    assert parse_timestamp_str("invalid_date") is None


def test_severity_classifier():
    assert normalize_severity("FATAL") == "CRITICAL"
    assert normalize_severity("error") == "ERROR"
    assert normalize_severity("warn") == "WARNING"
    assert normalize_severity("info") == "INFO"
    assert normalize_severity("trace") == "DEBUG"
    assert normalize_severity("nonexistent") == "UNKNOWN"

    # Contextual classification
    assert classify_severity_from_text("2026-11-17 10:00:00 [ERROR] something failed") == "ERROR"
    assert classify_severity_from_text("User with 0 errors completed step") == "UNKNOWN"
    assert classify_severity_from_text("Traceback (most recent call last):") == "ERROR"


def test_python_log_parsing_with_traceback():
    raw_log = """2026-11-17 08:00:12,102 [INFO] app.main: Starting LogLens Application Service
2026-11-17 08:04:02,118 [ERROR] app.database: Database connection failed during transaction commit
Traceback (most recent call last):
  File "/app/services/db.py", line 142, in execute_transaction
    connection.commit()
sqlite3.OperationalError: database is locked
2026-11-17 08:05:00,000 [DEBUG] app.worker: Thread pool active
"""
    fmt, records = parse_log_content(raw_log)
    assert fmt == "python"
    assert len(records) == 3
    assert records[0].severity == "INFO"
    assert records[1].severity == "ERROR"
    assert "sqlite3.OperationalError: database is locked" in records[1].message
    assert records[2].severity == "DEBUG"


def test_server_log_parsing():
    raw_log = """192.168.1.10 - - [17/Nov/2026:08:00:10 +0000] "GET /api/v1/health HTTP/1.1" 200 128 "-" "Go-http-client/1.1"
192.168.1.99 - - [17/Nov/2026:08:05:01 +0000] "GET /admin/login HTTP/1.1" 404 162 "-" "curl/7.88.1"
192.168.1.80 - - [17/Nov/2026:08:06:15 +0000] "POST /api/v1/upload HTTP/1.1" 500 241 "https://loglens.dev" "Mozilla/5.0"
2026/11/17 08:08:20 [crit] 14210#0: *8842 connect() to unix:/var/run/pdf-service.sock failed
"""
    fmt, records = parse_log_content(raw_log)
    assert fmt == "server"
    assert len(records) == 4
    assert records[0].severity == "INFO"
    assert records[1].severity == "WARNING"  # 404
    assert records[2].severity == "ERROR"    # 500
    assert records[3].severity == "CRITICAL"


def test_jsonl_log_parsing():
    raw_log = """{"timestamp":"2026-11-17T09:00:01Z","level":"INFO","message":"Service started","source":"gateway"}
{"timestamp":"2026-11-17T09:03:10Z","level":"ERROR","message":"External billing 502","source":"billing"}
{"this is not json": true, malformed json here...
"""
    fmt, records = parse_log_content(raw_log)
    assert fmt == "jsonl"
    assert len(records) == 3
    assert records[0].severity == "INFO"
    assert records[1].severity == "ERROR"
    # Third line is malformed, preserved via generic fallback
    assert records[2].original_line.startswith("{\"this is not json\"")
    assert records[2].parsed is False or records[2].severity == "UNKNOWN"


def test_generic_fallback_parser():
    raw_log = """Random log message without standard structure
Another line [WARN] memory threshold reached
Third unformatted line
"""
    fmt, records = parse_log_content(raw_log)
    assert fmt == "generic"
    assert len(records) == 3
    assert records[0].severity == "UNKNOWN"
    assert records[1].severity == "WARNING"
    assert records[2].severity == "UNKNOWN"
