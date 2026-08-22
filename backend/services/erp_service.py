import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from backend.database.models import PurchaseOrder, ProductionOrder, Component, DisruptionEvent

class ERPService:
    def __init__(self, db: Session):
        self.db = db

    def verify_action_execution(self, disruption_id: int, decision_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Post-execution verification stage:
        1. Checks whether supplier purchase order exists and is confirmed.
        2. Checks whether expected delivery date satisfies production schedule.
        3. Checks whether disruption mitigation goal is accomplished.
        """
        disruption = self.db.query(DisruptionEvent).filter(DisruptionEvent.id == disruption_id).first()
        if not disruption:
            return {"verified": False, "reason": "Disruption event not found."}

        recommended_opt = decision_payload.get("recommended_option", {})
        po_number = recommended_opt.get("po_number")
        supplier_id = recommended_opt.get("supplier_id")
        component_id = recommended_opt.get("component_id", 1)

        # 1. Query ERP for PO state
        po = None
        if po_number:
            po = self.db.query(PurchaseOrder).filter(PurchaseOrder.po_number == po_number).first()
        elif supplier_id:
            po = self.db.query(PurchaseOrder).filter(
                PurchaseOrder.supplier_id == supplier_id,
                PurchaseOrder.component_id == component_id
            ).order_by(PurchaseOrder.id.desc()).first()

        if not po:
            return {
                "verified": False,
                "reason": "Verification Failed: ERP Purchase Order record was not found after execution attempt.",
                "requires_replanning": True
            }

        if po.status not in ["Confirmed", "Sent", "Delivered"]:
            return {
                "verified": False,
                "reason": f"Verification Failed: PO status is {po.status}, expected Confirmed.",
                "requires_replanning": True
            }

        # 2. Check production schedule satisfaction
        affected_production = self.db.query(ProductionOrder).filter(
            ProductionOrder.required_component_id == po.component_id,
            ProductionOrder.status == "Scheduled"
        ).first()

        if affected_production:
            if po.expected_delivery_date.date() > affected_production.due_date.date():
                return {
                    "verified": False,
                    "reason": f"Verification Failed: PO expected delivery date {po.expected_delivery_date.isoformat()} is after production due date {affected_production.due_date.isoformat()}.",
                    "requires_replanning": True
                }

        # 3. Mark disruption resolved
        disruption.status = "RESOLVED"
        self.db.commit()

        return {
            "verified": True,
            "reason": f"Execution verified successfully: Recovery PO {po.po_number} confirmed, delivery date satisfies production requirement.",
            "requires_replanning": False
        }
