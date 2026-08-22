from typing import Dict, Any, List

class ConstraintValidator:
    # Business Rule Configurations
    HUMAN_APPROVAL_COST_THRESHOLD = 50000.0  # Actions > $50k require human approval
    MAX_RECOVERY_BUDGET = 150000.0          # Max allowable recovery spend per disruption

    @classmethod
    def check_budget_constraint(cls, total_cost: float) -> Dict[str, Any]:
        passed = total_cost <= cls.MAX_RECOVERY_BUDGET
        return {
            "check": "budget_limit",
            "passed": passed,
            "details": f"Total cost ₹{total_cost:,.2f} vs Max budget ₹{cls.MAX_RECOVERY_BUDGET:,.2f}"
        }

    @classmethod
    def check_approval_required(cls, incremental_cost: float, risk_level: str = "Medium") -> Dict[str, Any]:
        requires_approval = (incremental_cost > cls.HUMAN_APPROVAL_COST_THRESHOLD) or (risk_level in ["High", "Critical"])
        return {
            "check": "human_approval_threshold",
            "requires_approval": requires_approval,
            "threshold": cls.HUMAN_APPROVAL_COST_THRESHOLD,
            "incremental_cost": incremental_cost,
            "risk_level": risk_level,
            "reason": f"Cost impact ₹{incremental_cost:,.2f} exceeds threshold ₹{cls.HUMAN_APPROVAL_COST_THRESHOLD:,.2f}" if incremental_cost > cls.HUMAN_APPROVAL_COST_THRESHOLD else f"Risk level {risk_level} demands human oversight."
        }

    @classmethod
    def check_moq_constraint(cls, supplier_moq: int, requested_quantity: int) -> Dict[str, Any]:
        passed = requested_quantity >= supplier_moq
        return {
            "check": "minimum_order_quantity",
            "passed": passed,
            "details": f"Requested {requested_quantity} units vs Supplier MOQ {supplier_moq} units"
        }

    @classmethod
    def check_certification_requirement(cls, required_certs: List[str], supplier_certs: List[str]) -> Dict[str, Any]:
        missing_certs = [cert for cert in required_certs if cert not in supplier_certs]
        passed = len(missing_certs) == 0
        return {
            "check": "quality_certifications",
            "passed": passed,
            "missing_certifications": missing_certs,
            "details": f"Supplier certifications {supplier_certs} meet required {required_certs}" if passed else f"Supplier missing required certifications: {missing_certs}"
        }

    @classmethod
    def check_delivery_feasibility(cls, lead_time_days: int, days_until_production_due: int) -> Dict[str, Any]:
        passed = lead_time_days <= days_until_production_due
        return {
            "check": "delivery_deadline_feasibility",
            "passed": passed,
            "lead_time_days": lead_time_days,
            "days_available": days_until_production_due,
            "details": f"Lead time {lead_time_days} days satisfies production deadline in {days_until_production_due} days" if passed else f"Lead time {lead_time_days} days exceeds deadline in {days_until_production_due} days"
        }

    @classmethod
    def check_capacity_constraint(cls, capacity_per_week: int, requested_quantity: int) -> Dict[str, Any]:
        passed = capacity_per_week >= requested_quantity
        return {
            "check": "supplier_capacity",
            "passed": passed,
            "details": f"Requested {requested_quantity} vs Weekly Capacity {capacity_per_week}"
        }

    @classmethod
    def validate_option(cls, 
                        option: Dict[str, Any], 
                        required_certs: List[str], 
                        days_until_production_due: int) -> Dict[str, Any]:
        checks = []
        passed_all = True
        violations = []

        # 1. Budget check
        b_check = cls.check_budget_constraint(option.get("total_cost", 0.0))
        checks.append(b_check)
        if not b_check["passed"]:
            passed_all = False
            violations.append(b_check["details"])

        # 2. MOQ check
        moq_check = cls.check_moq_constraint(
            supplier_moq=option.get("moq", 1), 
            requested_quantity=option.get("order_quantity", 0)
        )
        checks.append(moq_check)
        if not moq_check["passed"]:
            passed_all = False
            violations.append(moq_check["details"])

        # 3. Certifications check
        cert_check = cls.check_certification_requirement(
            required_certs=required_certs,
            supplier_certs=option.get("quality_certifications", [])
        )
        checks.append(cert_check)
        if not cert_check["passed"]:
            passed_all = False
            violations.append(cert_check["details"])

        # 4. Delivery Feasibility
        deliv_check = cls.check_delivery_feasibility(
            lead_time_days=option.get("lead_time_days", 99),
            days_until_production_due=days_until_production_due
        )
        checks.append(deliv_check)
        if not deliv_check["passed"]:
            passed_all = False
            violations.append(deliv_check["details"])

        # 5. Capacity Check
        cap_check = cls.check_capacity_constraint(
            capacity_per_week=option.get("capacity_per_week", 99999),
            requested_quantity=option.get("order_quantity", 0)
        )
        checks.append(cap_check)
        if not cap_check["passed"]:
            passed_all = False
            violations.append(cap_check["details"])

        # Approval check
        approval_check = cls.check_approval_required(
            incremental_cost=option.get("incremental_cost", option.get("total_cost", 0.0)),
            risk_level=option.get("risk_level", "Medium")
        )

        return {
            "is_valid": passed_all,
            "checks": checks,
            "violations": violations,
            "requires_human_approval": approval_check["requires_approval"],
            "approval_reason": approval_check["reason"]
        }
