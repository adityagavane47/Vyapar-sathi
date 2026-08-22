import pytest
from backend.constraints.validator import ConstraintValidator

def test_human_approval_threshold():
    # Below $50,000 threshold
    check1 = ConstraintValidator.check_approval_required(25000.0, "Low")
    assert check1["requires_approval"] == False

    # Above $50,000 threshold
    check2 = ConstraintValidator.check_approval_required(65000.0, "Low")
    assert check2["requires_approval"] == True

    # High Risk regardless of cost
    check3 = ConstraintValidator.check_approval_required(10000.0, "High")
    assert check3["requires_approval"] == True

def test_moq_constraint():
    res1 = ConstraintValidator.check_moq_constraint(supplier_moq=100, requested_quantity=50)
    assert res1["passed"] == False

    res2 = ConstraintValidator.check_moq_constraint(supplier_moq=100, requested_quantity=150)
    assert res2["passed"] == True

def test_certification_requirement():
    res1 = ConstraintValidator.check_certification_requirement(
        required_certs=["ISO9001", "AS9100"],
        supplier_certs=["ISO9001"]
    )
    assert res1["passed"] == False
    assert "AS9100" in res1["missing_certifications"]

    res2 = ConstraintValidator.check_certification_requirement(
        required_certs=["ISO9001"],
        supplier_certs=["ISO9001", "AS9100"]
    )
    assert res2["passed"] == True
