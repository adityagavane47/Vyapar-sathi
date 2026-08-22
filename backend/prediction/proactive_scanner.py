import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from backend.database.models import PurchaseOrder, Supplier, Component, DisruptionEvent
from backend.prediction.external_signals import ExternalSignalsSimulator
from backend.prediction.supplier_risk_model import SupplierRiskModel

class ProactiveScanner:
    def __init__(self, db: Session):
        self.db = db
        self.risk_model = SupplierRiskModel()

    def run_proactive_scan(self) -> Dict[str, Any]:
        """
        Scans all open POs against live ML risk scores and external environmental signals.
        If risk >= 65.0%, injects an early-warning proactive Disruption Event.
        """
        open_pos = self.db.query(PurchaseOrder).filter(
            PurchaseOrder.status.in_(["Sent", "Confirmed"])
        ).all()

        scanned_results = []
        generated_events = []
        now = datetime.datetime.utcnow()

        for po in open_pos:
            sup = self.db.query(Supplier).filter(Supplier.id == po.supplier_id).first()
            comp = self.db.query(Component).filter(Component.id == po.component_id).first()
            if not sup or not comp:
                continue

            sup_dict = {
                "id": sup.id,
                "code": sup.code,
                "name": sup.name,
                "reliability_score": sup.reliability_score,
                "quality_rating": sup.quality_rating,
                "lead_time_days": sup.lead_time_days,
                "max_capacity": sup.max_capacity
            }

            ext_features = ExternalSignalsSimulator.get_supplier_external_features(sup.code)
            risk = self.risk_model.predict_risk(sup_dict, ext_features, order_quantity=po.quantity)

            risk["po_number"] = po.po_number
            risk["component_name"] = comp.name
            scanned_results.append(risk)

            # Generate proactive disruption event if probability >= 65%
            if risk["disruption_probability"] >= 65.0:
                event_code = f"DIS-PROACTIVE-{int(now.timestamp())}-{po.id}"
                
                # Check if event already exists
                existing = self.db.query(DisruptionEvent).filter(DisruptionEvent.event_code == event_code).first()
                if not existing:
                    event = DisruptionEvent(
                        event_code=event_code,
                        timestamp=now,
                        event_type="proactive_supplier_risk",
                        severity="High" if risk["disruption_probability"] < 80.0 else "Critical",
                        affected_entity_type="PurchaseOrder",
                        affected_entity_id=po.id,
                        description=f"PROACTIVE WARNING: ML Risk Model predicts {risk['disruption_probability']}% disruption risk for {po.po_number} ({comp.name}) via {sup.name}. Drivers: {', '.join(risk['key_risk_drivers'])}.",
                        evidence={
                            "po_number": po.po_number,
                            "disruption_probability": risk["disruption_probability"],
                            "risk_drivers": risk["key_risk_drivers"],
                            "external_signals": ext_features,
                            "is_proactive": True
                        },
                        status="NEW"
                    )
                    self.db.add(event)
                    self.db.commit()
                    self.db.refresh(event)
                    generated_events.append({
                        "event_id": event.id,
                        "event_code": event.event_code,
                        "description": event.description
                    })

        return {
            "status": "success",
            "timestamp": now.isoformat(),
            "total_pos_scanned": len(open_pos),
            "proactive_disruptions_generated": len(generated_events),
            "generated_events": generated_events,
            "predictions": scanned_results
        }
