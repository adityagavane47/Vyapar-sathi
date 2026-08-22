export interface DisruptionEvent {
  id: number;
  event_code: string;
  timestamp: string;
  event_type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  affected_entity_type: string;
  affected_entity_id: number;
  description: string;
  evidence: Record<string, any>;
  status: 'NEW' | 'TRIAGED' | 'INVESTIGATING' | 'IN_PROGRESS' | 'RESOLVED' | 'FAILED' | 'COMPLETE' | string;
}

export interface Supplier {
  id: number;
  code: string;
  name: string;
  contact_email: string;
  reliability_score: number;
  quality_rating: number;
  certifications: string[];
  max_capacity: number;
  lead_time_days: number;
  status: string;
}

export interface ComponentItem {
  id: number;
  code: string;
  name: string;
  description: string;
  unit_of_measure: string;
  unit_cost: number;
  criticality: 'High' | 'Medium' | 'Low';
  safety_stock: number;
  current_stock: number;
  substitute_component_ids: number[];
}

export interface InventoryItem {
  inventory_id: number;
  warehouse_id: number;
  warehouse_name: string;
  component_id: number;
  component_code: string;
  component_name: string;
  quantity: number;
  allocated_quantity: number;
  available_quantity: number;
  safety_stock_level: number;
  is_below_safety_stock: boolean;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier_id: number;
  component_id: number;
  supplier_name?: string;
  component_name?: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: string;
  expected_delivery_date: string;
  actual_delivery_date?: string;
  expedited: boolean;
}

export interface ProductionOrder {
  id: number;
  order_number: string;
  product_name: string;
  customer_name: string;
  customer_priority: 'Tier 1' | 'Tier 2' | 'Tier 3';
  quantity: number;
  start_date: string;
  due_date: string;
  status: string;
  required_component_id: number;
  required_quantity: number;
}

export interface CandidateOption {
  option_id: string;
  supplier_id?: number;
  supplier_name?: string;
  strategy: string;
  unit_price: number;
  order_quantity: number;
  total_cost: number;
  incremental_cost?: number;
  lead_time_days: number;
  reliability_score: number;
  quality_certifications: string[];
  production_interrupted: boolean;
  score: number;
  score_breakdown?: {
    continuity: number;
    lead_time: number;
    cost: number;
    quality: number;
  };
  is_valid?: boolean;
  violations?: string[];
}

export interface DecisionRecord {
  id: number;
  disruption_id: number;
  recommendation_summary: string;
  total_cost: number;
  lead_time_days: number;
  score: number;
  recommended_supplier_id?: number;
  options_evaluated: CandidateOption[];
  rejected_alternatives: CandidateOption[];
  reasoning: string;
  risk_assessment: string;
  requires_human_approval: boolean;
  status: string;
  created_at: string;
}

export interface HumanApproval {
  id: number;
  decision_id: number;
  disruption_id: number;
  title: string;
  description: string;
  cost_impact: number;
  risk_level: string;
  alternatives_summary: CandidateOption[];
  recommended_action: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approver_comments?: string;
  timestamp: string;
  decided_at?: string;
}

export interface AuditEvent {
  id: number;
  timestamp: string;
  event_id: string;
  disruption_id?: number;
  agent_state: string;
  tool_called?: string;
  tool_input?: Record<string, any>;
  tool_input_params?: Record<string, any>;
  tool_output?: Record<string, any>;
  calculation_summary?: string;
  decision_summary?: string;
  constraint_check_result?: Record<string, any>;
  approval_status?: string;
  execution_result?: string;
  verification_result?: string;
  remaining_risk?: string;
}

export interface AgentStatus {
  disruption_id: number;
  current_state: string;
  step_count: number;
  memory_context: Record<string, any>;
}

export interface PortHubSignal {
  port_name: string;
  port_code: string;
  congestion_index: number;
  weather_condition: string;
  vessel_wait_time_days: number;
  status: string;
}

export interface ExternalSignals {
  timestamp: string;
  weather_severity_index: number;
  overall_port_congestion: number;
  freight_rate_spike_index: number;
  active_port_hubs: PortHubSignal[];
  global_logistics_risk: string;
}

export interface SupplierRiskPrediction {
  supplier_id: number;
  supplier_name: string;
  disruption_probability: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  key_risk_drivers: string[];
  po_number?: string;
  component_name?: string;
  feature_snapshot: {
    reliability_score: number;
    lead_time_days: number;
    weather_severity_index: number;
    port_congestion_index: number;
  };
}

export interface ProactiveScanResult {
  status: string;
  timestamp: string;
  total_pos_scanned: number;
  proactive_disruptions_generated: number;
  generated_events: { event_id: number; event_code: string; description: string }[];
  predictions: SupplierRiskPrediction[];
}

