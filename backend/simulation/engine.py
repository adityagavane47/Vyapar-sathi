import datetime
import random
from sqlalchemy.orm import Session
from backend.database.models import (
    DisruptionEvent, PurchaseOrder, Supplier, Component, 
    ShipmentTracking, SupplierMessage, AgentDecision, HumanApproval, AuditEvent, AgentStateStore
)
from backend.simulation.seed_data import seed_database

class SimulationEngine:
    def __init__(self, db: Session):
        self.db = db

    def reset_simulation(self):
        # Clear audit, state, decision and approval logs
        self.db.query(AuditEvent).delete()
        self.db.query(HumanApproval).delete()
        self.db.query(AgentDecision).delete()
        self.db.query(AgentStateStore).delete()
        self.db.query(DisruptionEvent).delete()
        self.db.commit()

        # Seed data
        seed_database(self.db)
        return {"status": "success", "message": "Simulation environment reset and re-seeded successfully."}

    def trigger_scenario(self, scenario_name: str) -> DisruptionEvent:
        now = datetime.datetime.utcnow()

        if scenario_name == "supplier_delay_autonomous":
            # PO-7001 (COMP-101) delayed by 7 days
            po = self.db.query(PurchaseOrder).filter(PurchaseOrder.po_number == "PO-7001").first()
            if po:
                po.status = "Delayed"
                po.expected_delivery_date = now + datetime.timedelta(days=11) # Original was 4 days
            
            # Update tracking
            trk = self.db.query(ShipmentTracking).filter(ShipmentTracking.po_id == po.id).first()
            if trk:
                trk.status = "Delayed"
                trk.delays_reported += 1
                trk.estimated_delivery = now + datetime.timedelta(days=11)

            event = DisruptionEvent(
                event_code=f"DIS-DEL-{int(now.timestamp())}",
                timestamp=now,
                event_type="supplier_delay",
                severity="High",
                affected_entity_type="PurchaseOrder",
                affected_entity_id=po.id if po else 1,
                description="Primary supplier TechComponents Global (SUP-001) notified a 7-day delivery delay on PO-7001 (500 units of MCU-32).",
                evidence={
                    "po_number": "PO-7001",
                    "supplier": "TechComponents Global",
                    "original_due_days": 4,
                    "new_due_days": 11,
                    "delay_days": 7,
                    "affected_component": "MCU-32"
                },
                status="NEW"
            )
            self.db.add(event)
            self.db.commit()
            self.db.refresh(event)
            return event

        elif scenario_name == "supplier_delay_high_cost":
            # Critical component PO-7003 delayed, large volume requirement exceeding ₹50k
            po = self.db.query(PurchaseOrder).filter(PurchaseOrder.po_number == "PO-7003").first()
            if po:
                po.status = "Delayed"
                po.expected_delivery_date = now + datetime.timedelta(days=14)

            event = DisruptionEvent(
                event_code=f"DIS-COST-{int(now.timestamp())}",
                timestamp=now,
                event_type="supplier_delay",
                severity="Critical",
                affected_entity_type="PurchaseOrder",
                affected_entity_id=po.id if po else 3,
                description="Major breakdown at Vanguard Assemblies (SUP-005). Delivery of PO-7003 (Heavy-Duty Power Board PB-800) delayed by 14 days. Recovery requires emergency high-capacity order (₹68,000 incremental cost).",
                evidence={
                    "po_number": "PO-7003",
                    "supplier": "Vanguard Assemblies",
                    "delay_days": 14,
                    "critical_order": "PRD-9003",
                    "estimated_incremental_cost": 68000.0
                },
                status="NEW"
            )
            self.db.add(event)
            self.db.commit()
            self.db.refresh(event)
            return event

        elif scenario_name == "quality_defect_moq":
            # Quality defect on COMP-201
            po = self.db.query(PurchaseOrder).filter(PurchaseOrder.po_number == "PO-7002").first()
            if po:
                po.status = "Quality_Failed"

            event = DisruptionEvent(
                event_code=f"DIS-QUAL-{int(now.timestamp())}",
                timestamp=now,
                event_type="quality_failure",
                severity="High",
                affected_entity_type="PurchaseOrder",
                affected_entity_id=po.id if po else 2,
                description="Quality inspection rejected batch under PO-7002 due to optical sensor calibration drift. Supplier MOQ constraints apply for replacement.",
                evidence={
                    "po_number": "PO-7002",
                    "defect_rate": "18.5%",
                    "inspection_result": "FAILED",
                    "component": "POS-5"
                },
                status="NEW"
            )
            self.db.add(event)
            self.db.commit()
            self.db.refresh(event)
            return event

        elif scenario_name == "contradictory_info":
            # Contradictory tracking vs supplier communication
            po = self.db.query(PurchaseOrder).filter(PurchaseOrder.po_number == "PO-7001").first()
            
            # Add conflicting message
            msg = SupplierMessage(
                supplier_id=po.supplier_id if po else 1,
                po_id=po.id if po else 1,
                direction="incoming",
                message_text="Supplier Customer Support claims: PO-7001 is on schedule and cleared customs.",
                timestamp=now
            )
            self.db.add(msg)

            # Set tracking status to customs hold delay
            trk = self.db.query(ShipmentTracking).filter(ShipmentTracking.po_id == (po.id if po else 1)).first()
            if trk:
                trk.status = "Customs_Hold"
                trk.delays_reported = 2
                trk.estimated_delivery = now + datetime.timedelta(days=12)

            event = DisruptionEvent(
                event_code=f"DIS-CONF-{int(now.timestamp())}",
                timestamp=now,
                event_type="supplier_communication_anomaly",
                severity="Medium",
                affected_entity_type="PurchaseOrder",
                affected_entity_id=po.id if po else 1,
                description="Contradictory information detected: Supplier claims PO-7001 is on time, but shipment tracking reports Customs Hold at Port.",
                evidence={
                    "po_number": "PO-7001",
                    "supplier_claim": "On Schedule",
                    "carrier_tracking_status": "Customs Hold - Delayed 8 days"
                },
                status="NEW"
            )
            self.db.add(event)
            self.db.commit()
            self.db.refresh(event)
            return event

        else:
            # Default/Random disruption
            po = self.db.query(PurchaseOrder).first()
            event = DisruptionEvent(
                event_code=f"DIS-RND-{int(now.timestamp())}",
                timestamp=now,
                event_type="inventory_shortage",
                severity="Medium",
                affected_entity_type="Component",
                affected_entity_id=1,
                description="Unplanned spike in safety stock consumption for COMP-101 (MCU-32). Inventory coverage below threshold.",
                evidence={"component_code": "COMP-101", "current_stock": 40, "safety_stock": 100},
                status="NEW"
            )
            self.db.add(event)
            self.db.commit()
            self.db.refresh(event)
            return event
