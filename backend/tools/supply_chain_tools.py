import datetime
import random
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.database.models import (
    Component, Supplier, SupplierCatalog, Warehouse, InventoryItem,
    PurchaseOrder, ProductionOrder, SupplierMessage, RFQ, ShipmentTracking,
    AuditEvent, HumanApproval, AgentDecision
)
from backend.constraints.validator import ConstraintValidator

class SupplyChainTools:
    def __init__(self, db: Session):
        self.db = db

    # 1. get_inventory
    def get_inventory(self, component_id: Optional[int] = None, warehouse_id: Optional[int] = None) -> List[Dict[str, Any]]:
        query = self.db.query(InventoryItem)
        if component_id:
            query = query.filter(InventoryItem.component_id == component_id)
        if warehouse_id:
            query = query.filter(InventoryItem.warehouse_id == warehouse_id)
        
        items = query.all()
        result = []
        for item in items:
            comp = self.db.query(Component).filter(Component.id == item.component_id).first()
            wh = self.db.query(Warehouse).filter(Warehouse.id == item.warehouse_id).first()
            result.append({
                "inventory_id": item.id,
                "warehouse_id": item.warehouse_id,
                "warehouse_name": wh.name if wh else "Unknown",
                "component_id": item.component_id,
                "component_code": comp.code if comp else "Unknown",
                "component_name": comp.name if comp else "Unknown",
                "quantity": item.quantity,
                "allocated_quantity": item.allocated_quantity,
                "available_quantity": item.quantity - item.allocated_quantity,
                "safety_stock_level": item.safety_stock_level,
                "is_below_safety_stock": (item.quantity - item.allocated_quantity) < item.safety_stock_level
            })
        return result

    # 2. get_inventory_usage
    def get_inventory_usage(self, component_id: int, timeframe_days: int = 30) -> Dict[str, Any]:
        comp = self.db.query(Component).filter(Component.id == component_id).first()
        if not comp:
            return {"error": f"Component ID {component_id} not found."}

        # Calculate demand from production orders using this component
        orders = self.db.query(ProductionOrder).filter(ProductionOrder.required_component_id == component_id).all()
        total_demand = sum(o.required_quantity for o in orders if o.status in ["Scheduled", "In_Progress"])
        daily_burn_rate = round(total_demand / float(max(1, timeframe_days)), 2)
        days_of_coverage = round(comp.current_stock / max(0.1, daily_burn_rate), 1)

        return {
            "component_id": comp.id,
            "component_code": comp.code,
            "current_stock": comp.current_stock,
            "allocated_demand": total_demand,
            "daily_burn_rate": daily_burn_rate,
            "days_of_coverage": days_of_coverage,
            "timeframe_days": timeframe_days
        }

    # 3. get_purchase_orders
    def get_purchase_orders(self, po_id: Optional[int] = None, supplier_id: Optional[int] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        query = self.db.query(PurchaseOrder)
        if po_id:
            query = query.filter(PurchaseOrder.id == po_id)
        if supplier_id:
            query = query.filter(PurchaseOrder.supplier_id == supplier_id)
        if status:
            query = query.filter(PurchaseOrder.status == status)

        pos = query.all()
        result = []
        for po in pos:
            sup = self.db.query(Supplier).filter(Supplier.id == po.supplier_id).first()
            comp = self.db.query(Component).filter(Component.id == po.component_id).first()
            result.append({
                "po_id": po.id,
                "po_number": po.po_number,
                "supplier_id": po.supplier_id,
                "supplier_name": sup.name if sup else "Unknown",
                "component_id": po.component_id,
                "component_code": comp.code if comp else "Unknown",
                "quantity": po.quantity,
                "unit_price": po.unit_price,
                "total_amount": po.total_amount,
                "status": po.status,
                "expected_delivery_date": po.expected_delivery_date.isoformat() if po.expected_delivery_date else None,
                "expedited": po.expedited
            })
        return result

    # 4. get_supplier_catalog
    def get_supplier_catalog(self, supplier_id: Optional[int] = None, component_id: Optional[int] = None) -> List[Dict[str, Any]]:
        query = self.db.query(SupplierCatalog)
        if supplier_id:
            query = query.filter(SupplierCatalog.supplier_id == supplier_id)
        if component_id:
            query = query.filter(SupplierCatalog.component_id == component_id)

        items = query.all()
        result = []
        for item in items:
            sup = self.db.query(Supplier).filter(Supplier.id == item.supplier_id).first()
            comp = self.db.query(Component).filter(Component.id == item.component_id).first()
            result.append({
                "catalog_id": item.id,
                "supplier_id": item.supplier_id,
                "supplier_name": sup.name if sup else "Unknown",
                "supplier_reliability": sup.reliability_score if sup else 80.0,
                "component_id": item.component_id,
                "component_code": comp.code if comp else "Unknown",
                "unit_price": item.unit_price,
                "lead_time_days": item.lead_time_days,
                "moq": item.moq,
                "quality_certifications": item.quality_certifications,
                "capacity_per_week": item.capacity_per_week
            })
        return result

    # 5. get_supplier_performance
    def get_supplier_performance(self, supplier_id: int) -> Dict[str, Any]:
        sup = self.db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not sup:
            return {"error": f"Supplier ID {supplier_id} not found."}

        pos = self.db.query(PurchaseOrder).filter(PurchaseOrder.supplier_id == supplier_id).all()
        delayed_pos = [p for p in pos if p.status == "Delayed"]
        on_time_delivery_rate = round(100.0 * (len(pos) - len(delayed_pos)) / float(max(1, len(pos))), 1)

        return {
            "supplier_id": sup.id,
            "supplier_code": sup.code,
            "supplier_name": sup.name,
            "reliability_score": sup.reliability_score,
            "quality_rating": sup.quality_rating,
            "certifications": sup.certifications,
            "on_time_delivery_rate": on_time_delivery_rate,
            "total_orders_handled": len(pos),
            "delayed_orders_count": len(delayed_pos),
            "status": sup.status
        }

    # 6. get_production_schedule
    def get_production_schedule(self, production_order_id: Optional[int] = None) -> List[Dict[str, Any]]:
        query = self.db.query(ProductionOrder)
        if production_order_id:
            query = query.filter(ProductionOrder.id == production_order_id)

        orders = query.all()
        result = []
        for o in orders:
            comp = self.db.query(Component).filter(Component.id == o.required_component_id).first()
            now = datetime.datetime.utcnow()
            days_until_due = (o.due_date - now).days

            result.append({
                "production_order_id": o.id,
                "order_number": o.order_number,
                "product_name": o.product_name,
                "customer_name": o.customer_name,
                "customer_priority": o.customer_priority,
                "quantity": o.quantity,
                "start_date": o.start_date.isoformat(),
                "due_date": o.due_date.isoformat(),
                "days_until_due": days_until_due,
                "status": o.status,
                "required_component_id": o.required_component_id,
                "required_component_code": comp.code if comp else "Unknown",
                "required_quantity": o.required_quantity
            })
        return result

    # 7. get_production_impact
    def get_production_impact(self, component_id: int, delay_days: int) -> Dict[str, Any]:
        comp = self.db.query(Component).filter(Component.id == component_id).first()
        if not comp:
            return {"error": f"Component ID {component_id} not found."}

        affected_orders = self.db.query(ProductionOrder).filter(
            ProductionOrder.required_component_id == component_id,
            ProductionOrder.status.in_(["Scheduled", "In_Progress"])
        ).all()

        now = datetime.datetime.utcnow()
        interrupted_orders = []
        tier1_affected = False

        for o in affected_orders:
            days_available = (o.due_date - now).days
            if delay_days > days_available:
                if o.customer_priority == "Tier 1":
                    tier1_affected = True
                interrupted_orders.append({
                    "production_order_id": o.id,
                    "order_number": o.order_number,
                    "customer": o.customer_name,
                    "priority": o.customer_priority,
                    "due_date": o.due_date.isoformat(),
                    "days_available": days_available,
                    "delay_excess_days": delay_days - days_available
                })

        return {
            "component_id": component_id,
            "component_code": comp.code,
            "delay_days": delay_days,
            "total_affected_production_orders": len(affected_orders),
            "at_risk_interrupted_orders": len(interrupted_orders),
            "tier1_customer_impact": tier1_affected,
            "interrupted_orders_detail": interrupted_orders,
            "impact_severity": "Critical" if tier1_affected else ("High" if len(interrupted_orders) > 0 else "Low")
        }

    # 8. get_supplier_messages
    def get_supplier_messages(self, supplier_id: Optional[int] = None, po_id: Optional[int] = None) -> List[Dict[str, Any]]:
        query = self.db.query(SupplierMessage)
        if supplier_id:
            query = query.filter(SupplierMessage.supplier_id == supplier_id)
        if po_id:
            query = query.filter(SupplierMessage.po_id == po_id)

        msgs = query.order_by(SupplierMessage.timestamp.desc()).all()
        return [{
            "message_id": m.id,
            "supplier_id": m.supplier_id,
            "po_id": m.po_id,
            "direction": m.direction,
            "message_text": m.message_text,
            "timestamp": m.timestamp.isoformat(),
            "status": m.status
        } for m in msgs]

    # 9. send_supplier_message
    def send_supplier_message(self, supplier_id: int, message: str, po_id: Optional[int] = None) -> Dict[str, Any]:
        msg = SupplierMessage(
            supplier_id=supplier_id,
            po_id=po_id,
            direction="outgoing",
            message_text=message,
            timestamp=datetime.datetime.utcnow(),
            status="Sent"
        )
        self.db.add(msg)
        self.db.commit()
        return {"status": "success", "message_id": msg.id, "details": "Outgoing inquiry transmitted to supplier API portal."}

    # 10. request_rfq
    def request_rfq(self, supplier_id: int, component_id: int, quantity: int, required_delivery_date: str) -> Dict[str, Any]:
        due_dt = datetime.datetime.fromisoformat(required_delivery_date.replace("Z", ""))
        rfq_num = f"RFQ-{int(datetime.datetime.utcnow().timestamp())}"
        
        # Check catalog for immediate response simulation
        cat = self.db.query(SupplierCatalog).filter(
            SupplierCatalog.supplier_id == supplier_id,
            SupplierCatalog.component_id == component_id
        ).first()

        unit_p = cat.unit_price if cat else 55.0
        lead_t = cat.lead_time_days if cat else 5
        moq_v = cat.moq if cat else 50
        actual_qty = max(quantity, moq_v)

        rfq = RFQ(
            rfq_number=rfq_num,
            supplier_id=supplier_id,
            component_id=component_id,
            quantity=actual_qty,
            required_delivery_date=due_dt,
            status="Responded",
            response_price=unit_p,
            response_delivery_date=datetime.datetime.utcnow() + datetime.timedelta(days=lead_t),
            response_moq=moq_v,
            response_notes=f"Quotation confirmed for {actual_qty} units. Lead time: {lead_t} days."
        )
        self.db.add(rfq)
        self.db.commit()
        self.db.refresh(rfq)

        return {
            "rfq_id": rfq.id,
            "rfq_number": rfq.rfq_number,
            "supplier_id": supplier_id,
            "component_id": component_id,
            "quoted_unit_price": unit_p,
            "quoted_total_cost": round(unit_p * actual_qty, 2),
            "quoted_lead_time_days": lead_t,
            "moq_applied": moq_v,
            "status": "Responded"
        }

    # 11. get_rfq_responses
    def get_rfq_responses(self, rfq_id: Optional[int] = None) -> List[Dict[str, Any]]:
        query = self.db.query(RFQ)
        if rfq_id:
            query = query.filter(RFQ.id == rfq_id)

        rfqs = query.all()
        return [{
            "rfq_id": r.id,
            "rfq_number": r.rfq_number,
            "supplier_id": r.supplier_id,
            "component_id": r.component_id,
            "quantity": r.quantity,
            "status": r.status,
            "response_price": r.response_price,
            "response_delivery_date": r.response_delivery_date.isoformat() if r.response_delivery_date else None,
            "response_moq": r.response_moq,
            "response_notes": r.response_notes
        } for r in rfqs]

    # 12. compare_suppliers
    def compare_suppliers(self, component_id: int, quantity: int, required_by_days: int = 10) -> Dict[str, Any]:
        comp = self.db.query(Component).filter(Component.id == component_id).first()
        catalogs = self.db.query(SupplierCatalog).filter(SupplierCatalog.component_id == component_id).all()
        
        options = []
        required_certs = ["ISO9001"] if comp and comp.criticality == "High" else []

        for cat in catalogs:
            sup = self.db.query(Supplier).filter(Supplier.id == cat.supplier_id).first()
            actual_qty = max(quantity, cat.moq)
            total_cost = cat.unit_price * actual_qty

            opt = {
                "option_id": f"OPT-SUP-{cat.supplier_id}",
                "component_id": component_id,
                "supplier_id": cat.supplier_id,
                "supplier_name": sup.name if sup else "Unknown",
                "strategy": f"Order {actual_qty} units from {sup.name if sup else 'Supplier'}",
                "unit_price": cat.unit_price,
                "order_quantity": actual_qty,
                "moq": cat.moq,
                "total_cost": total_cost,
                "incremental_cost": total_cost,
                "lead_time_days": cat.lead_time_days,
                "reliability_score": sup.reliability_score if sup else 80.0,
                "quality_certifications": cat.quality_certifications,
                "capacity_per_week": cat.capacity_per_week,
                "production_interrupted": cat.lead_time_days > required_by_days,
                "risk_level": "Low" if cat.lead_time_days <= required_by_days else "High"
            }

            validation = ConstraintValidator.validate_option(opt, required_certs, required_by_days)
            opt.update(validation)
            options.append(opt)

        return {
            "component_id": component_id,
            "component_code": comp.code if comp else "Unknown",
            "quantity_needed": quantity,
            "required_by_days": required_by_days,
            "compared_options": options
        }

    # 13. check_budget
    def check_budget(self, requested_amount: float) -> Dict[str, Any]:
        return ConstraintValidator.check_budget_constraint(requested_amount)

    # 14. check_approval_required
    def check_approval_required(self, action_type: str, cost_impact: float, risk_level: str = "Medium") -> Dict[str, Any]:
        return ConstraintValidator.check_approval_required(cost_impact, risk_level)

    # 15. update_erp
    def update_erp(self, action: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        now = datetime.datetime.utcnow()
        if action == "create_purchase_order":
            supplier_id = payload.get("supplier_id")
            component_id = payload.get("component_id")
            qty = payload.get("quantity", 100)
            unit_p = payload.get("unit_price", 50.0)
            lead_t = payload.get("lead_time_days", 5)

            po_num = f"PO-RECOV-{int(now.timestamp()*1000)}-{random.randint(1000, 9999)}"
            po = PurchaseOrder(
                po_number=po_num,
                supplier_id=supplier_id,
                component_id=component_id,
                quantity=qty,
                unit_price=unit_p,
                total_amount=round(unit_p * qty, 2),
                status="Confirmed",
                expected_delivery_date=now + datetime.timedelta(days=lead_t),
                expedited=payload.get("expedited", True)
            )
            self.db.add(po)
            self.db.commit()
            self.db.refresh(po)

            return {"status": "success", "action": action, "po_number": po.po_number, "message": "ERP Updated: Recovery Purchase Order issued and confirmed."}

        elif action == "modify_purchase_order":
            po_id = payload.get("po_id")
            po = self.db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
            if po:
                if "expedited" in payload:
                    po.expedited = payload["expedited"]
                if "expected_delivery_date" in payload:
                    po.expected_delivery_date = datetime.datetime.fromisoformat(payload["expected_delivery_date"])
                if "status" in payload:
                    po.status = payload["status"]
                self.db.commit()
                return {"status": "success", "action": action, "po_id": po.id, "message": "ERP Updated: PO parameters modified successfully."}

        elif action == "allocate_substitute_inventory":
            sub_id = payload.get("substitute_component_id")
            qty = payload.get("quantity", 50)
            comp = self.db.query(Component).filter(Component.id == sub_id).first()
            if comp and comp.current_stock >= qty:
                comp.current_stock -= qty
                self.db.commit()
                return {"status": "success", "action": action, "allocated_quantity": qty, "message": "ERP Updated: Substitute inventory allocated from safety stock."}

        return {"status": "success", "action": action, "message": f"ERP Action {action} executed."}

    # 16. get_shipment_tracking
    def get_shipment_tracking(self, tracking_number: Optional[str] = None, po_id: Optional[int] = None) -> List[Dict[str, Any]]:
        query = self.db.query(ShipmentTracking)
        if tracking_number:
            query = query.filter(ShipmentTracking.tracking_number == tracking_number)
        if po_id:
            query = query.filter(ShipmentTracking.po_id == po_id)

        trackings = query.all()
        return [{
            "tracking_id": t.id,
            "tracking_number": t.tracking_number,
            "po_id": t.po_id,
            "carrier": t.carrier,
            "origin": t.origin,
            "destination": t.destination,
            "current_location": t.current_location,
            "status": t.status,
            "estimated_delivery": t.estimated_delivery.isoformat(),
            "delays_reported": t.delays_reported
        } for t in trackings]

    # 17. calculate_delivery_feasibility
    def calculate_delivery_feasibility(self, supplier_id: int, lead_time_days: int, target_date_iso: str) -> Dict[str, Any]:
        target_dt = datetime.datetime.fromisoformat(target_date_iso.replace("Z", ""))
        now = datetime.datetime.utcnow()
        days_available = (target_dt - now).days

        feasible = lead_time_days <= days_available
        return {
            "supplier_id": supplier_id,
            "lead_time_days": lead_time_days,
            "target_date": target_date_iso,
            "days_available": days_available,
            "is_feasible": feasible,
            "slack_days": days_available - lead_time_days
        }

    # 18. calculate_production_coverage
    def calculate_production_coverage(self, component_id: int) -> Dict[str, Any]:
        return self.get_inventory_usage(component_id=component_id)

    # 19. create_audit_event
    def create_audit_event(self, event_type: str, details: Dict[str, Any], disruption_id: Optional[int] = None) -> Dict[str, Any]:
        audit = AuditEvent(
            timestamp=datetime.datetime.utcnow(),
            event_id=f"AUD-{int(datetime.datetime.utcnow().timestamp())}",
            disruption_id=disruption_id,
            agent_state=details.get("agent_state", "UNKNOWN"),
            tool_called=details.get("tool_called"),
            tool_input=details.get("tool_input"),
            tool_output=details.get("tool_output"),
            calculation_summary=details.get("calculation_summary"),
            decision_summary=details.get("decision_summary"),
            constraint_check_result=details.get("constraint_check_result"),
            approval_status=details.get("approval_status"),
            execution_result=details.get("execution_result"),
            verification_result=details.get("verification_result"),
            remaining_risk=details.get("remaining_risk")
        )
        self.db.add(audit)
        self.db.commit()
        return {"audit_id": audit.id, "status": "logged"}
