import pytest
from backend.database import SessionLocal, init_db
from backend.simulation.engine import SimulationEngine
from backend.agent.orchestrator import AgentOrchestrator
from backend.database.models import HumanApproval, AgentDecision, AuditEvent

@pytest.fixture
def db_session():
    init_db()
    db = SessionLocal()
    sim = SimulationEngine(db)
    sim.reset_simulation()
    yield db
    db.close()

def test_autonomous_supplier_delay_scenario(db_session):
    sim = SimulationEngine(db_session)
    event = sim.trigger_scenario("supplier_delay_autonomous")

    orch = AgentOrchestrator(db_session, event.id)
    res = orch.run_until_complete()

    assert res["final_state"] == "COMPLETE"
    
    # Audit log check
    audits = db_session.query(AuditEvent).filter(AuditEvent.disruption_id == event.id).all()
    assert len(audits) >= 5

def test_high_cost_human_approval_scenario(db_session):
    sim = SimulationEngine(db_session)
    event = sim.trigger_scenario("supplier_delay_high_cost")

    orch = AgentOrchestrator(db_session, event.id)
    res = orch.run_until_complete()

    # Should pause at WAITING_FOR_APPROVAL because cost > $50,000
    assert res["final_state"] == "WAITING_FOR_APPROVAL"

    # Verify pending human approval record
    appr = db_session.query(HumanApproval).filter(HumanApproval.disruption_id == event.id).first()
    assert appr is not None
    assert appr.status == "PENDING"
    assert appr.cost_impact > 50000.0

    # Simulate human approval
    appr.status = "APPROVED"
    appr.approver_comments = "Approved high-priority medical batch recovery spend."
    db_session.commit()

    # Resume agent
    res2 = orch.run_until_complete()
    assert res2["final_state"] == "COMPLETE"

def test_human_rejection_and_replanning_scenario(db_session):
    sim = SimulationEngine(db_session)
    event = sim.trigger_scenario("supplier_delay_high_cost")

    orch = AgentOrchestrator(db_session, event.id)
    orch.run_until_complete()

    appr = db_session.query(HumanApproval).filter(HumanApproval.disruption_id == event.id).first()
    appr.status = "REJECTED"
    appr.approver_comments = "Rejected primary due to budget constraints. Use secondary."
    db_session.commit()

    # Resume agent (should trigger REPLAN state)
    res = orch.run_until_complete()
    assert res["final_state"] in ["COMPLETE", "WAITING_FOR_APPROVAL"]
