import numpy as np
from typing import Dict, Any, List
from sklearn.ensemble import RandomForestClassifier

class SupplierRiskModel:
    """
    Scikit-Learn Machine Learning Risk Model:
    Trains on historical supplier features & environmental signals to predict
    disruption probability and risk levels for open purchase orders.
    """

    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=50, random_state=42)
        self._train_initial_model()

    def _train_initial_model(self):
        """
        Trains model on synthetic historical dataset representing supply chain disruption patterns.
        Features: [reliability_score, quality_rating, lead_time_days, weather_severity, port_congestion, order_quantity_ratio]
        Target: 1 (Disrupted / Delayed), 0 (On-Time Delivery)
        """
        np.random.seed(42)
        N = 300
        
        # Synthetic Feature Generation
        reliability = np.random.uniform(60, 99, N)
        quality = np.random.uniform(3.5, 5.0, N)
        lead_time = np.random.uniform(2, 14, N)
        weather = np.random.uniform(1, 10, N)
        congestion = np.random.uniform(1, 10, N)
        qty_ratio = np.random.uniform(0.5, 2.5, N)

        X = np.column_stack([reliability, quality, lead_time, weather, congestion, qty_ratio])

        # Target rule: Low reliability (<80) OR high congestion (>7.5) OR severe weather (>7.0) increases disruption likelihood
        y = np.where(
            (reliability < 80) | (congestion > 7.5) | (weather > 7.5) | ((lead_time > 10) & (congestion > 6.0)),
            1, 0
        )

        self.model.fit(X, y)

    def predict_risk(self, supplier_data: Dict[str, Any], external_features: Dict[str, float], order_quantity: int = 500) -> Dict[str, Any]:
        """
        Predicts disruption probability for a given supplier and order context.
        """
        rel_score = float(supplier_data.get("reliability_score", 85.0))
        qual_rating = float(supplier_data.get("quality_rating", 4.5))
        lead_time = float(supplier_data.get("lead_time_days", 5))
        
        weather_idx = float(external_features.get("weather_severity_index", 5.0))
        port_idx = float(external_features.get("port_congestion_index", 5.0))
        
        max_cap = float(supplier_data.get("max_capacity", 2000))
        qty_ratio = min(3.0, order_quantity / max(1.0, max_cap / 4.0))

        X_input = np.array([[rel_score, qual_rating, lead_time, weather_idx, port_idx, qty_ratio]])
        
        # Predict probability of disruption class (1)
        prob = float(self.model.predict_proba(X_input)[0][1])

        # Assign Risk Level
        if prob >= 0.70:
            risk_level = "Critical"
        elif prob >= 0.50:
            risk_level = "High"
        elif prob >= 0.30:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        # Identify Key Risk Drivers
        drivers = []
        if port_idx >= 7.0:
            drivers.append(f"Port Congestion Alert ({port_idx}/10)")
        if weather_idx >= 7.0:
            drivers.append(f"Weather Radar Alert ({weather_idx}/10)")
        if rel_score < 85.0:
            drivers.append(f"Historical Reliability Warning ({rel_score}%)")
        if lead_time >= 8:
            drivers.append(f"Extended Lead Time ({lead_time} days)")
        if not drivers:
            drivers.append("Optimal Historical Parameters")

        return {
            "supplier_id": supplier_data.get("id"),
            "supplier_name": supplier_data.get("name"),
            "disruption_probability": round(prob * 100, 1),
            "prob_raw": prob,
            "risk_level": risk_level,
            "key_risk_drivers": drivers,
            "feature_snapshot": {
                "reliability_score": rel_score,
                "lead_time_days": lead_time,
                "weather_severity_index": weather_idx,
                "port_congestion_index": port_idx
            }
        }
