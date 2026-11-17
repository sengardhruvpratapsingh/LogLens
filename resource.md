# LogLens — Engineering Resource Document

## 1. Project Overview
LogLens is an Intelligent Log Analysis & Monitoring Platform engineered to parse raw, unstructured application and server logs into structured, searchable diagnostic insights. It eliminates manual triage by automatically detecting log formats, classifying severity levels, linking multiline tracebacks, identifying ranked recurring error patterns via dynamic token normalization, and presenting interactive telemetry charts.

---

## 2. Complete Technology Stack
- **Frontend Core:** React 18, TypeScript 5.6, Vite 6
- **Frontend Styling:** Tailwind CSS 3.4, PostCSS, Autoprefixer
- **UI Components & Icons:** Lucide React, clsx, tailwind-merge
- **Data Visualization:** Recharts
- **Routing:** React Router DOM v6
- **Backend Framework:** FastAPI 0.115+, Uvicorn 0.32+
- **Validation & Settings:** Pydantic v2.9+, Pydantic Settings v2.6+
- **Database & ORM:** SQLite 3, SQLAlchemy 2.0+
- **Data Science & Aggregation:** Pandas 2.2+, NumPy
- **Testing:** Pytest 8.3+, HTTPX 0.28+, FastAPI TestClient
- **Cloud Infrastructure:** Vercel (Frontend SPA), Render (Backend Web Service)

---

## 3. Complete Dependency List

### Backend (`requirements.txt`)
- `fastapi`: High-performance asynchronous web framework for building REST APIs.
- `uvicorn[standard]`: Lightning-fast ASGI web server implementation.
- `pydantic`: Data validation and schema parsing using Python type annotations.
- `pydantic-settings`: Type-safe application configuration from environment variables.
- `sqlalchemy`: Comprehensive SQL toolkit and Object Relational Mapper (ORM).
- `python-multipart`: Streaming parser for multipart form-data file uploads.
- `pandas`: Analytical data structures and high-performance resampling for timeline buckets.
- `numpy`: Numerical processing support for Pandas data frames.
- `httpx`: Modern HTTP client for internal requests and async test fixtures.
- `pytest`: Python testing framework.
- `pytest-asyncio`: Asyncio support for pytest test fixtures.

### Frontend (`package.json`)
- `react`: Declarative UI component library.
- `react-dom`: DOM renderer for React.
- `react-router-dom`: Client-side routing for multi-page single page applications.
- `lucide-react`: Modern developer-oriented SVG icon suite.
- `recharts`: Composable charting library built on React and D3 SVG.
- `clsx`: Utility for constructing className strings conditionally.
- `tailwind-merge`: Utility to merge Tailwind CSS classes safely without style conflicts.
- `tailwindcss`: Utility-first CSS framework.
- `typescript`: Statically typed superset of JavaScript.
- `vite`: Next-generation frontend build tool and dev server.

---

## 4. Purpose of Each Dependency
| Dependency | Purpose |
| :--- | :--- |
| `FastAPI` | Handles HTTP routing, request parsing, dependency injection, and automatic Swagger docs. |
| `SQLAlchemy` | Manages relational schema definitions, migrations, connections, and cascading deletions. |
| `Pandas` | Handles time-series resampling and frequency aggregation across thousands of log records. |
| `Python Multipart` | Enables safe in-memory streaming of uploaded files up to 10 MB. |
| `Recharts` | Renders responsive SVG Donut charts, Area charts, and Bar charts for log analytics. |
| `Tailwind CSS` | Enforces the strict SaaS dark theme design system (`#0B1220` base, `#22D3EE` cyan accent). |
| `Pytest` | Executes automated unit and regression tests for parsers, security, and endpoints. |

---

## 5. Installation Commands

### Backend Virtual Environment
```bash
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
# macOS / Linux
source .venv/bin/activate

pip install -r backend/requirements.txt
```

### Frontend Dependencies
```bash
cd frontend
npm ci --include=optional
```
Use the committed lockfile for reproducible installs. Rollup's native binaries are optional dependencies selected by npm for the current operating system and architecture; do not add a platform-specific binary package directly to `package.json`.

---

## 6. System Architecture
LogLens is designed with a strict separation of concerns:
- **Presentation Layer (Frontend):** React Single Page Application utilizing custom dark UI components, responsive layout with collapsible navigation, real-time filtering, search highlight, and Recharts SVG visualizations.
- **API & Business Logic Layer (Backend):** FastAPI routers handle incoming requests, validate payloads, and delegate to modular services (`parser.py`, `classifier.py`, `pattern_detector.py`, `analyzer.py`, `export_service.py`).
- **Data Persistence Layer:** SQLite database accessed through SQLAlchemy models with configured cascade deletion (`ondelete="CASCADE"`).

---

## 7. Application Flow
```
1. User uploads .log / .txt / .jsonl file (or selects preloaded Sample Log)
2. Backend validates filename, checks null bytes, and verifies file size <= 10MB
3. Parser service auto-detects format (Python, Server, JSONL, Generic)
4. Parser extracts timestamp, severity, source, message, and attaches multiline tracebacks
5. Secret redaction masks API tokens, bearer tokens, passwords in URLs, and AWS keys
6. Pattern detector strips dynamic tokens (UUID, IP, ID, Hex) and groups recurring errors
7. Analyzer calculates severity distribution, error rate %, and timeline buckets
8. Records saved in SQLite transaction (Analyses, LogEntries, ErrorPatterns)
9. Frontend receives analysis ID and navigates to /analysis/:id
10. User explores interactive charts, filters by severity, searches keywords, and exports reports
```

---

## 8. Folder Structure
```
LogLens/
├── backend/
│   ├── app/
│   │   ├── api/endpoints/ (analyses, analyze, export, health, samples)
│   │   ├── core/ (config)
│   │   ├── database/ (session)
│   │   ├── models/ (analysis, error_pattern, log_entry)
│   │   ├── schemas/ (analysis, error_pattern, log_entry)
│   │   ├── services/ (analyzer, classifier, export_service, parser, pattern_detector)
│   │   ├── utils/ (security)
│   │   └── main.py
│   ├── tests/ (test_analyzer, test_api, test_parser, test_pattern_detector, test_security)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/ (common, layout)
│   │   ├── pages/ (LandingPage, DashboardPage, UploadPage, AnalysisResultsPage, HistoryPage, DocumentationPage)
│   │   ├── services/ (api)
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── sample_data/ (python_sample.log, server_sample.log, json_sample.jsonl)
├── docs/ (architecture.md, api.md)
├── README.md
├── resource.md
└── render.yaml
```

---

## 9. Database Schema

### Table: `analyses`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String(36) | Primary Key, UUID | Unique analysis identifier |
| `filename` | String(255) | Not Null | Sanitized original filename |
| `file_hash` | String(64) | Not Null, Index | SHA-256 content checksum |
| `file_size` | Integer | Not Null | File size in bytes |
| `detected_format` | String(50) | Not Null | `python`, `server`, `jsonl`, `generic` |
| `created_at` | DateTime | Not Null, Index | Processing timestamp (UTC) |
| `total_records` | Integer | Not Null, Default 0 | Total lines indexed |
| `parsed_records` | Integer | Not Null, Default 0 | Successfully parsed records |
| `unparsed_records` | Integer | Not Null, Default 0 | Fallback/unparsed records |
| `critical_count` | Integer | Not Null, Default 0 | Count of CRITICAL events |
| `error_count` | Integer | Not Null, Default 0 | Count of ERROR events |
| `warning_count` | Integer | Not Null, Default 0 | Count of WARNING events |
| `info_count` | Integer | Not Null, Default 0 | Count of INFO events |
| `debug_count` | Integer | Not Null, Default 0 | Count of DEBUG events |
| `unknown_count` | Integer | Not Null, Default 0 | Count of UNKNOWN events |
| `first_timestamp` | DateTime | Nullable | Earliest log event timestamp |
| `last_timestamp` | DateTime | Nullable | Latest log event timestamp |
| `status` | String(50) | Not Null, Default 'COMPLETED' | Status indicator |

### Table: `log_entries`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key, Auto Increment | Unique record ID |
| `analysis_id` | String(36) | Foreign Key (`analyses.id` ON DELETE CASCADE), Index | Owning analysis ID |
| `timestamp` | DateTime | Nullable, Index | Extracted log timestamp |
| `severity` | String(20) | Not Null, Index | `CRITICAL`, `ERROR`, `WARNING`, `INFO`, `DEBUG`, `UNKNOWN` |
| `source` | String(100) | Not Null | Logger name, IP, or service tag |
| `message` | Text | Not Null | Redacted log message with stack trace |
| `original_line` | Text | Not Null | Original raw line |
| `parsed` | Boolean | Not Null, Default True | Whether line matched expected format |
| `metadata_json` | Text | Nullable | JSON string of extra attributes |

### Table: `error_patterns`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key, Auto Increment | Unique pattern ID |
| `analysis_id` | String(36) | Foreign Key (`analyses.id` ON DELETE CASCADE), Index | Owning analysis ID |
| `normalized_message` | Text | Not Null | Template with stripped dynamic variables |
| `original_message` | Text | Not Null | Representative sample raw error |
| `severity` | String(20) | Not Null | `ERROR` or `CRITICAL` |
| `occurrence_count` | Integer | Not Null, Default 1 | Number of occurrences |
| `first_occurrence` | DateTime | Nullable | Earliest timestamp pattern seen |
| `last_occurrence` | DateTime | Nullable | Latest timestamp pattern seen |

---

## 10. API Endpoint Documentation
- `GET /api/health`: Health probe returning version and status.
- `POST /api/analyze`: Multipart file upload with complete analysis.
- `POST /api/analyze/sample/{sample_id}`: Triggers analysis on preloaded sample (`python`, `server`, `jsonl`).
- `GET /api/samples`: Lists bundled sample log files.
- `GET /api/analyses/stats/overview`: Dashboard KPI metrics across all analyses.
- `GET /api/analyses`: Paginated analysis history with search filter.
- `GET /api/analyses/{id}`: Detailed analysis report, severity distribution, timeline, and patterns.
- `GET /api/analyses/{id}/logs`: Paginated log entries with severity filters, keyword search, and sorting.
- `GET /api/analyses/{id}/patterns`: Ranked recurring error patterns for analysis.
- `GET /api/analyses/{id}/export/csv`: Download CSV of log entries.
- `GET /api/analyses/{id}/export/json`: Download structured JSON report.
- `GET /api/analyses/{id}/export/txt`: Download diagnostic text report.
- `DELETE /api/analyses/{id}`: Deletes analysis and cascades deletion to child logs and patterns.

---

## 11. Log Parsing Methodology
- **Python Logs:** Matched with bracketed (`YYYY-MM-DD HH:MM:SS [LEVEL] source: msg`) and unbracketed patterns. Continuation lines starting with indentation, whitespace, `Traceback`, or exception indicators are accumulated onto the parent log entry.
- **Server Logs:** Matched against Apache/Nginx Combined Access Log format (`IP - - [Timestamp] "METHOD PATH PROTOCOL" STATUS SIZE`) and Nginx error format (`YYYY/MM/DD HH:MM:SS [level] PID#TID: msg`). Status codes are mapped contextually: 5xx -> ERROR, 4xx -> WARNING, 2xx/3xx -> INFO.
- **JSONL:** Parsed line-by-line using Python `json.loads`. Standard keys (`timestamp`, `level`, `severity`, `message`, `source`) are extracted; all remaining keys are preserved in `metadata_json`.
- **Generic Fallback:** Never silently discards unformatted log lines. Extracts timestamps and bracketed severity where present, marking `parsed=False` if unrecognized.

---

## 12. Severity Classification Methodology
Severity classification uses canonical normalization to one of 6 levels:
- `CRITICAL`: Mapped from `CRITICAL`, `FATAL`, `EMERGENCY`, `ALERT`, `PANIC`, `CRIT`.
- `ERROR`: Mapped from `ERROR`, `EXCEPTION`, `FAILED`, `FAILURE`, `ERR`, `SEVERE`.
- `WARNING`: Mapped from `WARNING`, `WARN`.
- `INFO`: Mapped from `INFO`, `INFORMATION`, `NOTICE`.
- `DEBUG`: Mapped from `DEBUG`, `TRACE`, `VERBOSE`.
- `UNKNOWN`: Default when no explicit level exists.
- **Context Awareness:** Words like "error" inside ordinary text are not classified as errors unless explicit level boundaries or traceback signatures exist.

---

## 13. Analytics Methodology
- Aggregates counts and percentages for each severity.
- Computes overall error rate %: `(error_count + critical_count) / total_records * 100`.
- Determines earliest and latest timestamps in dataset.
- Aggregates timeline activity into resampled buckets based on time span (e.g. 1 minute for short logs, 1 hour for daily logs, 1 day for multi-day logs) with separate error spike tracking.
- Categorizes error events into diagnostic buckets (Database, Network & HTTP, System & Resource, File & Storage, Authentication & Security, Application Logic).

---

## 14. Error Pattern Detection Methodology
Recurring errors are grouped through deterministic regex normalization:
- UUIDs (`[0-9a-fA-F]{8}-...`) -> `<UUID>`
- IP addresses (`\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}`) -> `<IP>`
- Hex memory offsets (`0x[0-9a-fA-F]+`) -> `<HEX>`
- ISO timestamps (`\d{4}-\d{2}-\d{2}...`) -> `<TIMESTAMP>`
- Request / User IDs (`(?:req|trc|usr|uid)_[a-zA-Z0-9_\-]+`) -> `<ID>`
- Identical normalized patterns are grouped, counting occurrences, determining first and last occurrence timestamps, and sorting by frequency descending.

---

## 15. Security Measures
- **Path Traversal Protection:** Filenames sanitized using `sanitize_filename()` to remove directory separators and illegal characters.
- **Size Validation:** Enforces strict 10 MB maximum upload limit in-memory.
- **Binary Rejection:** Inspects header bytes for null characters (`\x00`) to reject executables.
- **Secret Redaction:** Redacts Bearer tokens (JWTs), passwords in database and HTTP URLs, private API keys, and AWS credentials.
- **SQL Injection Prevention:** 100% parameterized queries via SQLAlchemy ORM.
- **CORS Configuration:** Controlled via `CORS_ORIGINS` environment setting.
- **No Stack Trace Leaks:** Global FastAPI exception handler catches unhandled exceptions and returns clean error responses.

---

## 16. Testing Methodology
- Pytest test suite in `backend/tests/` with 19 comprehensive unit and integration tests.
- Uses SQLite `:memory:` database with `StaticPool` for thread safety.
- Test coverage covers:
  - Valid Python, Server, and JSONL log parsing
  - Multiline traceback attachment
  - Generic fallback parser
  - Secret redaction and filename sanitization
  - Pattern normalization and frequency grouping
  - Metric computation on empty and populated datasets
  - API endpoints (health, upload, invalid extensions, samples, details, logs, exports, deletion cascading)
- Frontend build verification with `tsc -b && vite build` ensuring 0 TypeScript compiler errors.

---

## 17. Common Development Problems & Solutions
1. **ModuleNotFoundError: No module named 'backend':**
   - *Cause:* Running pytest from root directory without python path configured.
   - *Solution:* Prefix with `$env:PYTHONPATH="."` or run via `python -m pytest`.
2. **AnyIO BlockingPortal on Windows Sandbox:**
   - *Cause:* Windows isolation sandbox blocks IOCP thread communication for AnyIO.
   - *Solution:* Run network and subprocess tasks with appropriate sandbox permissions or `BypassSandbox: true`.
3. **Database Locks in SQLite:**
   - *Cause:* Concurrent write transactions in SQLite.
   - *Solution:* Enabled `check_same_thread: False` and transactional session handling in `session.py`.
4. **Rollup Native Module Resolution Across Platforms:**
   - *Cause:* The Windows-only `@rollup/rollup-win32-x64-msvc` package was added as a direct frontend dependency. Render builds on Linux and rejects that package with `EBADPLATFORM`.
   - *Solution:* Do not install a platform-specific Rollup binary directly. Vite's Rollup dependency declares its native binaries as optional dependencies; keep those entries, including `@rollup/rollup-linux-x64-gnu`, in `frontend/package-lock.json` and install with optional dependencies enabled.

---

## 18. Deployment Configuration
- **Frontend (Vercel):**
  - Framework: Vite
  - Build command: `npm run build`
  - Output directory: `dist`
  - SPA routing: Configured via `frontend/vercel.json` rewrite rules.
- **Frontend (Render Static Site):**
  - Root directory: `frontend`
  - Build command: `npm install --include=optional && npm run build`
  - Publish directory: `dist`
  - Rollup's platform-specific native packages must remain optional in the lockfile; do not add a Windows-only Rollup binary as an application dependency.
- **Backend (Render):**
  - Environment: Python 3
  - Build command: `pip install -r backend/requirements.txt`
  - Start command: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
  - Spec: `render.yaml`

---

## 19. Environment Variables

### Backend (`.env`)
```ini
APP_NAME=LogLens
APP_ENV=development
APP_VERSION=1.0.0
DEBUG=True
HOST=0.0.0.0
PORT=8000
DATABASE_URL=sqlite:///./backend/loglens.db
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
MAX_UPLOAD_SIZE_MB=10
ALLOWED_EXTENSIONS=.log,.txt,.jsonl
SAMPLE_DATA_DIR=./sample_data
```

### Frontend (`frontend/.env`)
```ini
VITE_API_URL=
```

---

## 20. Instructions for Reproducing the Project
1. Clone the repository into workspace `LogLens`.
2. Create and activate Python virtual environment: `python -m venv .venv; .\.venv\Scripts\Activate.ps1`.
3. Install backend dependencies: `pip install -r backend/requirements.txt`.
4. Run backend tests to verify 100% pass: `$env:PYTHONPATH="."; pytest backend/tests/ -v`.
5. Install frontend dependencies: `cd frontend; npm install`.
6. Run frontend production build: `npm run build`.
7. Start backend service: `uvicorn backend.app.main:app --reload --port 8000`.
8. Start frontend dev server: `npm run dev` in `frontend/`.
9. Navigate to `http://localhost:5173`, click **Launch Analyzer**, load any sample file or upload a log file, explore the analytics, and export your reports.
