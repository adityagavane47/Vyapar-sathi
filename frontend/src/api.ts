import {
  DisruptionEvent,
  InventoryItem,
  Supplier,
  PurchaseOrder,
  ProductionOrder,
  DecisionRecord,
  HumanApproval,
  AuditEvent,
  AgentStatus
} from './types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error ${res.status}: ${errText}`);
  }
  return res.json();
}

export const api = {
  // Disruptions
  getDisruptions: () => fetchJson<DisruptionEvent[]>(`${API_BASE}/disruptions`),
  getDisruptionDetail: (id: number) => fetchJson<DisruptionEvent>(`${API_BASE}/disruptions/${id}`),
  createDisruption: (data: {
    event_type: string;
    severity: string;
    affected_entity_type: string;
    affected_entity_id: number;
    description: string;
    evidence?: Record<string, any>;
  }) =>
    fetchJson<DisruptionEvent>(`${API_BASE}/disruptions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Supply Chain State
  getInventory: () => fetchJson<InventoryItem[]>(`${API_BASE}/inventory`),
  getSuppliers: () => fetchJson<Supplier[]>(`${API_BASE}/suppliers`),
  getPurchaseOrders: () => fetchJson<PurchaseOrder[]>(`${API_BASE}/purchase-orders`),
  getProductionOrders: () => fetchJson<ProductionOrder[]>(`${API_BASE}/production-orders`),

  // Agent Controls
  runAgent: (disruptionId: number, maxSteps = 15) =>
    fetchJson<{ final_state: string; history: any[] }>(`${API_BASE}/agent/run`, {
      method: 'POST',
      body: JSON.stringify({ disruption_id: disruptionId, max_steps: maxSteps }),
    }),

  stepAgent: (disruptionId: number) =>
    fetchJson<{ state: string; message: string; approval_id?: number }>(`${API_BASE}/agent/step`, {
      method: 'POST',
      body: JSON.stringify({ disruption_id: disruptionId }),
    }),

  getAgentStatus: (disruptionId: number) =>
    fetchJson<AgentStatus>(`${API_BASE}/agent/status?disruption_id=${disruptionId}`),

  // Decisions & Approvals
  getDecisions: (disruptionId?: number) =>
    fetchJson<DecisionRecord[]>(`${API_BASE}/decisions${disruptionId ? `?disruption_id=${disruptionId}` : ''}`),

  getApprovals: (status?: string) =>
    fetchJson<HumanApproval[]>(`${API_BASE}/approvals${status ? `?status=${status}` : ''}`),

  approveDecision: (approvalId: number, comments = 'Approved by Supply Chain Manager') =>
    fetchJson<{ status: string; message: string; agent_result: any }>(`${API_BASE}/approvals/${approvalId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approver_comments: comments }),
    }),

  rejectDecision: (approvalId: number, comments = 'Rejected by Manager') =>
    fetchJson<{ status: string; message: string; agent_result: any }>(`${API_BASE}/approvals/${approvalId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ approver_comments: comments }),
    }),

  // Audit Logs
  getAuditLogs: (disruptionId?: number) =>
    fetchJson<AuditEvent[]>(`${API_BASE}/audit${disruptionId ? `?disruption_id=${disruptionId}` : ''}`),

  // Simulation Controls
  resetSimulation: () =>
    fetchJson<{ status: string; message: string }>(`${API_BASE}/simulation/reset`, { method: 'POST' }),

  triggerDisruption: (scenario = 'supplier_delay_autonomous') =>
    fetchJson<{ status: string; disruption: DisruptionEvent }>(
      `${API_BASE}/simulation/trigger-disruption?scenario=${scenario}`,
      { method: 'POST' }
    ),
};
