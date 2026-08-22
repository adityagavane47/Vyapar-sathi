import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.database.models import DisruptionEvent, PurchaseOrder, AgentDecision, HumanApproval
from backend.agent.state_memory import AgentStateMemory
from backend.agent.reasoning import AgentReasoningEngine
from backend.tools.supply_chain_tools import SupplyChainTools
from backend.optimization.decision_engine import MultiObjectiveDecisionEngine
from backend.constraints.validator import ConstraintValidator
from backend.services.erp_service import ERPService
from backend.audit.logger import AuditLogger

class AgentOrchestrator:
    def __init__(self, db: Session, disruption_id: int):
        self.db = db
        self.disruption_id = disruption_id
        self.disruption = db.query(DisruptionEvent).filter(DisruptionEvent.id == disruption_id).first()
        if not self.disruption:
            raise ValueError(f"Disruption ID {disruption_id} not found.")

        self.memory = AgentStateMemory(db, disruption_id)
        self.tools = SupplyChainTools(db)
        self.reasoning = AgentReasoningEngine(self.tools)
        self.audit = AuditLogger(db)
        self.erp_service = ERPService(db)

    def step(self) -> Dict[str, Any]:
        """
        Executes one step in the agent state machine.
        """
        current_state = self.memory.get_current_state()
        disruption_dict = {
            "id": self.disruption.id,
            "event_code": self.disruption.event_code,
            "event_type": self.disruption.event_type,
            "severity": self.disruption.severity,
            "affected_entity_type": self.disruption.affected_entity_type,
            "affected_entity_id": self.disruption.affected_entity_id,
            "description": self.disruption.description,
            "evidence": self.disruption.evidence
        }
        memory_ctx = self.memory.get_context()

        # 1. Ask reasoning engine for next actions
        decision = self.reasoning.decide_next_actions(current_state, disruption_dict, memory_ctx)

        # 2. State Machine Handlers
        if current_state == "OBSERVE":
            self.disruption.status = "INVESTIGATING"
            self.db.commit()
            
            # Extract affected component/PO IDs
            if self.disruption.affected_entity_type == "PurchaseOrder":
                po = self.db.query(PurchaseOrder).filter(PurchaseOrder.id == self.disruption.affected_entity_id).first()
                if po:
                    self.memory.update_memory("affected_po_id", po.id)
                    self.memory.update_memory("affected_component_id", po.component_id)
                    self.memory.update_memory("required_quantity", po.quantity)

            self.audit.log_step(
                agent_state="OBSERVE",
                disruption_id=self.disruption_id,
                calculation_summary=f"Observation recorded: Disruption {self.disruption.event_code} ({self.disruption.event_type}) under triage."
            )
            self.memory.transition_to("TRIAGE")
            return {"state": "TRIAGE", "message": "Disruption observed and moved to Triage."}

        elif current_state == "TRIAGE":
            # Execute recommended triage tools
            for rec in decision.get("recommended_tools", []):
                t_name = rec["tool"]
                t_args = rec["args"]
                tool_func = getattr(self.tools, t_name, None)
                if tool_func:
                    res = tool_func(**t_args)
                    self.memory.record_tool_call(t_name, t_args, res)
                    self.audit.log_step(
                        agent_state="TRIAGE",
                        disruption_id=self.disruption_id,
                        tool_called=t_name,
                        tool_input=t_args,
                        tool_output={"summary": str(res)[:300]}
                    )

            self.memory.transition_to("INVESTIGATE")
            return {"state": "INVESTIGATE", "message": "Triage complete. Moving to Investigation stage."}

        elif current_state == "INVESTIGATE":
            # Execute investigation tools
            for rec in decision.get("recommended_tools", []):
                t_name = rec["tool"]
                t_args = rec["args"]
                tool_func = getattr(self.tools, t_name, None)
                if tool_func:
                    res = tool_func(**t_args)
                    self.memory.record_tool_call(t_name, t_args, res)
                    self.audit.log_step(
                        agent_state="INVESTIGATE",
                        disruption_id=self.disruption_id,
                        tool_called=t_name,
                        tool_input=t_args,
                        tool_output={"summary": str(res)[:300]}
                    )
                    if t_name == "compare_suppliers":
                        self.memory.update_memory("candidate_options", res.get("compared_options", []))

            self.memory.transition_to("PLAN")
            return {"state": "PLAN", "message": "Investigation complete. Generating recovery options."}

        elif current_state == "PLAN":
            candidates = self.memory.get_context().get("candidate_options", [])
            if not candidates:
                # Fallback candidate generation
                comp_id = self.memory.get_context().get("affected_component_id", 1)
                qty = self.memory.get_context().get("required_quantity", 500)
                comp_res = self.tools.compare_suppliers(comp_id, qty, required_by_days=10)
                candidates = comp_res.get("compared_options", [])
                self.memory.update_memory("candidate_options", candidates)

            self.audit.log_step(
                agent_state="PLAN",
                disruption_id=self.disruption_id,
                decision_summary=f"Generated {len(candidates)} candidate recovery options."
            )
            self.memory.transition_to("EVALUATE")
            return {"state": "EVALUATE", "message": f"Formulated {len(candidates)} recovery options."}

        elif current_state == "EVALUATE":
            candidates = self.memory.get_context().get("candidate_options", [])
            opt_result = MultiObjectiveDecisionEngine.evaluate_and_rank_options(candidates, target_deadline_days=10)
            self.memory.update_memory("evaluated_result", opt_result)

            self.audit.log_step(
                agent_state="EVALUATE",
                disruption_id=self.disruption_id,
                calculation_summary=opt_result.get("explanation")
            )
            self.memory.transition_to("VALIDATE")
            return {"state": "VALIDATE", "message": "Multi-objective option evaluation complete."}

        elif current_state == "VALIDATE":
            opt_result = self.memory.get_context().get("evaluated_result", {})
            recommended = opt_result.get("recommended_option")

            if not recommended:
                self.memory.transition_to("REPLAN")
                return {"state": "REPLAN", "message": "No valid options met constraints. Replanning required."}

            # Check if human approval is required ($50k or High Risk)
            cost_impact = recommended.get("incremental_cost", recommended.get("total_cost", 0.0))
            risk_level = recommended.get("risk_level", "Medium")
            appr_check = ConstraintValidator.check_approval_required(cost_impact, risk_level)

            # Persist Decision Record
            dec_rec = AgentDecision(
                disruption_id=self.disruption_id,
                recommendation_summary=recommended.get("strategy", "Recovery Strategy"),
                total_cost=recommended.get("total_cost", 0.0),
                lead_time_days=recommended.get("lead_time_days", 0),
                score=recommended.get("score", 0.0),
                recommended_supplier_id=recommended.get("supplier_id"),
                options_evaluated=opt_result.get("ranked_options", []),
                rejected_alternatives=opt_result.get("rejected_options", []),
                reasoning=opt_result.get("explanation", ""),
                risk_assessment=f"Risk Level: {risk_level}. Cost Impact: ${cost_impact:,.2f}.",
                requires_human_approval=appr_check["requires_approval"],
                status="PROPOSED"
            )
            self.db.add(dec_rec)
            self.db.commit()
            self.db.refresh(dec_rec)

            self.memory.update_memory("selected_decision_id", dec_rec.id)
            self.memory.update_memory("requires_human_approval", appr_check["requires_approval"])

            self.audit.log_step(
                agent_state="VALIDATE",
                disruption_id=self.disruption_id,
                constraint_check_result=appr_check,
                decision_summary=f"Decision {dec_rec.id} proposed. Human approval required: {appr_check['requires_approval']}."
            )

            self.memory.transition_to("APPROVE_OR_EXECUTE")
            return {"state": "APPROVE_OR_EXECUTE", "message": "Validation complete. Checking authorization mode."}

        elif current_state == "APPROVE_OR_EXECUTE":
            requires_human = self.memory.get_context().get("requires_human_approval", False)
            dec_id = self.memory.get_context().get("selected_decision_id")
            dec_rec = self.db.query(AgentDecision).filter(AgentDecision.id == dec_id).first()

            if requires_human:
                # Create Human Approval Request
                approval = HumanApproval(
                    decision_id=dec_id,
                    disruption_id=self.disruption_id,
                    title=f"APPROVAL REQUIRED: {dec_rec.recommendation_summary}",
                    description=f"Action cost (${dec_rec.total_cost:,.2f}) exceeds autonomous limit ($50,000). Direct human authorization required.",
                    cost_impact=dec_rec.total_cost,
                    risk_level="High",
                    alternatives_summary=dec_rec.options_evaluated,
                    recommended_action=dec_rec.recommendation_summary,
                    status="PENDING"
                )
                self.db.add(approval)
                self.db.commit()
                self.db.refresh(approval)

                self.memory.update_memory("approval_id", approval.id)
                self.memory.transition_to("WAITING_FOR_APPROVAL")
                self.disruption.status = "IN_PROGRESS"
                self.db.commit()

                self.audit.log_step(
                    agent_state="WAITING_FOR_APPROVAL",
                    disruption_id=self.disruption_id,
                    approval_status="PENDING",
                    decision_summary=f"Human approval requested (ID: {approval.id}). Agent suspended waiting for human decision."
                )
                return {"state": "WAITING_FOR_APPROVAL", "approval_id": approval.id, "message": "Escalated for Human Approval."}

            else:
                # Execute autonomously
                opt_result = self.memory.get_context().get("evaluated_result", {})
                recommended = opt_result.get("recommended_option", {})
                
                erp_res = self.tools.update_erp(
                    action="create_purchase_order",
                    payload={
                        "supplier_id": recommended.get("supplier_id"),
                        "component_id": self.memory.get_context().get("affected_component_id", 1),
                        "quantity": recommended.get("order_quantity", 500),
                        "unit_price": recommended.get("unit_price", 50.0),
                        "lead_time_days": recommended.get("lead_time_days", 3),
                        "expedited": True
                    }
                )
                if erp_res.get("po_number"):
                    recommended["po_number"] = erp_res.get("po_number")
                    self.memory.update_memory("evaluated_result", opt_result)

                if dec_rec:
                    dec_rec.status = "EXECUTED"
                    self.db.commit()

                self.audit.log_step(
                    agent_state="APPROVE_OR_EXECUTE",
                    disruption_id=self.disruption_id,
                    execution_result=erp_res.get("message")
                )

                self.memory.transition_to("VERIFY")
                return {"state": "VERIFY", "message": "Autonomous action executed in ERP. Moving to Verification."}

        elif current_state == "WAITING_FOR_APPROVAL":
            appr_id = self.memory.get_context().get("approval_id")
            approval = self.db.query(HumanApproval).filter(HumanApproval.id == appr_id).first()

            if not approval or approval.status == "PENDING":
                return {"state": "WAITING_FOR_APPROVAL", "message": "Still waiting for human manager response."}

            if approval.status == "REJECTED":
                self.audit.log_step(
                    agent_state="WAITING_FOR_APPROVAL",
                    disruption_id=self.disruption_id,
                    approval_status="REJECTED",
                    decision_summary=f"Human coordinator rejected proposed plan. Reason: {approval.approver_comments}."
                )
                self.memory.transition_to("REPLAN")
                return {"state": "REPLAN", "message": "Human rejected proposed recommendation. Entering Replanning stage."}

            elif approval.status == "APPROVED":
                # Execute approved decision
                opt_result = self.memory.get_context().get("evaluated_result", {})
                recommended = opt_result.get("recommended_option", {})

                erp_res = self.tools.update_erp(
                    action="create_purchase_order",
                    payload={
                        "supplier_id": recommended.get("supplier_id"),
                        "component_id": self.memory.get_context().get("affected_component_id", 1),
                        "quantity": recommended.get("order_quantity", 500),
                        "unit_price": recommended.get("unit_price", 50.0),
                        "lead_time_days": recommended.get("lead_time_days", 3),
                        "expedited": True
                    }
                )
                if erp_res.get("po_number"):
                    recommended["po_number"] = erp_res.get("po_number")
                    self.memory.update_memory("evaluated_result", opt_result)

                dec_id = self.memory.get_context().get("selected_decision_id")
                dec_rec = self.db.query(AgentDecision).filter(AgentDecision.id == dec_id).first()
                if dec_rec:
                    dec_rec.status = "EXECUTED"
                    self.db.commit()

                self.audit.log_step(
                    agent_state="APPROVE_OR_EXECUTE",
                    disruption_id=self.disruption_id,
                    approval_status="APPROVED",
                    execution_result=erp_res.get("message")
                )

                self.memory.transition_to("VERIFY")
                return {"state": "VERIFY", "message": "Human approved action. Executed in ERP. Moving to Verification."}

        elif current_state == "VERIFY":
            opt_result = self.memory.get_context().get("evaluated_result", {})
            v_res = self.erp_service.verify_action_execution(self.disruption_id, opt_result)

            self.audit.log_step(
                agent_state="VERIFY",
                disruption_id=self.disruption_id,
                verification_result=v_res.get("reason")
            )

            if v_res.get("verified"):
                self.memory.transition_to("COMPLETE")
                self.disruption.status = "RESOLVED"
                self.db.commit()
                return {"state": "COMPLETE", "message": "Execution verified successfully. Disruption resolved."}
            else:
                self.memory.transition_to("REPLAN")
                return {"state": "REPLAN", "message": "Verification failed. Triggering automatic replanning loop."}

        elif current_state == "REPLAN":
            # Re-evaluate secondary options
            candidates = self.memory.get_context().get("candidate_options", [])
            # Filter out top option if rejected
            secondary = candidates[1:] if len(candidates) > 1 else candidates
            self.memory.update_memory("candidate_options", secondary)

            self.audit.log_step(
                agent_state="REPLAN",
                disruption_id=self.disruption_id,
                decision_summary="Replanning initiated: Re-evaluating secondary supplier alternatives."
            )
            self.memory.transition_to("EVALUATE")
            return {"state": "EVALUATE", "message": "Replanning initiated. Re-evaluating remaining options."}

        elif current_state == "COMPLETE":
            return {"state": "COMPLETE", "message": "Agent workflow already completed for this disruption."}

        return {"state": current_state, "message": "No state transition executed."}

    def run_until_complete(self, max_steps: int = 15) -> Dict[str, Any]:
        """
        Runs state machine steps continuously until COMPLETE or WAITING_FOR_APPROVAL.
        """
        history = []
        for _ in range(max_steps):
            res = self.step()
            history.append(res)
            if res.get("state") in ["COMPLETE", "WAITING_FOR_APPROVAL"]:
                break
        return {
            "disruption_id": self.disruption_id,
            "final_state": self.memory.get_current_state(),
            "history": history
        }
