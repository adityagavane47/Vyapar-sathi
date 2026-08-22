import random
import datetime
from typing import Dict, Any, List

class ExternalSignalsSimulator:
    """
    Simulates live external environmental feeds:
    1. Weather Radar Index (0-10) at transit ports.
    2. Port Congestion Index (0-10) at major hubs.
    3. Freight Volatility Index (0-10).
    """

    PORTS = [
        {"name": "Port of Singapore", "code": "SGP-HUB", "baseline_congestion": 6.8, "weather": "Monsoon Heavy Rain"},
        {"name": "Port of Shenzhen", "code": "SZN-HUB", "baseline_congestion": 7.5, "weather": "Typhoon Warning"},
        {"name": "Port of Mumbai (JNPT)", "code": "BOM-HUB", "baseline_congestion": 4.2, "weather": "Clear Skies"},
        {"name": "Port of Hamburg", "code": "HAM-HUB", "baseline_congestion": 3.5, "weather": "High Winds"}
    ]

    @classmethod
    def get_live_signals(cls) -> Dict[str, Any]:
        now = datetime.datetime.utcnow()

        port_data = []
        for p in cls.PORTS:
            # Introduce stochastic variation
            congestion = round(min(10.0, max(1.0, p["baseline_congestion"] + random.uniform(-0.5, 0.8))), 1)
            port_data.append({
                "port_name": p["name"],
                "port_code": p["code"],
                "congestion_index": congestion,
                "weather_condition": p["weather"],
                "vessel_wait_time_days": round(congestion * 0.7, 1),
                "status": "Critical Congestion" if congestion >= 7.5 else ("Moderate Delay" if congestion >= 5.0 else "Normal")
            })

        # Weather Severity Index (0-10)
        weather_severity = round(random.uniform(5.5, 8.5), 1)

        # Freight Rate Spike Index (0-10)
        freight_spike_index = round(random.uniform(4.0, 7.8), 1)

        return {
            "timestamp": now.isoformat(),
            "weather_severity_index": weather_severity,
            "overall_port_congestion": round(sum(p["congestion_index"] for p in port_data) / len(port_data), 1),
            "freight_rate_spike_index": freight_spike_index,
            "active_port_hubs": port_data,
            "global_logistics_risk": "Elevated" if weather_severity > 6.0 or freight_spike_index > 6.0 else "Stable"
        }

    @classmethod
    def get_supplier_external_features(cls, supplier_code: str) -> Dict[str, float]:
        """
        Maps supplier location/route to live external risk indices.
        """
        signals = cls.get_live_signals()
        
        # TechComponents Global (SUP-001) ships via Shenzhen/Singapore
        if supplier_code == "SUP-001":
            weather_idx = 7.8
            port_idx = 8.2
        # Vanguard Assemblies (SUP-005) ships via Mumbai/Singapore
        elif supplier_code == "SUP-005":
            weather_idx = 6.5
            port_idx = 7.0
        # Apex Micro (SUP-002) fast regional route
        elif supplier_code == "SUP-002":
            weather_idx = 3.2
            port_idx = 4.0
        else:
            weather_idx = 4.5
            port_idx = 5.0

        return {
            "weather_severity_index": weather_idx,
            "port_congestion_index": port_idx,
            "freight_rate_spike_index": signals["freight_rate_spike_index"]
        }
