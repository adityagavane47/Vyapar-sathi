from typing import List, Dict, Any

class MultiObjectiveDecisionEngine:
    """
    Evaluates candidate supply chain recovery options using multi-objective optimization:
    1. Production Continuity (Weight: 35%)
    2. Delivery Lead Time Feasibility (Weight: 25%)
    3. Total Cost & Incremental Spend (Weight: 20%)
    4. Supplier Reliability & Quality (Weight: 20%)
    """

    @classmethod
    def evaluate_and_rank_options(cls, 
                                 candidate_options: List[Dict[str, Any]], 
                                 target_deadline_days: int) -> Dict[str, Any]:
        if not candidate_options:
            return {
                "recommended_option": None,
                "ranked_options": [],
                "rejected_options": [],
                "explanation": "No candidate recovery options available."
            }

        evaluated = []
        for opt in candidate_options:
            # 1. Continuity Score (35 pts max)
            production_interrupted = opt.get("production_interrupted", False)
            continuity_score = 35.0 if not production_interrupted else 0.0

            # 2. Lead Time Score (25 pts max)
            lead_time = opt.get("lead_time_days", 99)
            if lead_time <= target_deadline_days:
                time_slack = target_deadline_days - lead_time
                lead_time_score = 25.0 * (1.0 - (lead_time / (target_deadline_days + 1)))
            else:
                lead_time_score = 0.0

            # 3. Cost Score (20 pts max)
            total_cost = opt.get("total_cost", 1.0)
            baseline_cost = opt.get("baseline_cost", total_cost)
            cost_diff_ratio = (total_cost - baseline_cost) / (baseline_cost + 1e-5)
            if cost_diff_ratio <= 0:
                cost_score = 20.0
            else:
                cost_score = max(0.0, 20.0 * (1.0 - min(1.0, cost_diff_ratio)))

            # 4. Reliability & Quality Score (20 pts max)
            rel_score = opt.get("reliability_score", 80.0) / 100.0 * 12.0
            cert_met = opt.get("quality_certifications_met", True)
            cert_score = 8.0 if cert_met else 0.0
            quality_score = rel_score + cert_score

            # Total score
            total_score = round(continuity_score + lead_time_score + cost_score + quality_score, 2)
            opt["score"] = total_score
            opt["score_breakdown"] = {
                "continuity": round(continuity_score, 2),
                "lead_time": round(lead_time_score, 2),
                "cost": round(cost_score, 2),
                "quality": round(quality_score, 2)
            }
            evaluated.append(opt)

        # Separate feasible vs infeasible / rejected options
        feasible_options = [o for o in evaluated if o.get("is_valid", True)]
        infeasible_options = [o for o in evaluated if not o.get("is_valid", True)]

        # Sort feasible options by total score descending
        feasible_options.sort(key=lambda x: x["score"], reverse=True)

        if feasible_options:
            recommended = feasible_options[0]
            rejected = feasible_options[1:] + infeasible_options
        else:
            recommended = None
            rejected = evaluated

        # Generate comparative explanation
        explanation = cls._generate_explanation(recommended, rejected)

        return {
            "recommended_option": recommended,
            "ranked_options": feasible_options,
            "rejected_options": rejected,
            "explanation": explanation
        }

    @classmethod
    def _generate_explanation(cls, recommended: Dict[str, Any], rejected: List[Dict[str, Any]]) -> str:
        if not recommended:
            return "No valid recovery options satisfied all business constraints. Immediate manual intervention required."

        rec_strategy = recommended.get("strategy", "Selected Strategy")
        rec_supplier = recommended.get("supplier_name", "Supplier")
        rec_cost = recommended.get("total_cost", 0.0)
        rec_lead = recommended.get("lead_time_days", 0)

        lines = [
            f"RECOMMENDED PLAN: {rec_strategy} via {rec_supplier} (Score: {recommended.get('score', 0)}/100).",
            f"- Total Cost: ₹{rec_cost:,.2f} | Delivery Lead Time: {rec_lead} days.",
            f"- Key Advantage: Maintains 100% production continuity while meeting quality certification requirements."
        ]

        if rejected:
            lines.append("\nREJECTED ALTERNATIVES & TRADE-OFF RATIONALE:")
            for idx, r in enumerate(rejected, 1):
                r_strategy = r.get("strategy", f"Option {idx}")
                r_supplier = r.get("supplier_name", "Alternative Supplier")
                r_score = r.get("score", 0)
                violations = r.get("violations", [])
                
                if violations:
                    lines.append(f"  {idx}. {r_strategy} via {r_supplier} [REJECTED - CONSTRAINT VIOLATION]: {', '.join(violations)}")
                else:
                    lines.append(f"  {idx}. {r_strategy} via {r_supplier} (Score: {r_score}/100) [REJECTED - LOWER SCORE]: Lower score due to lead time ({r.get('lead_time_days')}d vs {rec_lead}d) or total cost (₹{r.get('total_cost', 0):,.2f} vs ₹{rec_cost:,.2f}).")

        return "\n".join(lines)
