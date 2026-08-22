from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Disruption Event Schemas
class DisruptionEventCreate(BaseModel):
    event_type: str = Field(..., example="supplier_delay")
    severity: str = Field("Medium", example="High")
    affected_entity_type: str = Field(..., example="PurchaseOrder")
    affected_entity_id: int = Field(..., example=1)
    description: str = Field(..., example="Supplier SUP-001 delayed delivery of Microcontrollers by 7 days.")
    evidence: Dict[str, Any] = Field(default_factory=dict)

class DisruptionEventResponse(BaseModel):
    id: int
    event_code: str
    timestamp: datetime
    event_type: str
    severity: str
    affected_entity_type: str
    affected_entity_id: int
    description: str
    evidence: Dict[str, Any]
    status: str

    class Config:
        from_attributes = True

# Inventory Schemas
class ComponentResponse(BaseModel):
    id: int
    code: str
    name: str
    description: Optional[str]
    unit_of_measure: str
    unit_cost: float
    criticality: str
    safety_stock: int
    current_stock: int
    substitute_component_ids: List[int]

    class Config:
        from_attributes = True

class WarehouseResponse(BaseModel):
    id: int
    code: str
    name: str
    location: str
    capacity: int

    class Config:
        from_attributes = True

class InventoryItemResponse(BaseModel):
    id: int
    warehouse_id: int
    component_id: int
    quantity: int
    allocated_quantity: int
    safety_stock_level: int

    class Config:
        from_attributes = True

# Supplier Schemas
class SupplierResponse(BaseModel):
    id: int
    code: str
    name: str
    contact_email: str
    reliability_score: float
    quality_rating: float
    certifications: List[str]
    max_capacity: int
    lead_time_days: int
    status: str

    class Config:
        from_attributes = True

class SupplierCatalogResponse(BaseModel):
    id: int
    supplier_id: int
    component_id: int
    unit_price: float
    lead_time_days: int
    moq: int
    quality_certifications: List[str]
    capacity_per_week: int

    class Config:
        from_attributes = True

# Purchase & Production Orders
class PurchaseOrderResponse(BaseModel):
    id: int
    po_number: str
    supplier_id: int
    component_id: int
    quantity: int
    unit_price: float
    total_amount: float
    status: str
    expected_delivery_date: datetime
    actual_delivery_date: Optional[datetime] = None
    expedited: bool

    class Config:
        from_attributes = True

class ProductionOrderResponse(BaseModel):
    id: int
    order_number: str
    product_name: str
    customer_name: str
    customer_priority: str
    quantity: int
    start_date: datetime
    due_date: datetime
    status: str
    required_component_id: int
    required_quantity: int

    class Config:
        from_attributes = True

# Agent Decision & Approval Schemas
class CandidateOption(BaseModel):
    option_id: str
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    strategy: str # e.g. "Expedite Existing PO", "Secondary Supplier PO", "Split Order"
    total_cost: float
    unit_price: float
    lead_time_days: int
    expected_delivery_date: str
    production_interrupted: bool
    quality_certifications_met: bool
    moq_satisfied: bool
    score: float
    reasoning: str

class DecisionResponse(BaseModel):
    id: int
    disruption_id: int
    recommendation_summary: str
    total_cost: float
    lead_time_days: int
    score: float
    recommended_supplier_id: Optional[int]
    options_evaluated: List[Dict[str, Any]]
    rejected_alternatives: List[Dict[str, Any]]
    reasoning: str
    risk_assessment: str
    requires_human_approval: bool
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class HumanApprovalResponse(BaseModel):
    id: int
    decision_id: int
    disruption_id: int
    title: str
    description: str
    cost_impact: float
    risk_level: str
    alternatives_summary: List[Dict[str, Any]]
    recommended_action: str
    status: str
    approver_comments: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class ApprovalActionRequest(BaseModel):
    approver_comments: Optional[str] = "Approved by supply chain manager."

# Agent State & Run Schemas
class AgentRunRequest(BaseModel):
    disruption_id: int
    max_steps: Optional[int] = 15

class AgentStatusResponse(BaseModel):
    disruption_id: int
    current_state: str
    step_count: int
    memory_context: Dict[str, Any]

# Audit Schema
class AuditEventResponse(BaseModel):
    id: int
    timestamp: datetime
    event_id: str
    disruption_id: Optional[int]
    agent_state: str
    tool_called: Optional[str]
    tool_input: Optional[Dict[str, Any]]
    tool_output: Optional[Dict[str, Any]]
    calculation_summary: Optional[str]
    decision_summary: Optional[str]
    constraint_check_result: Optional[Dict[str, Any]]
    approval_status: Optional[str]
    execution_result: Optional[str]
    verification_result: Optional[str]
    remaining_risk: Optional[str]

    class Config:
        from_attributes = True
