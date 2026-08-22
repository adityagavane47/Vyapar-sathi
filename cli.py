import sys
import argparse
import json
from backend.database import SessionLocal, init_db
from backend.simulation.engine import SimulationEngine
from backend.agent.orchestrator import AgentOrchestrator
from backend.database.models import DisruptionEvent, HumanApproval, AuditEvent, AgentStateStore

def main():
    parser = argparse.ArgumentParser(description="Vyapar Saathi Supply-Chain AI Agent CLI Test Suite")
    subparsers = parser.add_subparsers(dest="command", help="Available CLI commands")

    # Reset command
    subparsers.add_parser("reset", help="Reset simulation environment and seed data")

    # Trigger disruption
    trigger_parser = subparsers.add_parser("trigger-disruption", help="Trigger a disruption scenario")
    trigger_parser.add_argument("--scenario", default="supplier_delay_autonomous", 
                                choices=["supplier_delay_autonomous", "supplier_delay_high_cost", "quality_defect_moq", "contradictory_info"],
                                help="Scenario type to trigger")

    # Run agent
    run_parser = subparsers.add_parser("run-agent", help="Run agent orchestrator on a disruption")
    run_parser.add_argument("--disruption-id", type=int, required=True, help="Disruption ID to process")

    # Status command
    status_parser = subparsers.add_parser("status", help="Get current agent status and memory")
    status_parser.add_argument("--disruption-id", type=int, required=True, help="Disruption ID")

    # Approve command
    appr_parser = subparsers.add_parser("approve", help="Approve human decision request")
    appr_parser.add_argument("--approval-id", type=int, required=True, help="Approval Request ID")
    appr_parser.add_argument("--comments", default="Approved via CLI", help="Approver notes")

    # Reject command
    rej_parser = subparsers.add_parser("reject", help="Reject human decision request")
    rej_parser.add_argument("--approval-id", type=int, required=True, help="Approval Request ID")
    rej_parser.add_argument("--comments", default="Rejected via CLI", help="Rejection notes")

    # Audit log command
    audit_parser = subparsers.add_parser("audit-log", help="Display structured audit log")
    audit_parser.add_argument("--disruption-id", type=int, help="Optional Disruption ID filter")

    args = parser.parse_args()
    init_db()
    db = SessionLocal()

    try:
        if args.command == "reset":
            sim = SimulationEngine(db)
            res = sim.reset_simulation()
            print(f"RESET RESULT: {res['message']}")

        elif args.command == "trigger-disruption":
            sim = SimulationEngine(db)
            event = sim.trigger_scenario(args.scenario)
            print(f"DISRUPTION TRIGGERED:")
            print(f"  ID: {event.id} | Code: {event.event_code} | Type: {event.event_type} | Severity: {event.severity}")
            print(f"  Description: {event.description}")

        elif args.command == "run-agent":
            orch = AgentOrchestrator(db, args.disruption_id)
            res = orch.run_until_complete()
            print(f"AGENT EXECUTION COMPLETED:")
            print(f"  Final State: {res['final_state']}")
            for idx, step in enumerate(res['history'], 1):
                print(f"  Step {idx}: {step.get('state')} -> {step.get('message')}")

        elif args.command == "status":
            store = db.query(AgentStateStore).filter(AgentStateStore.disruption_id == args.disruption_id).first()
            if not store:
                print(f"No state found for Disruption ID {args.disruption_id}")
            else:
                print(f"AGENT STATUS (Disruption ID {args.disruption_id}):")
                print(f"  State: {store.current_state}")
                print(f"  Step Count: {store.step_count}")
                print(f"  Memory Context: {json.dumps(store.memory_context, indent=2)}")

        elif args.command == "approve":
            appr = db.query(HumanApproval).filter(HumanApproval.id == args.approval_id).first()
            if not appr:
                print(f"Approval ID {args.approval_id} not found.")
            else:
                appr.status = "APPROVED"
                appr.approver_comments = args.comments
                db.commit()
                print(f"APPROVAL GRANTED for ID {args.approval_id}. Resuming agent...")
                orch = AgentOrchestrator(db, appr.disruption_id)
                res = orch.run_until_complete()
                print(f"AGENT RESULT: Final State = {res['final_state']}")

        elif args.command == "reject":
            appr = db.query(HumanApproval).filter(HumanApproval.id == args.approval_id).first()
            if not appr:
                print(f"Approval ID {args.approval_id} not found.")
            else:
                appr.status = "REJECTED"
                appr.approver_comments = args.comments
                db.commit()
                print(f"APPROVAL REJECTED for ID {args.approval_id}. Triggering replanning...")
                orch = AgentOrchestrator(db, appr.disruption_id)
                res = orch.run_until_complete()
                print(f"AGENT RESULT: Final State = {res['final_state']}")

        elif args.command == "audit-log":
            query = db.query(AuditEvent)
            if args.disruption_id:
                query = query.filter(AuditEvent.disruption_id == args.disruption_id)
            audits = query.order_by(AuditEvent.timestamp.asc()).all()

            print(f"AUDIT TRAIL ({len(audits)} events):")
            for a in audits:
                print(f"[{a.timestamp.isoformat()}] [{a.agent_state}] {a.event_id}")
                if a.tool_called:
                    print(f"  Tool: {a.tool_called} | Input: {a.tool_input}")
                if a.calculation_summary:
                    print(f"  Calc: {a.calculation_summary[:120]}...")
                if a.execution_result:
                    print(f"  Exec: {a.execution_result}")
                if a.verification_result:
                    print(f"  Verify: {a.verification_result}")
                print("-" * 60)
        else:
            parser.print_help()

    finally:
        db.close()

if __name__ == "__main__":
    main()
