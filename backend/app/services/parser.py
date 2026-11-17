import re
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
from backend.app.services.classifier import normalize_severity, classify_severity_from_text
from backend.app.utils.security import redact_secrets


@dataclass
class ParsedRecord:
    timestamp: Optional[datetime]
    severity: str
    source: str
    message: str
    original_line: str
    parsed: bool = True
    metadata: Dict[str, Any] = field(default_factory=dict)


# Common timestamp formats
DATE_FORMATS = [
    "%Y-%m-%d %H:%M:%S,%f",
    "%Y-%m-%d %H:%M:%S.%f",
    "%Y-%m-%d %H:%M:%S",
    "%Y-%m-%dT%H:%M:%S.%fZ",
    "%Y-%m-%dT%H:%M:%SZ",
    "%Y-%m-%dT%H:%M:%S.%f%z",
    "%Y-%m-%dT%H:%M:%S%z",
    "%Y-%m-%dT%H:%M:%S",
    "%d/%b/%Y:%H:%M:%S %z",
    "%d/%b/%Y:%H:%M:%S",
    "%Y/%m/%d %H:%M:%S",
]


def parse_timestamp_str(ts_str: str) -> Optional[datetime]:
    if not ts_str:
        return None
    clean = ts_str.strip()
    for fmt in DATE_FORMATS:
        try:
            dt = datetime.strptime(clean, fmt)
            if dt.tzinfo is not None:
                dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
            return dt
        except (ValueError, TypeError):
            continue
    # Try ISO fromisoformat
    try:
        dt = datetime.fromisoformat(clean.replace("Z", "+00:00"))
        if dt.tzinfo is not None:
            dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
        return dt
    except Exception:
        pass
    return None


# Regex patterns
RE_PYTHON_LOG_BRACKET = re.compile(
    r'^(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:[,\.]\d{3,6})?)\s+\[([A-Za-z]+)\]\s+([\w\.\-]+)?:\s*(.*)$'
)
RE_PYTHON_LOG_SPACE = re.compile(
    r'^(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:[,\.]\d{3,6})?)\s+([A-Za-z]+)\s+([\w\.\-]+)?(?::\s*|\s+)(.*)$'
)

RE_SERVER_ACCESS = re.compile(
    r'^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+"([A-Z]+)\s+([^\s]+)\s+HTTP\/[\d\.]+"\s+(\d{3})\s+(\d+|-)(?:\s+"([^"]*)"\s+"([^"]*)")?'
)
RE_SERVER_ERROR = re.compile(
    r'^(\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}:\d{2})\s+\[([a-zA-Z]+)\]\s+\d+#\d+:\s*(.*)$'
)


def detect_format(lines: List[str]) -> str:
    """
    Detects the log format based on the first non-empty lines:
    'jsonl', 'python', 'server', or 'generic'.
    """
    json_count = 0
    server_count = 0
    python_count = 0
    checked = 0

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        checked += 1
        if stripped.startswith("{") and stripped.endswith("}"):
            try:
                json.loads(stripped)
                json_count += 1
                continue
            except json.JSONDecodeError:
                pass

        if RE_SERVER_ACCESS.match(stripped) or RE_SERVER_ERROR.match(stripped):
            server_count += 1
            continue

        if RE_PYTHON_LOG_BRACKET.match(stripped) or RE_PYTHON_LOG_SPACE.match(stripped):
            python_count += 1
            continue

        if checked >= 30:
            break

    if checked == 0:
        return "generic"
    if json_count > 0 and json_count >= checked * 0.5:
        return "jsonl"
    if server_count > 0 and server_count >= checked * 0.4:
        return "server"
    if python_count > 0 and python_count >= checked * 0.4:
        return "python"

    return "generic"


def parse_jsonl(lines: List[str]) -> List[ParsedRecord]:
    records: List[ParsedRecord] = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        try:
            data = json.loads(stripped)
            if not isinstance(data, dict):
                records.append(parse_single_generic_line(stripped))
                continue

            # Extract timestamp
            raw_ts = data.get("timestamp") or data.get("time") or data.get("@timestamp") or data.get("datetime")
            ts = parse_timestamp_str(str(raw_ts)) if raw_ts else None

            # Extract severity
            raw_level = data.get("level") or data.get("severity") or data.get("log_level") or data.get("status")
            severity = normalize_severity(str(raw_level)) if raw_level else "UNKNOWN"

            # Extract message
            message = str(data.get("message") or data.get("msg") or data.get("error") or stripped)
            message = redact_secrets(message)

            # Extract source
            source = str(data.get("source") or data.get("service") or data.get("logger") or data.get("app") or "jsonl")

            metadata = {k: v for k, v in data.items() if k not in ("message", "msg")}

            records.append(ParsedRecord(
                timestamp=ts,
                severity=severity,
                source=source,
                message=message,
                original_line=stripped,
                parsed=True,
                metadata=metadata
            ))
        except json.JSONDecodeError:
            records.append(parse_single_generic_line(stripped))
    return records


def parse_python_logs(lines: List[str]) -> List[ParsedRecord]:
    records: List[ParsedRecord] = []
    current_record: Optional[ParsedRecord] = None

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        # Check bracketed match first
        m = RE_PYTHON_LOG_BRACKET.match(stripped)
        if m:
            ts_str, level_str, logger_str, msg = m.groups()
            current_record = ParsedRecord(
                timestamp=parse_timestamp_str(ts_str),
                severity=normalize_severity(level_str),
                source=logger_str or "python",
                message=redact_secrets(msg),
                original_line=line,
                parsed=True,
                metadata={"logger": logger_str or "python"}
            )
            records.append(current_record)
            continue

        # Check space match
        m2 = RE_PYTHON_LOG_SPACE.match(stripped)
        if m2:
            ts_str, level_str, logger_str, msg = m2.groups()
            current_record = ParsedRecord(
                timestamp=parse_timestamp_str(ts_str),
                severity=normalize_severity(level_str),
                source=logger_str or "python",
                message=redact_secrets(msg),
                original_line=line,
                parsed=True,
                metadata={"logger": logger_str or "python"}
            )
            records.append(current_record)
            continue

        # Check if continuation line (Traceback or indented stack line)
        if current_record is not None and (
            line.startswith(" ") or
            line.startswith("\t") or
            stripped.startswith("Traceback") or
            stripped.startswith("File ") or
            "Error:" in stripped or
            "Exception:" in stripped
        ):
            current_record.message += "\n" + redact_secrets(stripped)
            current_record.original_line += "\n" + line
            if current_record.severity in ("INFO", "DEBUG", "UNKNOWN") and ("Traceback" in stripped or "Error" in stripped):
                current_record.severity = "ERROR"
            continue

        # Fallback for unrecognized standalone line
        gen_rec = parse_single_generic_line(line)
        records.append(gen_rec)
        current_record = gen_rec

    return records


def parse_server_logs(lines: List[str]) -> List[ParsedRecord]:
    records: List[ParsedRecord] = []

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        # Check Access Log
        m_access = RE_SERVER_ACCESS.match(stripped)
        if m_access:
            ip, ts_str, method, path, status_code, size, referer, user_agent = m_access.groups()
            code = int(status_code)
            if code >= 500:
                severity = "ERROR"
            elif code >= 400:
                severity = "WARNING"
            elif code >= 200:
                severity = "INFO"
            else:
                severity = "INFO"

            msg = f"{method} {path} HTTP Status {status_code} ({size} bytes)"
            records.append(ParsedRecord(
                timestamp=parse_timestamp_str(ts_str),
                severity=severity,
                source="access_log",
                message=redact_secrets(msg),
                original_line=stripped,
                parsed=True,
                metadata={
                    "ip": ip,
                    "method": method,
                    "path": path,
                    "status_code": code,
                    "size": size,
                    "referer": referer,
                    "user_agent": user_agent,
                }
            ))
            continue

        # Check Error Log
        m_error = RE_SERVER_ERROR.match(stripped)
        if m_error:
            ts_str, level_str, msg = m_error.groups()
            severity = normalize_severity(level_str)
            records.append(ParsedRecord(
                timestamp=parse_timestamp_str(ts_str),
                severity=severity,
                source="server_error",
                message=redact_secrets(msg),
                original_line=stripped,
                parsed=True,
                metadata={"raw_level": level_str}
            ))
            continue

        # Generic line fallback
        records.append(parse_single_generic_line(line))

    return records


def parse_single_generic_line(line: str) -> ParsedRecord:
    stripped = line.strip()
    # Try to extract timestamp with generic regex
    ts_match = re.search(r'(\d{4}[-/]\d{2}[-/]\d{2}[ T]\d{2}:\d{2}:\d{2}(?:[,\.]\d+)?)', stripped)
    ts = parse_timestamp_str(ts_match.group(1)) if ts_match else None

    severity = classify_severity_from_text(stripped)
    return ParsedRecord(
        timestamp=ts,
        severity=severity,
        source="generic",
        message=redact_secrets(stripped),
        original_line=line,
        parsed=False if severity == "UNKNOWN" and ts is None else True,
        metadata={}
    )


def parse_generic_logs(lines: List[str]) -> List[ParsedRecord]:
    records: List[ParsedRecord] = []
    current_record: Optional[ParsedRecord] = None

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        # If it's an indented trace line and we have a preceding record, attach it
        if current_record is not None and (line.startswith(" ") or line.startswith("\t")) and ("Traceback" in current_record.message or current_record.severity in ("ERROR", "CRITICAL")):
            current_record.message += "\n" + redact_secrets(stripped)
            current_record.original_line += "\n" + line
            continue

        rec = parse_single_generic_line(line)
        records.append(rec)
        current_record = rec

    return records


def parse_log_content(content_text: str) -> Tuple[str, List[ParsedRecord]]:
    """
    Detects log format and parses lines into structured ParsedRecord instances.
    Returns: (detected_format, records)
    """
    raw_lines = content_text.splitlines()
    detected = detect_format(raw_lines)

    if detected == "jsonl":
        records = parse_jsonl(raw_lines)
    elif detected == "python":
        records = parse_python_logs(raw_lines)
    elif detected == "server":
        records = parse_server_logs(raw_lines)
    else:
        records = parse_generic_logs(raw_lines)

    return detected, records
