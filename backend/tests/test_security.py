import pytest
from backend.app.utils.security import (
    sanitize_filename,
    redact_secrets,
    validate_file_content,
)


def test_sanitize_filename():
    assert sanitize_filename("../../../etc/passwd") == "passwd"
    assert sanitize_filename("..\\..\\windows\\system32\\cmd.exe") == "cmd.exe"
    assert sanitize_filename("my log $# file @ test.log") == "my log __ file _ test.log"
    assert sanitize_filename("") == "unnamed_log.log"


def test_secret_redaction():
    # Bearer token
    text1 = "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.signature"
    assert "[REDACTED_BEARER_TOKEN]" in redact_secrets(text1)

    # Database URL with password
    text2 = "Connecting to postgres://admin:super_secret_pw@localhost:5432/db"
    assert "[REDACTED_PASSWORD]" in redact_secrets(text2)

    # API key assignment
    text3 = 'Config: api_key = "abcdef1234567890" initialized'
    assert "[REDACTED_CREDENTIAL]" in redact_secrets(text3)


def test_validate_file_content():
    # Valid text
    valid_bytes = b"2026-11-17 10:00:00 INFO Service up"
    is_valid, decoded, err = validate_file_content(valid_bytes, 1024 * 1024)
    assert is_valid is True
    assert "Service up" in decoded

    # Empty bytes
    is_valid, _, err = validate_file_content(b"", 1024)
    assert is_valid is False
    assert "empty" in err.lower()

    # Oversized
    is_valid, _, err = validate_file_content(b"1234567890", 5)
    assert is_valid is False
    assert "exceeds" in err.lower()

    # Binary with null bytes
    binary_bytes = b"\x00\x01\x02\x03\x00ELFbinaryexecutable"
    is_valid, _, err = validate_file_content(binary_bytes, 1024)
    assert is_valid is False
    assert "binary" in err.lower() or "null bytes" in err.lower()
