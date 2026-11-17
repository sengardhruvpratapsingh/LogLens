import re
from datetime import datetime
from typing import List, Dict, Any, Optional
from collections import defaultdict
from backend.app.services.parser import ParsedRecord


# Normalization patterns
RE_UUID = re.compile(r'\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b')
RE_IP = re.compile(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d+)?\b')
RE_HEX = re.compile(r'\b0x[0-9a-fA-F]+\b')
RE_ISO_TS = re.compile(r'\b\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?\b')
RE_REQ_ID = re.compile(r'\b(?:req|trc|usr|uid|sess|inv|job)_[a-zA-Z0-9_\-]+\b', re.IGNORECASE)
RE_NUMBERS = re.compile(r'(?<=[=:\s#])\d+(?=[,\s\.]|$)')


def normalize_error_message(message: str) -> str:
    """
    Replaces dynamic tokens (UUIDs, IPs, hex addresses, IDs, numbers)
    with normalized placeholders to identify recurring patterns.
    """
    if not message:
        return ""
    # Take first meaningful line of error if multiline
    first_line = message.splitlines()[0].strip()
    
    # Also if line contains a standard Exception, preserve the exception name
    norm = RE_UUID.sub('<UUID>', first_line)
    norm = RE_IP.sub('<IP>', norm)
    norm = RE_HEX.sub('<HEX>', norm)
    norm = RE_ISO_TS.sub('<TIMESTAMP>', norm)
    norm = RE_REQ_ID.sub('<ID>', norm)
    norm = RE_NUMBERS.sub('<NUM>', norm)
    # Collapse multiple whitespaces
    norm = re.sub(r'\s+', ' ', norm).strip()
    return norm


class PatternMatch:
    def __init__(self, normalized_message: str, original_message: str, severity: str):
        self.normalized_message = normalized_message
        self.original_message = original_message
        self.severity = severity
        self.occurrence_count = 0
        self.first_occurrence: Optional[datetime] = None
        self.last_occurrence: Optional[datetime] = None

    def add_occurrence(self, dt: Optional[datetime]):
        self.occurrence_count += 1
        if dt:
            if self.first_occurrence is None or dt < self.first_occurrence:
                self.first_occurrence = dt
            if self.last_occurrence is None or dt > self.last_occurrence:
                self.last_occurrence = dt


def detect_error_patterns(records: List[ParsedRecord]) -> List[PatternMatch]:
    """
    Scans parsed records for ERROR and CRITICAL entries,
    normalizes dynamic variables, and groups them into ranked recurring patterns.
    """
    patterns_map: Dict[str, PatternMatch] = {}

    for record in records:
        if record.severity not in ("ERROR", "CRITICAL"):
            continue

        norm = normalize_error_message(record.message)
        if not norm:
            norm = "Unspecified Error"

        key = f"{record.severity}::{norm}"
        if key not in patterns_map:
            patterns_map[key] = PatternMatch(
                normalized_message=norm,
                original_message=record.message.splitlines()[0],
                severity=record.severity
            )

        patterns_map[key].add_occurrence(record.timestamp)

    # Sort descending by occurrence count
    ranked = sorted(patterns_map.values(), key=lambda p: p.occurrence_count, reverse=True)
    return ranked
