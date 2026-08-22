import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.database.models import AgentStateStore, DisruptionEvent

class AgentStateMemory:
    STATES = [
        "OBSERVE",
        "TRIAGE",
        "INVESTIGATE",
        "PLAN",
        "EVALUATE",
        "VALIDATE",
        "APPROVE_OR_EXECUTE",
        "WAITING_FOR_APPROVAL",
        "VERIFY",
        "REPLAN",
        "COMPLETE"
    ]

    def __init__(self, db: Session, disruption_id: int):
        self.db = db
        self.disruption_id = disruption_id
        self.store = self.db.query(AgentStateStore).filter(AgentStateStore.disruption_id == disruption_id).first()
        
        if not self.store:
            self.store = AgentStateStore(
                disruption_id=disruption_id,
                current_state="OBSERVE",
                memory_context={
                    "tools_called": [],
                    "observations": [],
                    "triage_summary": None,
                    "affected_component_id": None,
                    "affected_po_id": None,
                    "candidate_options": [],
                    "evaluated_options": [],
                    "selected_decision_id": None,
                    "approval_id": None,
                    "verification_result": None
                },
                step_count=0
            )
            self.db.add(self.store)
            self.db.commit()
            self.db.refresh(self.store)

    def transition_to(self, new_state: str):
        if new_state in self.STATES:
            self.store.current_state = new_state
            self.store.updated_at = datetime.datetime.utcnow()
            self.db.commit()

    def update_memory(self, key: str, value: Any):
        ctx = dict(self.store.memory_context or {})
        ctx[key] = value
        self.store.memory_context = ctx
        self.db.commit()

    def record_tool_call(self, tool_name: str, args: Dict[str, Any], result: Any):
        ctx = dict(self.store.memory_context or {})
        tools = list(ctx.get("tools_called", []))
        tools.append({
            "tool": tool_name,
            "args": args,
            "result_summary": str(result)[:300],
            "timestamp": datetime.datetime.utcnow().isoformat()
        })
        ctx["tools_called"] = tools
        self.store.memory_context = ctx
        self.store.step_count += 1
        self.db.commit()

    def get_context(self) -> Dict[str, Any]:
        return self.store.memory_context or {}

    def get_current_state(self) -> str:
        return self.store.current_state
