import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .connection import Base

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    contact_email = Column(String(100), nullable=False)
    reliability_score = Column(Float, default=85.0)  # 0 to 100
    quality_rating = Column(Float, default=4.5)     # 1 to 5
    certifications = Column(JSON, default=list)      # e.g., ["ISO9001", "AS9100"]
    max_capacity = Column(Integer, default=5000)
    lead_time_days = Column(Integer, default=7)
    status = Column(String(30), default="Active")

    catalog_items = relationship("SupplierCatalog", back_populates="supplier")
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")

class Component(Base):
    __tablename__ = "components"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    unit_of_measure = Column(String(20), default="Units")
    unit_cost = Column(Float, default=50.0)
    criticality = Column(String(20), default="Medium")  # High, Medium, Low
    safety_stock = Column(Integer, default=100)
    current_stock = Column(Integer, default=250)
    substitute_component_ids = Column(JSON, default=list)

    catalog_entries = relationship("SupplierCatalog", back_populates="component")

class SupplierCatalog(Base):
    __tablename__ = "supplier_catalogs"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    component_id = Column(Integer, ForeignKey("components.id"), nullable=False)
    unit_price = Column(Float, nullable=False)
    lead_time_days = Column(Integer, nullable=False)
    moq = Column(Integer, default=50) # Minimum Order Quantity
    quality_certifications = Column(JSON, default=list)
    capacity_per_week = Column(Integer, default=1000)

    supplier = relationship("Supplier", back_populates="catalog_items")
    component = relationship("Component", back_populates="catalog_entries")

class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    location = Column(String(100), nullable=False)
    capacity = Column(Integer, default=10000)

class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    component_id = Column(Integer, ForeignKey("components.id"), nullable=False)
    quantity = Column(Integer, default=0)
    allocated_quantity = Column(Integer, default=0)
    safety_stock_level = Column(Integer, default=50)

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String(50), unique=True, index=True, nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    component_id = Column(Integer, ForeignKey("components.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String(30), default="Sent")  # Draft, Sent, Confirmed, Delayed, Delivered, Cancelled
    expected_delivery_date = Column(DateTime, default=datetime.datetime.utcnow)
    actual_delivery_date = Column(DateTime, nullable=True)
    expedited = Column(Boolean, default=False)

    supplier = relationship("Supplier", back_populates="purchase_orders")

class ProductionOrder(Base):
    __tablename__ = "production_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    product_name = Column(String(100), nullable=False)
    customer_name = Column(String(100), nullable=False)
    customer_priority = Column(String(20), default="Tier 2")  # Tier 1, Tier 2, Tier 3
    quantity = Column(Integer, nullable=False)
    start_date = Column(DateTime, default=datetime.datetime.utcnow)
    due_date = Column(DateTime, nullable=False)
    status = Column(String(30), default="Scheduled")  # Scheduled, In_Progress, Delayed, Completed
    required_component_id = Column(Integer, ForeignKey("components.id"), nullable=False)
    required_quantity = Column(Integer, nullable=False)

class SupplierMessage(Base):
    __tablename__ = "supplier_messages"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=True)
    direction = Column(String(20), default="incoming")  # incoming, outgoing
    message_text = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(30), default="Received")

class RFQ(Base):
    __tablename__ = "rfqs"

    id = Column(Integer, primary_key=True, index=True)
    rfq_number = Column(String(50), unique=True, index=True, nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    component_id = Column(Integer, ForeignKey("components.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    required_delivery_date = Column(DateTime, nullable=False)
    status = Column(String(30), default="Submitted") # Submitted, Responded, Accepted, Rejected
    response_price = Column(Float, nullable=True)
    response_delivery_date = Column(DateTime, nullable=True)
    response_moq = Column(Integer, nullable=True)
    response_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ShipmentTracking(Base):
    __tablename__ = "shipment_trackings"

    id = Column(Integer, primary_key=True, index=True)
    tracking_number = Column(String(100), unique=True, index=True, nullable=False)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False)
    carrier = Column(String(50), default="LogiCorp Express")
    origin = Column(String(100), nullable=False)
    destination = Column(String(100), nullable=False)
    current_location = Column(String(100), nullable=False)
    status = Column(String(30), default="In_Transit") # In_Transit, Delayed, Customs_Hold, Delivered
    estimated_delivery = Column(DateTime, nullable=False)
    delays_reported = Column(Integer, default=0)

class DisruptionEvent(Base):
    __tablename__ = "disruption_events"

    id = Column(Integer, primary_key=True, index=True)
    event_code = Column(String(50), unique=True, index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    event_type = Column(String(50), nullable=False)  # supplier_delay, component_shortage, quality_failure, etc.
    severity = Column(String(20), default="Medium")  # Low, Medium, High, Critical
    affected_entity_type = Column(String(50), nullable=False)  # Supplier, Component, PurchaseOrder
    affected_entity_id = Column(Integer, nullable=False)
    description = Column(Text, nullable=False)
    evidence = Column(JSON, default=dict)
    status = Column(String(30), default="NEW")  # NEW, TRIAGED, INVESTIGATING, IN_PROGRESS, RESOLVED, FAILED

class AgentDecision(Base):
    __tablename__ = "agent_decisions"

    id = Column(Integer, primary_key=True, index=True)
    disruption_id = Column(Integer, ForeignKey("disruption_events.id"), nullable=False)
    recommendation_summary = Column(Text, nullable=False)
    total_cost = Column(Float, default=0.0)
    lead_time_days = Column(Integer, default=0)
    score = Column(Float, default=0.0)
    recommended_supplier_id = Column(Integer, nullable=True)
    options_evaluated = Column(JSON, default=list)
    rejected_alternatives = Column(JSON, default=list)
    reasoning = Column(Text, nullable=False)
    risk_assessment = Column(Text, nullable=False)
    requires_human_approval = Column(Boolean, default=False)
    status = Column(String(30), default="PROPOSED")  # PROPOSED, APPROVED, REJECTED, EXECUTED, FAILED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class HumanApproval(Base):
    __tablename__ = "human_approvals"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("agent_decisions.id"), nullable=False)
    disruption_id = Column(Integer, ForeignKey("disruption_events.id"), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    cost_impact = Column(Float, default=0.0)
    risk_level = Column(String(20), default="Medium")
    alternatives_summary = Column(JSON, default=list)
    recommended_action = Column(Text, nullable=False)
    status = Column(String(30), default="PENDING")  # PENDING, APPROVED, REJECTED
    approver_comments = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    event_id = Column(String(50), nullable=False)
    disruption_id = Column(Integer, nullable=True)
    agent_state = Column(String(50), nullable=False)
    tool_called = Column(String(100), nullable=True)
    tool_input = Column(JSON, nullable=True)
    tool_output = Column(JSON, nullable=True)
    calculation_summary = Column(Text, nullable=True)
    decision_summary = Column(Text, nullable=True)
    constraint_check_result = Column(JSON, nullable=True)
    approval_status = Column(String(30), nullable=True)
    execution_result = Column(Text, nullable=True)
    verification_result = Column(Text, nullable=True)
    remaining_risk = Column(Text, nullable=True)

class AgentStateStore(Base):
    __tablename__ = "agent_state_store"

    id = Column(Integer, primary_key=True, index=True)
    disruption_id = Column(Integer, ForeignKey("disruption_events.id"), unique=True, nullable=False)
    current_state = Column(String(50), default="OBSERVE")
    memory_context = Column(JSON, default=dict)
    step_count = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
