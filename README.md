# LogLens — Intelligent Log Analysis & Monitoring Platform

> **Turn Raw Logs Into Actionable Insights.**  
> A developer-focused diagnostic, log parsing, pattern detection, and observability analytics platform.

---

## 1. Overview

**LogLens** is a full-stack developer tool that ingests application log files and converts unstructured text into structured, searchable, and understandable diagnostic insights.

Engineers frequently inspect thousands of lines of raw server and application logs during an outage or triage session. LogLens automates this process through:
- **Intelligent Log Parsing:** Automatic format detection for standard Python logs, Apache/Nginx web server access and error logs, and cloud-native JSON lines (JSONL).
- **Multiline Stack Trace Accumulation:** Automatically links indented Python or server stack trace lines to their originating error event.
- **Deterministic Pattern Recognition:** Normalizes dynamic variables (UUIDs, IP addresses, IDs, hex memory offsets, timestamps) to group repeated failure instances into ranked recurring patterns.
- **Severity Classification:** Canonical classification into `CRITICAL`, `ERROR`, `WARNING`, `INFO`, `DEBUG`, and `UNKNOWN`.
- **Secret Redaction:** Masks API keys, bearer tokens, passwords in URLs, and AWS credentials before display or export.
- **Interactive Visualizations:** Recharts severity donuts, activity timelines, and error frequency trends.
- **Multi-Format Export:** Generates standardized CSV datasets, machine-readable JSON reports, and human-readable diagnostic text reports.
- **Zero External AI or Paid API Dependency:** Operates fully self-contained with Python and SQLite.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 18, Vite, TypeScript
- **Styling:** Tailwind CSS (Custom Dark Developer Theme: `#0B1220` bg, `#111B2E` secondary, `#172337` card, `#22D3EE` cyan accent)
- **Routing:** React Router v6
- **Charts:** Recharts
- **Icons:** Lucide React

### Backend
- **Framework:** Python 3.11+ / FastAPI
- **Server:** Uvicorn ASGI
- **Data Modeling & Validation:** Pydantic v2 & Pydantic Settings
- **ORM & Database:** SQLAlchemy 2.0 with SQLite (PostgreSQL compatible design)
- **Data Processing:** Pandas, NumPy, Python standard libraries (`re`, `json`, `datetime`, `hashlib`)

### Testing & Tooling
- **Testing:** Pytest, HTTPX, FastAPI TestClient
- **Deployment:** Vercel (Frontend), Render (Backend)

---

## 3. Project Structure

```
LogLens/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/
│   │   │   │   ├── analyses.py      # History, details, logs pagination, deletion
│   │   │   │   ├── analyze.py       # File upload & sample trigger processing
│   │   │   │   ├── export.py        # CSV, JSON, TXT report downloaders
│   │   │   │   ├── health.py        # Health probe endpoint
│   │   │   │   └── samples.py       # Sample logs catalog
│   │   │   └── router.py            # API router aggregator (/api)
│   │   ├── core/
│   │   │   └── config.py            # Pydantic environment configuration
│   │   ├── database/
│   │   │   └── session.py           # SQLAlchemy engine & session maker
│   │   ├── models/
│   │   │   ├── analysis.py          # Analysis database model
│   │   │   ├── error_pattern.py     # Recurring error pattern model
│   │   │   └── log_entry.py         # Log entry model with cascade delete
│   │   ├── schemas/
│   │   │   ├── analysis.py          # Pydantic schemas for analyses & metrics
│   │   │   ├── error_pattern.py     # Pydantic schemas for patterns
│   │   │   └── log_entry.py         # Pydantic schemas for logs & pagination
│   │   ├── services/
│   │   │   ├── analyzer.py          # Aggregation, timeline & category calculation
│   │   │   ├── classifier.py        # Normalized severity classification
│   │   │   ├── export_service.py    # CSV, JSON, TXT generator
│   │   │   ├── parser.py            # Format detection, Python, Server & JSONL parsers
│   │   │   └── pattern_detector.py  # Dynamic token normalization & pattern detection
│   │   ├── utils/
│   │   │   └── security.py          # Filename sanitization, secret redaction, validation
│   │   └── main.py                  # FastAPI application entrypoint & lifespan
│   └── requirements.txt             # Backend dependencies
├── tests/                            # Backend pytest suite
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # SeverityBadge, Card, EmptyState, Skeleton, Toast, Modal
│   │   │   └── layout/              # Navbar, Sidebar, Footer
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx          # Page 1: Product landing page
│   │   │   ├── DashboardPage.tsx        # Page 2: Main metrics & aggregate charts
│   │   │   ├── UploadPage.tsx           # Page 3: Drag & drop upload & sample loader
│   │   │   ├── AnalysisResultsPage.tsx  # Page 4: Results, explorer & exports
│   │   │   ├── HistoryPage.tsx          # Page 5: History management & deletion
│   │   │   └── DocumentationPage.tsx    # Page 6: Technical reference & architecture
│   │   ├── services/api.ts          # Centralized API service
│   │   ├── types/index.ts           # TypeScript interfaces
│   │   ├── utils/                   # Formatter helpers and cn utility
│   │   ├── App.tsx                  # Router setup
│   │   ├── main.tsx                 # DOM entrypoint
│   │   └── index.css                # Tailwind CSS directives
│   ├── package.json                 # Frontend dependencies
│   ├── vite.config.ts               # Vite configuration & dev proxy
│   └── tailwind.config.js           # Dark theme design tokens
├── sample_data/                     # Bundled demonstration log datasets
│   ├── python_sample.log            # Python logs with multiline tracebacks
│   ├── server_sample.log            # Nginx/Apache access & error logs
│   └── json_sample.jsonl            # Cloud microservices structured JSON logs
├── docs/
│   ├── architecture.md              # Deep architectural overview & pipeline flow
│   └── api.md                       # Complete REST API reference & cURL examples
├── render.yaml                      # Render deployment specification
├── Procfile                         # Process file for cloud container startup
├── resource.md                      # Engineering reference & reproduction instructions
├── .env.example                     # Environment template
└── README.md                        # Documentation
```

---

## 4. Local Installation & Setup

### Prerequisites
- Python 3.11 or higher
- Node.js 18+ and npm

### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/sengardhruvpratapsingh/LogLens.git
cd LogLens

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Linux / macOS:
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run backend test suite from the repository root
pytest tests/ -v

# Start the FastAPI server
uvicorn backend.app.main:app --reload --port 8000
```
The backend API and interactive Swagger documentation are available at `http://localhost:8000` and `http://localhost:8000/docs`.

### 2. Frontend Setup
In a new terminal window:
```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
Open your browser at: `http://localhost:5173`. During local development, Vite proxies `/api` requests to the backend at `http://127.0.0.1:8000`.

---

## 5. Deployment Instructions

### Frontend Deployment (Vercel)
1. Push project to GitHub.
2. In the Vercel dashboard, click **Add New Project** and import the repository.
3. Configure settings:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Set Environment Variables:
   - `VITE_API_URL`: `https://<your-render-backend-name>.onrender.com`
5. Click **Deploy**.

### Backend Deployment (Render)
1. In Render, select **New Web Service** and connect the GitHub repository.
2. Select runtime: **Python 3**.
3. Configure settings:
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path:** `/api/health`
4. Configure Environment Variables:
   - `APP_ENV`: `production`
   - `DEBUG`: `False`
   - `DATABASE_URL`: `sqlite:///./backend/loglens.db`
   - `CORS_ORIGINS`: `https://<your-vercel-app>.vercel.app`
5. Click **Deploy Web Service**.

> **Note on Free Cloud Hosting:** Free tier containers may experience cold starts and ephemeral filesystems. SQLite data is preserved while the instance is running. For multi-replica production environments, configure PostgreSQL via the `DATABASE_URL` environment variable.

---

## 6. Known Limitations & Future Scope
- **File Size Ceiling:** Standard uploads are capped at 10 MB to guarantee responsive in-memory analysis and prevent browser lockup.
- **Storage Persistence:** On ephemeral free hosts, local SQLite files reset upon container recreation.
- **Future Scope:**
  - PostgreSQL persistent clustering
  - Live log streaming via WebSockets
  - Advanced regex custom schema builder

---

## 7. License
MIT License. Built for developer productivity and diagnostic observability.
