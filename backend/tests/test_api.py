import io
from fastapi.testclient import TestClient


def test_health_endpoint(client: TestClient):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_samples_endpoint(client: TestClient):
    response = client.get("/api/samples")
    assert response.status_code == 200
    samples = response.json()
    assert len(samples) >= 3
    sample_ids = [s["id"] for s in samples]
    assert "python" in sample_ids
    assert "server" in sample_ids
    assert "jsonl" in sample_ids


def test_upload_valid_log(client: TestClient):
    log_content = b"""2026-11-17 10:00:00 [INFO] app.main: Server started
2026-11-17 10:01:00 [ERROR] app.database: Query failed on connection
2026-11-17 10:02:00 [ERROR] app.database: Query failed on connection
"""
    files = {"file": ("test_app.log", io.BytesIO(log_content), "text/plain")}
    response = client.post("/api/analyze", files=files)
    assert response.status_code == 201
    data = response.json()
    assert data["filename"] == "test_app.log"
    assert data["total_records"] == 3
    assert data["error_count"] == 2
    assert data["info_count"] == 1
    analysis_id = data["id"]

    # Verify retrieval
    get_res = client.get(f"/api/analyses/{analysis_id}")
    assert get_res.status_code == 200
    detail = get_res.json()
    assert detail["id"] == analysis_id
    assert len(detail["top_patterns"]) == 1
    assert detail["top_patterns"][0]["occurrence_count"] == 2

    # Verify logs pagination and filtering
    logs_res = client.get(f"/api/analyses/{analysis_id}/logs?severity=ERROR")
    assert logs_res.status_code == 200
    logs_data = logs_res.json()
    assert logs_data["total"] == 2
    assert all(item["severity"] == "ERROR" for item in logs_data["items"])

    # Verify search
    search_res = client.get(f"/api/analyses/{analysis_id}/logs?search=started")
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert search_data["total"] == 1
    assert "Server started" in search_data["items"][0]["message"]

    # Verify CSV export
    csv_res = client.get(f"/api/analyses/{analysis_id}/export/csv")
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "Query failed on connection" in csv_res.text

    # Verify JSON export
    json_res = client.get(f"/api/analyses/{analysis_id}/export/json")
    assert json_res.status_code == 200
    assert json_res.json()["analysis_id"] == analysis_id

    # Verify TXT report export
    txt_res = client.get(f"/api/analyses/{analysis_id}/export/txt")
    assert txt_res.status_code == 200
    assert "LOGLENS DIAGNOSTIC ANALYSIS REPORT" in txt_res.text

    # Verify deletion and cascade
    del_res = client.delete(f"/api/analyses/{analysis_id}")
    assert del_res.status_code == 200

    # Ensure it no longer exists
    assert client.get(f"/api/analyses/{analysis_id}").status_code == 404
    assert client.get(f"/api/analyses/{analysis_id}/logs").status_code == 404


def test_upload_invalid_extension(client: TestClient):
    files = {"file": ("malicious.exe", io.BytesIO(b"binary"), "application/octet-stream")}
    res = client.post("/api/analyze", files=files)
    assert res.status_code == 400
    assert "unsupported" in res.json()["detail"].lower()


def test_upload_empty_file(client: TestClient):
    files = {"file": ("empty.log", io.BytesIO(b""), "text/plain")}
    res = client.post("/api/analyze", files=files)
    assert res.status_code == 400
    assert "empty" in res.json()["detail"].lower()


def test_sample_trigger(client: TestClient):
    res = client.post("/api/analyze/sample/python")
    assert res.status_code == 201
    data = res.json()
    assert data["detected_format"] == "python"
    assert data["total_records"] > 0
    assert data["error_count"] > 0
