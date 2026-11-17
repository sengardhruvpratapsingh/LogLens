import os
from pathlib import Path
from fastapi import APIRouter, HTTPException
from typing import List
from backend.app.schemas.analysis import SampleFileItem
from backend.app.core.config import settings

router = APIRouter(prefix="/samples", tags=["Samples"])

SAMPLE_DEFINITIONS = [
    {
        "id": "python",
        "name": "Python Application Logs",
        "filename": "python_sample.log",
        "format": "python",
        "description": "Standard Python backend log with multi-line tracebacks, database lock timeouts, Stripe gateway failures, and memory errors.",
    },
    {
        "id": "server",
        "name": "Web Server Logs (Nginx/Apache)",
        "filename": "server_sample.log",
        "format": "server",
        "description": "Combined access and error logs with HTTP status codes (200, 401, 404, 500, 503), client IPs, and upstream FastCGI failures.",
    },
    {
        "id": "jsonl",
        "name": "JSONL Microservices Logs",
        "filename": "json_sample.jsonl",
        "format": "jsonl",
        "description": "Cloud-native structured JSON logs with trace IDs, service tags, SLA alerts, billing retry errors, and low-disk warnings.",
    },
]


@router.get("", response_model=List[SampleFileItem])
def list_sample_logs():
    """Returns the list of available realistic sample logs with metadata."""
    results: List[SampleFileItem] = []
    base_dir = Path(settings.SAMPLE_DATA_DIR)

    for item in SAMPLE_DEFINITIONS:
        file_path = base_dir / item["filename"]
        size_bytes = file_path.stat().st_size if file_path.exists() else 0
        results.append(SampleFileItem(
            id=item["id"],
            name=item["name"],
            filename=item["filename"],
            format=item["format"],
            description=item["description"],
            size_bytes=size_bytes
        ))

    return results
