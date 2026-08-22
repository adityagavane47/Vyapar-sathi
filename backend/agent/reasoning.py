import os
import json
from typing import Dict, Any, List
from backend.tools.supply_chain_tools import SupplyChainTools

class AgentReasoningEngine:
    """
    Agent Reasoning & Tool Selection Engine:
    Selects tools dynamically based on current disruption context and state.
    Supports LLM API or deterministic rule-augmented reasoning fallback.
    """

    def __init__(self, tools: SupplyChainTools):
        self.tools = tools
        self.api_key = os.getenv("OPENAI_API_KEY") or os.getenv("GEMINI_API_KEY")

    def decide_next_actions(self, current_state: str, disruption_data: Dict[str, Any], memory_ctx: Dict[str, Any]) -> Dict[str, Any]:
        """
        Determines the next steps and tool calls for the current state.
        """
        tools_called_so_far = [t["tool"] for t in memory_ctx.get("tools_called", [])]

        if current_state == "OBSERVE":
            return {
                "thought": "Initial disruption event received. I must inspect the affected entity and log an observation.",
                "state_action": "triage_disruption",
                "recommended_tools": []
            }

        elif current_state == "TRIAGE":
            # Select tools to investigate affected entity and coverage
            recommended = []
            if "get_purchase_orders" not in tools_called_so_far and disruption_data.get("affected_entity_type") == "PurchaseOrder":
                recommended.append({"tool": "get_purchase_orders", "args": {"po_id": disruption_data.get("affected_entity_id")}})
            if "get_shipment_tracking" not in tools_called_so_far and disruption_data.get("affected_entity_type") == "PurchaseOrder":
                recommended.append({"tool": "get_shipment_tracking", "args": {"po_id": disruption_data.get("affected_entity_id")}})

            return {
                "thought": "Triaging disruption severity and verifying affected purchase orders and tracking status.",
                "state_action": "run_triage_tools",
                "recommended_tools": recommended
            }

        elif current_state == "INVESTIGATE":
            recommended = []
            comp_id = memory_ctx.get("affected_component_id", 1)

            if "get_inventory_usage" not in tools_called_so_far:
                recommended.append({"tool": "get_inventory_usage", "args": {"component_id": comp_id}})
            if "get_production_impact" not in tools_called_so_far:
                delay = disruption_data.get("evidence", {}).get("delay_days", 7)
                recommended.append({"tool": "get_production_impact", "args": {"component_id": comp_id, "delay_days": delay}})
            if "compare_suppliers" not in tools_called_so_far:
                qty = memory_ctx.get("required_quantity", 500)
                recommended.append({"tool": "compare_suppliers", "args": {"component_id": comp_id, "quantity": qty, "required_by_days": 10}})

            return {
                "thought": "Investigating inventory coverage, production impact, and discovering candidate alternate suppliers.",
                "state_action": "run_investigation_tools",
                "recommended_tools": recommended
            }

        elif current_state == "PLAN":
            return {
                "thought": "Formulating alternative recovery plans (Expedite Primary, Secondary Supplier Order, Substitute Stock).",
                "state_action": "generate_plans",
                "recommended_tools": []
            }

        elif current_state == "EVALUATE":
            return {
                "thought": "Running multi-objective Pareto scoring on candidate recovery options.",
                "state_action": "evaluate_options",
                "recommended_tools": []
            }

        elif current_state == "VALIDATE":
            return {
                "thought": "Enforcing hard business constraints (₹50k human approval threshold, MOQ, ISO certs, budget).",
                "state_action": "validate_constraints",
                "recommended_tools": []
            }

        elif current_state == "APPROVE_OR_EXECUTE":
            return {
                "thought": "Checking whether decision requires human authorization or can be executed autonomously.",
                "state_action": "determine_execution_path",
                "recommended_tools": []
            }

        elif current_state == "VERIFY":
            return {
                "thought": "Verifying ERP state updates and post-execution confirmation.",
                "state_action": "verify_outcome",
                "recommended_tools": []
            }

        elif current_state == "REPLAN":
            return {
                "thought": "Initial plan failed verification or was rejected by human coordinator. Re-evaluating secondary recovery options.",
                "state_action": "replan_secondary",
                "recommended_tools": []
            }

        return {
            "thought": "Agent execution cycle complete.",
            "state_action": "finish",
            "recommended_tools": []
        }
