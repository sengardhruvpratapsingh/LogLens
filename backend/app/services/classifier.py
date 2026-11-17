import re

# Canonical severity levels
SEVERITY_LEVELS = ["CRITICAL", "ERROR", "WARNING", "INFO", "DEBUG", "UNKNOWN"]

# Normalization maps
SEVERITY_MAPPINGS = {
    # Critical
    "CRITICAL": "CRITICAL",
    "FATAL": "CRITICAL",
    "EMERGENCY": "CRITICAL",
    "EMERG": "CRITICAL",
    "ALERT": "CRITICAL",
    "PANIC": "CRITICAL",
    "CRIT": "CRITICAL",

    # Error
    "ERROR": "ERROR",
    "EXCEPTION": "ERROR",
    "FAILED": "ERROR",
    "FAILURE": "ERROR",
    "ERR": "ERROR",
    "SEVERE": "ERROR",

    # Warning
    "WARNING": "WARNING",
    "WARN": "WARNING",

    # Info
    "INFO": "INFO",
    "INFORMATION": "INFO",
    "NOTICE": "INFO",

    # Debug
    "DEBUG": "DEBUG",
    "TRACE": "DEBUG",
    "VERBOSE": "DEBUG",

    # Unknown
    "UNKNOWN": "UNKNOWN",
}

# Regex to detect explicit severity token when at start of line or bracketed
SEVERITY_TOKEN_REGEX = re.compile(
    r'\b(CRITICAL|FATAL|EMERGENCY|ALERT|PANIC|CRIT|ERROR|EXCEPTION|FAILED|FAILURE|ERR|SEVERE|WARNING|WARN|INFO|INFORMATION|NOTICE|DEBUG|TRACE|VERBOSE)\b',
    re.IGNORECASE
)


def normalize_severity(raw: str) -> str:
    """Normalizes raw level string to canonical level."""
    if not raw:
        return "UNKNOWN"
    clean = raw.strip().upper()
    return SEVERITY_MAPPINGS.get(clean, "UNKNOWN")


def classify_severity_from_text(text: str) -> str:
    """
    Extracts severity only when reliably identifiable (e.g. bracketed or explicit token).
    Avoids false positives like '0 errors found'.
    """
    if not text:
        return "UNKNOWN"

    # Check for bracketed or prefixed levels first: [ERROR], [WARN], ERROR:, etc.
    bracketed = re.search(r'\[(CRITICAL|FATAL|ALERT|ERROR|WARN|WARNING|INFO|DEBUG|TRACE)\]', text, re.IGNORECASE)
    if bracketed:
        return normalize_severity(bracketed.group(1))

    prefixed = re.search(r'^(?:[\d\-\:\.\s,T\+Z]+)?\s*(CRITICAL|FATAL|ALERT|ERROR|WARN|WARNING|INFO|DEBUG|TRACE)[:\s]', text, re.IGNORECASE)
    if prefixed:
        return normalize_severity(prefixed.group(1))

    # Check for explicit Python Traceback
    if "traceback (most recent call last):" in text.lower():
        return "ERROR"

    return "UNKNOWN"
