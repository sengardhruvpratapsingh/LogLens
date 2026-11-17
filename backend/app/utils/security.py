import re
import os
from pathlib import Path
from typing import Tuple


# Safe filename sanitization
def sanitize_filename(filename: str) -> str:
    """
    Sanitizes an uploaded filename to prevent directory traversal and illegal characters.
    """
    if not filename:
        return "unnamed_log.log"
    # Extract only the base name (prevents ../ or path injection)
    base = os.path.basename(filename)
    # Remove null bytes or non-printable characters
    cleaned = re.sub(r'[^\w\.\-\_ ]', '_', base).strip()
    if not cleaned or cleaned.startswith('.'):
        cleaned = f"log_{cleaned.lstrip('.')}" if cleaned.lstrip('.') else "unnamed_log.log"
    return cleaned[:150]


# Secret redaction patterns
REDACTION_PATTERNS = [
    # Authorization: Bearer <token>
    (re.compile(r'(Bearer\s+)[a-zA-Z0-9_\-\.]{12,}', re.IGNORECASE), r'\1[REDACTED_BEARER_TOKEN]'),
    # Basic auth / URI credentials: scheme://user:password@
    (re.compile(r'([a-zA-Z0-9\+\.\-]+://[^:\s@]+:)[^@\s]+(@)', re.IGNORECASE), r'\1[REDACTED_PASSWORD]\2'),
    # Common token / key assignments: api_key = "...", secret: '...', password: ...
    (
        re.compile(
            r'(["\']?(?:api[_-]?key|access[_-]?token|auth[_-]?token|secret|password|passwd|private[_-]?key)["\']?\s*[:=]\s*["\']?)([\w\-\.\+\/]{8,})(["\']?)',
            re.IGNORECASE
        ),
        r'\1[REDACTED_CREDENTIAL]\3'
    ),
    # JWT tokens: eyJ...
    (
        re.compile(r'eyJ[a-zA-Z0-9_\-]{10,}\.eyJ[a-zA-Z0-9_\-]{10,}\.[a-zA-Z0-9_\-]{10,}'),
        '[REDACTED_JWT_TOKEN]'
    ),
    # AWS access key format
    (re.compile(r'(AKIA[0-9A-Z]{16})'), '[REDACTED_AWS_KEY]'),
]


def redact_secrets(text: str) -> str:
    """
    Redacts sensitive credentials, tokens, and passwords from log message strings.
    """
    if not text:
        return text
    redacted = text
    for pattern, replacement in REDACTION_PATTERNS:
        redacted = pattern.sub(replacement, redacted)
    return redacted


def validate_file_content(content_bytes: bytes, max_size_bytes: int) -> Tuple[bool, str, str]:
    """
    Validates uploaded file bytes:
    1. Size limit
    2. Null byte check
    3. Decoding to string (UTF-8 with fallback to Latin-1)
    Returns: (is_valid, decoded_text_or_error, error_message)
    """
    if len(content_bytes) == 0:
        return False, "", "File is empty."

    if len(content_bytes) > max_size_bytes:
        return False, "", f"File size ({len(content_bytes) / (1024 * 1024):.2f}MB) exceeds maximum allowed limit ({max_size_bytes / (1024 * 1024):.1f}MB)."

    # Null byte check (potential binary / executable)
    if b'\x00' in content_bytes[:1024]:
        return False, "", "File appears to be binary or contains illegal null bytes. Only text log files are allowed."

    # Decode safely
    try:
        text = content_bytes.decode('utf-8')
    except UnicodeDecodeError:
        try:
            text = content_bytes.decode('latin-1')
        except Exception as e:
            return False, "", f"Unable to decode file content: {str(e)}"

    return True, text, ""
