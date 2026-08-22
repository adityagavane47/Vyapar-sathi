import pytest
from backend.database import SessionLocal, init_db
from backend.simulation.seed_data import seed_database
from backend.prediction.external_signals import ExternalSignalsSimulator
from backend.prediction.supplier_risk_model import SupplierRiskModel
from backend.prediction.proactive_scanner import ProactiveScanner

@pytest.fixture
def db_session():
    init_db()
    db = SessionLocal()
    seed_database(db)
    yield db
    db.close()

def test_external_signals_simulator():
    signals = ExternalSignalsSimulator.get_live_signals()
    assert "weather_severity_index" in signals
    assert "overall_port_congestion" in signals
    assert len(signals["active_port_hubs"]) == 4

def test_supplier_risk_ml_model():
    model = SupplierRiskModel()
    sup_dict = {"id": 1, "name": "TechComponents Global", "reliability_score": 92.5, "quality_rating": 4.8, "lead_time_days": 5}
    ext_dict = {"weather_severity_index": 7.8, "port_congestion_index": 8.2}
    
    risk = model.predict_risk(sup_dict, ext_dict)
    assert "disruption_probability" in risk
    assert risk["risk_level"] in ["Low", "Medium", "High", "Critical"]
    assert len(risk["key_risk_drivers"]) > 0

def test_proactive_scanner(db_session):
    scanner = ProactiveScanner(db_session)
    res = scanner.run_proactive_scan()
    assert res["status"] == "success"
    assert "total_pos_scanned" in res
    assert "predictions" in res
