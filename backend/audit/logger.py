import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.database.models import AuditEvent

class AuditLogger:
    def __init__(self, db: Session):
        self.db = db

    def log_step(self, 
                 agent_state: str, 
                 disruption_id: Optional[int] = None, 
                 tool_called: Optional[str] = None,
                 tool_input: Optional[Dict[str, Any]] = None,
                 tool_output: Optional[Dict[str, Any]] = None,
                 calculation_summary: Optional[str] = None,
                 decision_summary: Optional[str] = None,
                 constraint_check_result: Optional[Dict[str, Any]] = None,
                 approval_status: Optional[str] = None,
                 execution_result: Optional[str] = None,
                 verification_result: Optional[str] = None,
                 remaining_risk: Optional[str] = None) -> AuditEvent:
        
        event_id = f"AUD-{int(datetime.datetime.utcnow().timestamp() * 1000)}"
        audit = AuditEvent(
            timestamp=datetime.datetime.utcnow(),
            event_id=event_id,
            disruption_id=disruption_id,
            agent_state=agent_state,
            tool_called=tool_called,
            tool_input=tool_input,
            tool_output=tool_output,
            calculation_summary=calculation_summary,
            decision_summary=decision_summary,
            constraint_check_result=constraint_check_result,
            approval_status=approval_status,
            execution_result=execution_result,
            verification_result=verification_result,
            remaining_risk=remaining_risk
        )
        self.db.add(audit)
        self.db.commit()
        self.db.refresh(audit)
        return audit
