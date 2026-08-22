import pytest
from backend.optimization.decision_engine import MultiObjectiveDecisionEngine

def test_multi_objective_ranking():
    options = [
        {
            "option_id": "OPT-1",
            "strategy": "Slow Cheap Supplier",
            "supplier_name": "Global Semi",
            "total_cost": 20000.0,
            "lead_time_days": 12,
            "reliability_score": 75.0,
            "quality_certifications_met": True,
            "production_interrupted": True,
            "is_valid": True
        },
        {
            "option_id": "OPT-2",
            "strategy": "Fast Reliable Supplier",
            "supplier_name": "Apex Micro",
            "total_cost": 26000.0,
            "lead_time_days": 3,
            "reliability_score": 88.0,
            "quality_certifications_met": True,
            "production_interrupted": False,
            "is_valid": True
        }
    ]

    result = MultiObjectiveDecisionEngine.evaluate_and_rank_options(options, target_deadline_days=10)
    recommended = result["recommended_option"]
    
    assert recommended is not None
    assert recommended["option_id"] == "OPT-2"  # Fast reliable supplier wins due to zero production disruption
    assert len(result["rejected_options"]) == 1
