import os
import json
from datetime import datetime, timedelta
import random
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./federasec.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Bank(Base):
    __tablename__ = "banks"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    status = Column(String, default="offline")  # online, offline
    trust_score = Column(Float, default=1.0)
    last_sync = Column(DateTime, nullable=True)
    local_accuracy = Column(Float, default=0.0)
    total_transactions = Column(Integer, default=0)
    fraud_cases = Column(Integer, default=0)
    avg_tx_value = Column(Float, default=0.0)

class Federation(Base):
    __tablename__ = "federations"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    status = Column(String, default="idle")  # idle, training, aggregating
    current_round = Column(Integer, default=0)
    global_model_version = Column(String, default="v0")

class TrainingRound(Base):
    __tablename__ = "training_rounds"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    round_number = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    global_accuracy = Column(Float)
    global_precision = Column(Float)
    global_recall = Column(Float)
    global_f1 = Column(Float)
    status = Column(String, default="completed")  # completed, failed

class ModelVersion(Base):
    __tablename__ = "model_versions"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    version = Column(String, nullable=False, unique=True)
    round_number = Column(Integer, nullable=False)
    accuracy = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1 = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="archived")  # active, archived, rollback
    weights_json = Column(Text)  # serialized numpy model weights

class ModelUpdate(Base):
    __tablename__ = "model_updates"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    round_number = Column(Integer, nullable=False)
    bank_id = Column(String, nullable=False)
    accuracy = Column(Float)
    deviation = Column(Float)  # L2 distance from global/median update
    status = Column(String, default="accepted")  # accepted, rejected
    rejection_reason = Column(String, nullable=True)

class FraudPrediction(Base):
    __tablename__ = "fraud_predictions"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    amount = Column(Float)
    tx_type = Column(String)
    risk_score = Column(Float)  # percentage (0-100)
    is_fraud = Column(Boolean)
    explanation_json = Column(Text)  # contributing features

class FraudPattern(Base):
    __tablename__ = "fraud_patterns"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    pattern_name = Column(String, nullable=False)
    risk_weight = Column(Float)
    contributing_banks = Column(Integer)
    first_detected = Column(DateTime, default=datetime.utcnow)
    growth_rate = Column(Float)
    indicators = Column(Text)  # json list of indicator features

class SecurityAlert(Base):
    __tablename__ = "security_alerts"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    bank_id = Column(String, nullable=False)
    alert_type = Column(String)  # anomaly, model poisoning
    severity = Column(String)  # HIGH, MEDIUM, LOW
    details = Column(Text)
    status = Column(String, default="blocked")  # blocked, resolved

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    actor = Column(String, nullable=False)
    event = Column(String, nullable=False)
    resource = Column(String)
    status = Column(String, default="SUCCESS")
    request_id = Column(String)

class SystemMetric(Base):
    __tablename__ = "system_metrics"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    cpu_usage = Column(Float)
    memory_usage = Column(Float)
    network_latency = Column(Float)

def init_db():
    from backend.ml.model import MLPClassifier
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if database is already seeded
        if db.query(Bank).first() is not None:
            return

        print("Seeding database...")

        # 1. Seed Banks (Bank A to F)
        banks_data = [
            {"id": "bank_a", "name": "Aegis Retail Bank", "status": "online", "trust_score": 0.98, "total_transactions": 25480, "fraud_cases": 182, "avg_tx_value": 85.5, "local_accuracy": 0.942},
            {"id": "bank_b", "name": "Boreal Digital Credit", "status": "online", "trust_score": 0.99, "total_transactions": 18920, "fraud_cases": 243, "avg_tx_value": 42.1, "local_accuracy": 0.951},
            {"id": "bank_c", "name": "Crestwood Commercial", "status": "online", "trust_score": 0.97, "total_transactions": 12430, "fraud_cases": 92, "avg_tx_value": 450.0, "local_accuracy": 0.938},
            {"id": "bank_d", "name": "Delta Wealth Management", "status": "online", "trust_score": 0.99, "total_transactions": 5420, "fraud_cases": 41, "avg_tx_value": 1250.0, "local_accuracy": 0.947},
            {"id": "bank_e", "name": "Elysian Mobile Pay", "status": "online", "trust_score": 0.96, "total_transactions": 35640, "fraud_cases": 412, "avg_tx_value": 28.3, "local_accuracy": 0.931},
            {"id": "bank_f", "name": "Fidelity Offshore Trust", "status": "online", "trust_score": 0.52, "total_transactions": 8410, "fraud_cases": 110, "avg_tx_value": 780.0, "local_accuracy": 0.725},
        ]
        for b_data in banks_data:
            bank = Bank(
                id=b_data["id"],
                name=b_data["name"],
                status=b_data["status"],
                trust_score=b_data["trust_score"],
                last_sync=datetime.utcnow() - timedelta(minutes=random.randint(1, 15)),
                local_accuracy=b_data["local_accuracy"],
                total_transactions=b_data["total_transactions"],
                fraud_cases=b_data["fraud_cases"],
                avg_tx_value=b_data["avg_tx_value"]
            )
            db.add(bank)

        # 2. Seed Federation
        fed = Federation(
            id=1,
            name="Global Fraud Intelligence Federation",
            status="idle",
            current_round=24,
            global_model_version="v24"
        )
        db.add(fed)

        # 3. Seed Training Rounds History (Rounds 1 to 24)
        base_time = datetime.utcnow() - timedelta(days=5)
        accuracy = 0.82
        precision = 0.79
        recall = 0.75
        f1 = 0.77
        
        for r in range(1, 25):
            # Gradual model improvement
            accuracy = min(0.97, accuracy + random.uniform(0.003, 0.008))
            precision = min(0.96, precision + random.uniform(0.004, 0.009))
            recall = min(0.93, recall + random.uniform(0.005, 0.01))
            f1 = min(0.95, f1 + random.uniform(0.004, 0.009))

            tr_round = TrainingRound(
                round_number=r,
                timestamp=base_time + timedelta(hours=r * 5),
                global_accuracy=round(accuracy, 4),
                global_precision=round(precision, 4),
                global_recall=round(recall, 4),
                global_f1=round(f1, 4),
                status="completed"
            )
            db.add(tr_round)

            # Keep a subset of model versions in the registry
            if r in [21, 22, 23, 24]:
                status_str = "active" if r == 24 else "archived"
                model_ver = ModelVersion(
                    version=f"v{r}",
                    round_number=r,
                    accuracy=round(accuracy, 4),
                    precision=round(precision, 4),
                    recall=round(recall, 4),
                    f1=round(f1, 4),
                    created_at=base_time + timedelta(hours=r * 5),
                    status=status_str,
                    weights_json=json.dumps(MLPClassifier().get_weights())
                )
                db.add(model_ver)

        # 4. Seed some Model Updates for round 24
        for b_data in banks_data:
            # Let Bank F have a high deviation on past updates
            dev_val = random.uniform(0.1, 0.25) if b_data["id"] != "bank_f" else 8.7
            status_str = "accepted" if b_data["id"] != "bank_f" else "rejected"
            reason_str = None if b_data["id"] != "bank_f" else "Potential model poisoning attack (Gradient deviation 8.7σ)"
            
            update = ModelUpdate(
                round_number=24,
                bank_id=b_data["id"],
                accuracy=b_data["local_accuracy"],
                deviation=round(dev_val, 4),
                status=status_str,
                rejection_reason=reason_str
            )
            db.add(update)

        # 5. Seed Security Alerts
        alert = SecurityAlert(
            timestamp=datetime.utcnow() - timedelta(minutes=45),
            bank_id="bank_f",
            alert_type="Model Poisoning Attempt",
            severity="HIGH",
            details="Gradient update anomaly detected: L2 distance from global weight centroid is 8.7σ higher than average client deviation.",
            status="blocked"
        )
        db.add(alert)

        # 6. Seed Fraud Patterns
        patterns = [
            {
                "pattern_name": "High-Velocity Cross-Border CNP",
                "risk_weight": 0.89,
                "contributing_banks": 5,
                "growth_rate": 14.5,
                "indicators": json.dumps(["New Device", "Unusual Location", "High Frequency", "Card Not Present"])
            },
            {
                "pattern_name": "Card-Present ATM Skimming Clustering",
                "risk_weight": 0.72,
                "contributing_banks": 3,
                "growth_rate": -3.2,
                "indicators": json.dumps(["Physical Card Reader", "Multiple Small Withdrawals", "Night Hours"])
            },
            {
                "pattern_name": "Instant Transfer Account Takeover (ATO)",
                "risk_weight": 0.94,
                "contributing_banks": 4,
                "growth_rate": 28.1,
                "indicators": json.dumps(["New Beneficiary added", "Immediate High-Value Transfer", "Device Swapped", "Changed Location"])
            }
        ]
        for p in patterns:
            pat = FraudPattern(
                pattern_name=p["pattern_name"],
                risk_weight=p["risk_weight"],
                contributing_banks=p["contributing_banks"],
                first_detected=datetime.utcnow() - timedelta(days=random.randint(1, 10)),
                growth_rate=p["growth_rate"],
                indicators=p["indicators"]
            )
            db.add(pat)

        # 7. Seed Audit Logs
        logs = [
            {"actor": "System", "event": "FEDERATION_INITIALIZED", "resource": "Federation 1", "status": "SUCCESS"},
            {"actor": "Admin", "event": "REGISTER_BANK", "resource": "bank_a", "status": "SUCCESS"},
            {"actor": "Admin", "event": "REGISTER_BANK", "resource": "bank_b", "status": "SUCCESS"},
            {"actor": "Admin", "event": "REGISTER_BANK", "resource": "bank_c", "status": "SUCCESS"},
            {"actor": "Admin", "event": "REGISTER_BANK", "resource": "bank_d", "status": "SUCCESS"},
            {"actor": "Admin", "event": "REGISTER_BANK", "resource": "bank_e", "status": "SUCCESS"},
            {"actor": "Admin", "event": "REGISTER_BANK", "resource": "bank_f", "status": "SUCCESS"},
            {"actor": "bank_a", "event": "MODEL_UPDATE_SUBMITTED", "resource": "Round 24 Update", "status": "SUCCESS"},
            {"actor": "bank_b", "event": "MODEL_UPDATE_SUBMITTED", "resource": "Round 24 Update", "status": "SUCCESS"},
            {"actor": "bank_c", "event": "MODEL_UPDATE_SUBMITTED", "resource": "Round 24 Update", "status": "SUCCESS"},
            {"actor": "bank_d", "event": "MODEL_UPDATE_SUBMITTED", "resource": "Round 24 Update", "status": "SUCCESS"},
            {"actor": "bank_e", "event": "MODEL_UPDATE_SUBMITTED", "resource": "Round 24 Update", "status": "SUCCESS"},
            {"actor": "bank_f", "event": "MODEL_UPDATE_SUBMITTED", "resource": "Round 24 Update", "status": "WARNING"},
            {"actor": "System", "event": "MALICIOUS_UPDATE_DETECTED", "resource": "bank_f", "status": "WARNING"},
            {"actor": "System", "event": "AGGREGATION_COMPLETED", "resource": "Round 24", "status": "SUCCESS"},
            {"actor": "System", "event": "GLOBAL_MODEL_PUBLISHED", "resource": "Model Version v24", "status": "SUCCESS"},
        ]
        for idx, l in enumerate(logs):
            audit = AuditLog(
                timestamp=datetime.utcnow() - timedelta(minutes=(60 - idx * 3)),
                actor=l["actor"],
                event=l["event"],
                resource=l["resource"],
                status=l["status"],
                request_id=f"req-{random.randint(100000, 999999)}"
            )
            db.add(audit)

        # 8. Seed System Metrics
        for i in range(12):
            metric = SystemMetric(
                timestamp=datetime.utcnow() - timedelta(minutes=i*5),
                cpu_usage=round(random.uniform(25.0, 65.0), 1),
                memory_usage=round(random.uniform(40.0, 75.0), 1),
                network_latency=round(random.uniform(10.0, 35.0), 1)
            )
            # Custom attribute fix: standard python timedelta does not have 'five_minutes'.
            # Wait, timedelta has 'minutes'. Let's write standard timedelta(minutes=i*5). Let's fix this in the code below.
            # I will fix this immediately.
            db.add(metric)

        db.commit()
        print("Database seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

# Quick fix: correct the timedelta argument in the system metrics generation
# timedelta(minutes=i*5) instead of timedelta(five_minutes=i*5)
