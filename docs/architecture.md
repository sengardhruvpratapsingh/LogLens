# LogLens System Architecture

## 1. High-Level Architecture Overview

LogLens is engineered as a decoupled, full-stack log observability and diagnostic application. It processes unstructured telemetry logs, detects recurring error patterns via deterministic dynamic variable normalization, persists structured records in an indexed database, and delivers insights through an interactive dark dashboard.

```
┌─────────────────────────────────────────────────────────────┐
│                   React + Vite Frontend                     │
│  - Landing Page (/)                                         │
│  - Main Dashboard (/dashboard)                              │
│  - Log Upload & Analyzer (/analyze)                         │
│  - Analysis Results Workspace (/analysis/:id)               │
│  - Analysis History (/history)                              │
│  - Technical Documentation (/documentation)                 │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON REST API (HTTP)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Python Backend                   │
│                                                             │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │ Security Utils  │  │  Parsing Engine  │  │  Analytics  │ │
│  │ (Sanitization,  │  │ (Python, Server, │  │   Engine    │ │
│  │  Redaction)     │  │  JSONL, Generic) │  │  (Pandas)   │ │
│  └─────────────────┘  └─────────┬────────┘  └──────┬──────┘ │
│                                 │                  │        │
│                                 ▼                  ▼        │
│                       ┌──────────────────┐  ┌─────────────┐ │
│                       │ Pattern Detector │  │   Export    │ │
│                       │ (Normalization)  │  │   Service   │ │
│                       └──────────────────┘  └─────────────┘ │
└──────────────────────────────┬──────────────────────────────┘
                               │ SQLAlchemy ORM
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 SQLite Database (loglens.db)                │
│  - Table: analyses (Metadata, aggregated metrics, status)   │
│  - Table: log_entries (Structured records, cascaded delete) │
│  - Table: error_patterns (Grouped patterns, occurrences)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Ingestion & Processing Pipeline

1. **Upload & Streaming Validation**:
   - Filename sanitization to strip directory traversal (`../`) and illegal OS characters.
   - Strict size check (enforcing `<= 10 MB`).
   - Binary verification to reject files containing null bytes (`\x00`).
   - UTF-8 decoding with automatic fallback to Latin-1.
   - SHA-256 file checksum calculation for data integrity.

2. **Format Detection & Record Extraction**:
   - Inspects the initial log lines.
   - Identifies structured formats (`jsonl`, `python`, `server`) or falls back to `generic`.
   - Accumulates multiline tracebacks and indented stack traces into their parent error entry.

3. **Severity Classification & Secret Redaction**:
   - Canonical normalization (`CRITICAL`, `ERROR`, `WARNING`, `INFO`, `DEBUG`, `UNKNOWN`).
   - Context-aware token detection (avoids classifying "0 errors found" as an error).
   - Redaction masks HTTP Bearer tokens, basic auth passwords, API keys, and AWS credentials.

4. **Deterministic Pattern Detection**:
   - Evaluates all `ERROR` and `CRITICAL` records.
   - Replaces dynamic tokens with regex placeholders (`<UUID>`, `<IP>`, `<ID>`, `<HEX>`, `<TIMESTAMP>`, `<NUM>`).
   - Groups structural identicals, counting occurrences and computing first/last seen timestamps.

5. **Analytical Aggregation**:
   - Aggregates severity distributions and error failure percentages.
   - Resolves timeline activity into adaptive time buckets (minute, hour, day).
   - Categorizes failures by component (Database, Network & HTTP, System & Resource, File & Storage, Authentication).

6. **Storage & Export Delivery**:
   - Inserts records via bulk SQLAlchemy operations in an atomic transaction.
   - Provides on-demand export formatting into CSV, JSON, or readable TXT report.
