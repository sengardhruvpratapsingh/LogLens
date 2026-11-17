# LogLens REST API Documentation

The LogLens backend provides a RESTful JSON API documented via OpenAPI / Swagger UI at `/docs`.

## Base URL
- Local Development: `http://localhost:8000/api`
- Production: `https://<render-app-name>.onrender.com/api`

---

## Endpoints

### 1. Health Probe
- **Endpoint:** `GET /api/health`
- **Description:** Returns the application health status and version.
- **cURL:**
  ```bash
  curl -X GET http://localhost:8000/api/health
  ```
- **Response:**
  ```json
  {
    "status": "healthy",
    "app_name": "LogLens",
    "version": "1.0.0",
    "environment": "development"
  }
  ```

---

### 2. Upload and Analyze Log File
- **Endpoint:** `POST /api/analyze`
- **Content-Type:** `multipart/form-data`
- **Parameters:** `file` (multipart file up to 10MB; allowed extensions: `.log`, `.txt`, `.jsonl`)
- **cURL:**
  ```bash
  curl -X POST http://localhost:8000/api/analyze \
    -F "file=@sample_data/python_sample.log"
  ```
- **Response:**
  ```json
  {
    "id": "c1f7a493-21b8-4c19-940c-fb9381710921",
    "filename": "python_sample.log",
    "file_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "file_size": 3412,
    "detected_format": "python",
    "total_records": 25,
    "parsed_records": 25,
    "unparsed_records": 0,
    "critical_count": 2,
    "error_count": 7,
    "warning_count": 5,
    "info_count": 8,
    "debug_count": 3,
    "unknown_count": 0,
    "error_percentage": 36.0,
    "status": "COMPLETED",
    "first_timestamp": "2026-11-17T08:00:12",
    "last_timestamp": "2026-11-17T08:24:10",
    "created_at": "2026-11-17T18:00:00Z"
  }
  ```

---

### 3. Analyze Sample Log
- **Endpoint:** `POST /api/analyze/sample/{sample_id}`
- **Parameters:** `sample_id` (e.g. `python`, `server`, `jsonl`)
- **cURL:**
  ```bash
  curl -X POST http://localhost:8000/api/analyze/sample/python
  ```

---

### 4. List Demonstration Samples
- **Endpoint:** `GET /api/samples`
- **cURL:**
  ```bash
  curl -X GET http://localhost:8000/api/samples
  ```

---

### 5. Get Dashboard Overview Metrics
- **Endpoint:** `GET /api/analyses/stats/overview`
- **cURL:**
  ```bash
  curl -X GET http://localhost:8000/api/analyses/stats/overview
  ```

---

### 6. Get Analysis History (Paginated)
- **Endpoint:** `GET /api/analyses`
- **Query Parameters:**
  - `page`: Integer (default: 1)
  - `page_size`: Integer (default: 10, max: 100)
  - `search`: String (optional filename filter)
- **cURL:**
  ```bash
  curl -X GET "http://localhost:8000/api/analyses?page=1&page_size=10"
  ```

---

### 7. Get Analysis Details
- **Endpoint:** `GET /api/analyses/{id}`
- **cURL:**
  ```bash
  curl -X GET http://localhost:8000/api/analyses/c1f7a493-21b8-4c19-940c-fb9381710921
  ```

---

### 8. Get Paginated Log Entries
- **Endpoint:** `GET /api/analyses/{id}/logs`
- **Query Parameters:**
  - `page`: Integer (default: 1)
  - `page_size`: Integer (default: 50, max: 200)
  - `search`: String (searches message, source, raw line)
  - `severity`: String (`ALL`, `CRITICAL`, `ERROR`, `WARNING`, `INFO`, `DEBUG`, `UNKNOWN`)
  - `sort_order`: `asc` or `desc`
- **cURL:**
  ```bash
  curl -X GET "http://localhost:8000/api/analyses/{id}/logs?severity=ERROR&page=1"
  ```

---

### 9. Get Recurring Error Patterns
- **Endpoint:** `GET /api/analyses/{id}/patterns`
- **cURL:**
  ```bash
  curl -X GET http://localhost:8000/api/analyses/{id}/patterns
  ```

---

### 10. Export Data (CSV, JSON, TXT)
- **CSV:** `GET /api/analyses/{id}/export/csv`
- **JSON:** `GET /api/analyses/{id}/export/json`
- **TXT:** `GET /api/analyses/{id}/export/txt`
- **cURL:**
  ```bash
  curl -O -J http://localhost:8000/api/analyses/{id}/export/txt
  ```

---

### 11. Delete Analysis Record
- **Endpoint:** `DELETE /api/analyses/{id}`
- **Description:** Deletes the analysis and automatically cascades to delete all child log entries and error patterns.
- **cURL:**
  ```bash
  curl -X DELETE http://localhost:8000/api/analyses/{id}
  ```
