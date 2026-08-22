import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_simulation_reset_api():
    res = client.post("/api/simulation/reset")
    assert res.status_code == 200
    assert res.json()["status"] == "success"

def test_list_disruptions_api():
    res = client.get("/api/disruptions")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_trigger_disruption_api():
    res = client.post("/api/simulation/trigger-disruption?scenario=supplier_delay_autonomous")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    disruption_id = data["disruption"]["id"]

    # Run agent via API
    run_res = client.post("/api/agent/run", json={"disruption_id": disruption_id, "max_steps": 15})
    assert run_res.status_code == 200
    assert run_res.json()["final_state"] == "COMPLETE"

def test_audit_log_api():
    res = client.get("/api/audit")
    assert res.status_code == 200
    assert len(res.json()) > 0
