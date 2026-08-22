from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from backend.database import get_db
from backend.database.models import (
    DisruptionEvent, Component, Supplier, SupplierCatalog, Warehouse,
    InventoryItem, PurchaseOrder, ProductionOrder, AgentDecision,
    HumanApproval, AuditEvent, AgentStateStore
)
from backend.schemas.pydantic_models import (
    DisruptionEventCreate, DisruptionEventResponse, ComponentResponse,
    SupplierResponse, SupplierCatalogResponse, PurchaseOrderResponse,
    ProductionOrderResponse, DecisionResponse, HumanApprovalResponse,
    ApprovalActionRequest, AgentRunRequest, AuditEventResponse
)
from backend.simulation.engine import SimulationEngine
from backend.agent.orchestrator import AgentOrchestrator
from backend.tools.supply_chain_tools import SupplyChainTools

router = APIRouter()

# 1. Events & Disruptions
@router.post("/events", response_model=DisruptionEventResponse)
@router.post("/disruptions", response_model=DisruptionEventResponse)
def create_event(payload: DisruptionEventCreate, db: Session = Depends(get_db)):
    import datetime
    code = f"DIS-CUST-{int(datetime.datetime.utcnow().timestamp())}"
    evidence = payload.evidence or {}
    
    # Auto-infer evidence details if not explicitly passed
    if payload.affected_entity_type == "PurchaseOrder":
        po = db.query(PurchaseOrder).filter(PurchaseOrder.id == payload.affected_entity_id).first()
        if po:
            if "po_number" not in evidence:
                evidence["po_number"] = po.po_number
            if "delay_days" not in evidence and "delay" in payload.event_type.lower():
                evidence["delay_days"] = 7
            if "affected_component" not in evidence:
                comp = db.query(Component).filter(Component.id == po.component_id).first()
                if comp:
                    evidence["affected_component"] = comp.name
            # Update PO status if delayed
            if "delay" in payload.event_type.lower():
                po.status = "Delayed"
            elif "quality" in payload.event_type.lower() or "defect" in payload.event_type.lower():
                po.status = "Quality_Failed"

    event = DisruptionEvent(
        event_code=code,
        timestamp=datetime.datetime.utcnow(),
        event_type=payload.event_type,
        severity=payload.severity,
        affected_entity_type=payload.affected_entity_type,
        affected_entity_id=payload.affected_entity_id,
        description=payload.description,
        evidence=evidence,
        status="NEW"
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.get("/events", response_model=List[DisruptionEventResponse])
def list_events(db: Session = Depends(get_db)):
    return db.query(DisruptionEvent).order_by(DisruptionEvent.timestamp.desc()).all()

@router.get("/disruptions", response_model=List[DisruptionEventResponse])
def list_disruptions(db: Session = Depends(get_db)):
    return db.query(DisruptionEvent).order_by(DisruptionEvent.timestamp.desc()).all()

@router.get("/disruptions/{disruption_id}", response_model=DisruptionEventResponse)
def get_disruption(disruption_id: int, db: Session = Depends(get_db)):
    d = db.query(DisruptionEvent).filter(DisruptionEvent.id == disruption_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Disruption not found")
    return d

# 2. Inventory & Components
@router.get("/inventory")
def get_inventory(component_id: Optional[int] = None, db: Session = Depends(get_db)):
    tools = SupplyChainTools(db)
    return tools.get_inventory(component_id=component_id)

@router.get("/components", response_model=List[ComponentResponse])
def list_components(db: Session = Depends(get_db)):
    return db.query(Component).all()

# 3. Suppliers & Catalogs
@router.get("/suppliers", response_model=List[SupplierResponse])
def list_suppliers(db: Session = Depends(get_db)):
    return db.query(Supplier).all()

@router.get("/suppliers/catalog", response_model=List[SupplierCatalogResponse])
def list_supplier_catalogs(supplier_id: Optional[int] = None, component_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(SupplierCatalog)
    if supplier_id:
        query = query.filter(SupplierCatalog.supplier_id == supplier_id)
    if component_id:
        query = query.filter(SupplierCatalog.component_id == component_id)
    return query.all()

# 4. Purchase & Production Orders
@router.get("/purchase-orders", response_model=List[PurchaseOrderResponse])
def list_purchase_orders(db: Session = Depends(get_db)):
    return db.query(PurchaseOrder).all()

@router.get("/production-orders", response_model=List[ProductionOrderResponse])
def list_production_orders(db: Session = Depends(get_db)):
    return db.query(ProductionOrder).all()

# 5. Agent Run & Status
@router.post("/agent/run")
def run_agent(payload: AgentRunRequest, db: Session = Depends(get_db)):
    try:
        orch = AgentOrchestrator(db, payload.disruption_id)
        result = orch.run_until_complete(max_steps=payload.max_steps or 15)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/agent/step")
def step_agent(payload: AgentRunRequest, db: Session = Depends(get_db)):
    try:
        orch = AgentOrchestrator(db, payload.disruption_id)
        result = orch.step()
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/agent/status")
def get_agent_status(disruption_id: int, db: Session = Depends(get_db)):
    store = db.query(AgentStateStore).filter(AgentStateStore.disruption_id == disruption_id).first()
    if not store:
        return {"disruption_id": disruption_id, "current_state": "OBSERVE", "step_count": 0, "memory_context": {}}
    return {
        "disruption_id": disruption_id,
        "current_state": store.current_state,
        "step_count": store.step_count,
        "memory_context": store.memory_context
    }

# 6. Decisions & Approvals
@router.get("/decisions", response_model=List[DecisionResponse])
def list_decisions(disruption_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(AgentDecision)
    if disruption_id:
        query = query.filter(AgentDecision.disruption_id == disruption_id)
    return query.order_by(AgentDecision.created_at.desc()).all()

@router.get("/approvals", response_model=List[HumanApprovalResponse])
def list_approvals(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(HumanApproval)
    if status:
        query = query.filter(HumanApproval.status == status)
    return query.order_by(HumanApproval.timestamp.desc()).all()

@router.post("/approvals/{approval_id}/approve")
def approve_decision(approval_id: int, payload: ApprovalActionRequest, db: Session = Depends(get_db)):
    approval = db.query(HumanApproval).filter(HumanApproval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request not found")
    
    approval.status = "APPROVED"
    approval.approver_comments = payload.approver_comments
    db.commit()

    # Resume agent orchestrator step
    orch = AgentOrchestrator(db, approval.disruption_id)
    res = orch.run_until_complete()
    return {"status": "success", "message": "Approval granted. Agent execution resumed.", "agent_result": res}

@router.post("/approvals/{approval_id}/reject")
def reject_decision(approval_id: int, payload: ApprovalActionRequest, db: Session = Depends(get_db)):
    approval = db.query(HumanApproval).filter(HumanApproval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request not found")

    approval.status = "REJECTED"
    approval.approver_comments = payload.approver_comments or "Manager rejected primary recommendation."
    db.commit()

    # Resume agent orchestrator step (triggers REPLAN)
    orch = AgentOrchestrator(db, approval.disruption_id)
    res = orch.run_until_complete()
    return {"status": "success", "message": "Approval rejected. Agent triggered replanning loop.", "agent_result": res}

# 7. Audit Logs
@router.get("/audit", response_model=List[AuditEventResponse])
def list_audit_logs(disruption_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(AuditEvent)
    if disruption_id:
        query = query.filter(AuditEvent.disruption_id == disruption_id)
    return query.order_by(AuditEvent.timestamp.desc()).all()

# 8. Simulation & Scenarios
@router.post("/simulation/reset")
def reset_simulation(db: Session = Depends(get_db)):
    sim = SimulationEngine(db)
    return sim.reset_simulation()

@router.post("/simulation/trigger-disruption")
def trigger_disruption(scenario: str = Query("supplier_delay_autonomous"), db: Session = Depends(get_db)):
    sim = SimulationEngine(db)
    event = sim.trigger_scenario(scenario)
    return {"status": "success", "disruption": event}
