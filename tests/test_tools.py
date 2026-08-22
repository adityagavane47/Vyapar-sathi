import pytest
from backend.database import SessionLocal, init_db
from backend.simulation.seed_data import seed_database
from backend.tools.supply_chain_tools import SupplyChainTools

@pytest.fixture
def db_session():
    init_db()
    db = SessionLocal()
    seed_database(db)
    yield db
    db.close()

def test_get_inventory(db_session):
    tools = SupplyChainTools(db_session)
    items = tools.get_inventory()
    assert len(items) > 0
    assert "available_quantity" in items[0]

def test_get_purchase_orders(db_session):
    tools = SupplyChainTools(db_session)
    pos = tools.get_purchase_orders()
    assert len(pos) > 0
    assert pos[0]["status"] in ["Sent", "Confirmed", "Delayed"]

def test_compare_suppliers(db_session):
    tools = SupplyChainTools(db_session)
    res = tools.compare_suppliers(component_id=1, quantity=500, required_by_days=10)
    assert "compared_options" in res
    assert len(res["compared_options"]) >= 2

def test_update_erp_create_po(db_session):
    tools = SupplyChainTools(db_session)
    res = tools.update_erp("create_purchase_order", {
        "supplier_id": 2,
        "component_id": 1,
        "quantity": 300,
        "unit_price": 52.0,
        "lead_time_days": 3
    })
    assert res["status"] == "success"
    assert "PO-RECOV-" in res["po_number"]
