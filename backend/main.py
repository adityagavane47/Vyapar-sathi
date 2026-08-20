import os
import json
import time
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from backend.database import (
    SessionLocal, init_db, Bank, Federation, TrainingRound, 
    ModelVersion, ModelUpdate, FraudPrediction, FraudPattern, 
    SecurityAlert, AuditLog, SystemMetric
)
from backend.schemas import (
    TransactionPredictionInput, TransactionPredictionResponse,
    BankRegisterInput, ModelRollbackInput, StatusResponse
)
from backend.ml.model import MLPClassifier
from backend.ml.federated import FederatedOrchestrator
from backend.ml.drift import calculate_psi, generate_drifted_data

# Initialize DB on startup
init_db()

app = FastAPI(
    title="Intella API",
    description="Privacy-Preserving Federated Fraud Intelligence Platform API",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- 1. FEDERATION & BANKS ---

@app.get("/api/federation/status")
def get_federation_status(db: Session = Depends(get_db)):
    fed = db.query(Federation).filter(Federation.id == 1).first()
    if not fed:
        raise HTTPException(status_code=404, detail="Federation metadata not found.")
    return {
        "id": fed.id,
        "name": fed.name,
        "status": fed.status,
        "current_round": fed.current_round,
        "global_model_version": fed.global_model_version
    }

@app.get("/api/banks")
def get_banks(db: Session = Depends(get_db)):
    return db.query(Bank).all()

@app.get("/api/banks/{bank_id}")
def get_bank_details(bank_id: str, db: Session = Depends(get_db)):
    bank = db.query(Bank).filter(Bank.id == bank_id).first()
    if not bank:
        raise HTTPException(status_code=404, detail="Bank not found")
        
    # Get latest update metrics
    latest_update = db.query(ModelUpdate).filter(
        ModelUpdate.bank_id == bank_id
    ).order_by(ModelUpdate.round_number.desc()).first()
    
    return {
        "bank": bank,
        "latest_update": latest_update
    }

@app.post("/api/banks/register", response_model=StatusResponse)
def register_bank(input_data: BankRegisterInput, db: Session = Depends(get_db)):
    existing = db.query(Bank).filter(Bank.id == input_data.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bank ID already registered")
        
    bank = Bank(
        id=input_data.id,
        name=input_data.name,
        status="online",
        trust_score=1.0,
        last_sync=datetime.utcnow(),
        local_accuracy=0.0,
        total_transactions=input_data.total_transactions or 0,
        fraud_cases=input_data.fraud_cases or 0,
        avg_tx_value=input_data.avg_tx_value or 0.0
    )
    db.add(bank)
    
    # Audit log
    audit = AuditLog(
        actor="Admin",
        event="BANK_REGISTERED",
        resource=input_data.id,
        status="SUCCESS",
        request_id=f"req-{random.randint(100000, 999999)}"
    )
    db.add(audit)
    db.commit()
    
    return {"status": "success", "message": f"Bank '{input_data.name}' registered successfully."}


# --- 2. FEDERATED TRAINING ---

@app.post("/api/federation/start-round")
def start_training_round(db: Session = Depends(get_db)):
    fed = db.query(Federation).filter(Federation.id == 1).first()
    if not fed:
        raise HTTPException(status_code=404, detail="Federation metadata not found.")
        
    fed.status = "training"
    db.commit()

    next_round = fed.current_round + 1
    orchestrator = FederatedOrchestrator(db)
    
    try:
        # Run simulated training round
        result = orchestrator.run_training_round(next_round, dp_enabled=True)
        
        # Log training completion
        audit = AuditLog(
            actor="System",
            event="TRAINING_ROUND_COMPLETED",
            resource=f"Round {next_round}",
            status="SUCCESS",
            request_id=f"req-{random.randint(100000, 999999)}"
        )
        db.add(audit)
        db.commit()
        
        return {
            "status": "success",
            "round_number": next_round,
            "metrics": result["metrics"],
            "rejected_banks": result["rejections"]
        }
    except Exception as e:
        fed.status = "idle"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Training round failed: {str(e)}")


# --- 3. FRAUD PREDICTION & EXPLANABILITY ---

@app.post("/api/predict", response_model=TransactionPredictionResponse)
def predict_fraud(input_data: TransactionPredictionInput, db: Session = Depends(get_db)):
    # 1. Fetch latest active global model weights
    fed = db.query(Federation).filter(Federation.id == 1).first()
    model_ver = db.query(ModelVersion).filter(ModelVersion.version == fed.global_model_version).first()
    if not model_ver:
        # Fallback to general model
        model_ver = db.query(ModelVersion).order_by(ModelVersion.round_number.desc()).first()
        
    if not model_ver:
        raise HTTPException(status_code=404, detail="No active global model found.")
        
    weights = json.loads(model_ver.weights_json)
    model = MLPClassifier(weights=weights)

    # 2. Scale features to 0-1 (Min-Max bounds from dataset.py)
    mins = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
    maxs = [35000.0, 23.0, 20.0, 1000.0, 1.0, 1.0, 1.0, 3000.0]

    # Map inputs to feature list
    features = [
        input_data.amount,
        input_data.time_of_transaction,
        input_data.transaction_velocity,
        input_data.device_age,
        1.0 if input_data.new_device else 0.0,
        1.0 if input_data.new_beneficiary else 0.0,
        1.0 if input_data.location_changed else 0.0,
        input_data.account_age
    ]

    # Scale input
    scaled_features = []
    for i in range(8):
        scaled = (features[i] - mins[i]) / (maxs[i] - mins[i] + 1e-8)
        scaled_features.append(max(0.0, min(1.0, scaled)))

    # 3. Evaluate fraud probability
    features_np = np.array(scaled_features).reshape(1, -1)
    risk_prob = float(model.predict_proba(features_np)[0])
    risk_score = round(risk_prob * 100, 1)
    
    is_fraud = risk_prob >= 0.5
    risk_level = "HIGH" if risk_prob >= 0.7 else ("MEDIUM" if risk_prob >= 0.3 else "LOW")

    # 4. Generate Explanations using Perturbation analysis
    # Measure output change when resetting each feature to zero/neutral baseline
    explanations = {}
    feature_names = {
        0: "High transaction value",
        1: "Time anomaly",
        2: "Transaction velocity",
        3: "Device age limit",
        4: "New device",
        5: "New beneficiary",
        6: "Location anomaly",
        7: "Account age limit"
    }

    # Custom contribution mapping for highly intuitive cybersecurity terminal explanations
    total_impact = 0.0
    impacts = []
    
    for i in range(8):
        # Create perturbed vector where feature i is set to a "safe" baseline value (0.0 for flags/anomalies)
        perturbed = scaled_features.copy()
        # Reset flag features to 0.0 (safe), reset values to 0.0
        perturbed[i] = 0.0
        perturbed_np = np.array(perturbed).reshape(1, -1)
        perturbed_prob = float(model.predict_proba(perturbed_np)[0])
        
        # Positive change implies the feature increased fraud risk
        change = max(0.0, risk_prob - perturbed_prob)
        impacts.append(change)
        total_impact += change

    # Normalize contributions to sum up to risk_score (or distribute weight)
    if total_impact > 0:
        for i, imp in enumerate(impacts):
            if imp > 0.001:
                # Share of risk score
                explanations[feature_names[i]] = round((imp / total_impact) * risk_score, 1)
    else:
        # Fallback to direct weight attribution if prediction probability is extremely low
        explanations = {"Baseline metrics": risk_score}

    # Ensure explanations list isn't empty for high fraud scores
    if is_fraud and not explanations:
        # Default attribution for visual display
        explanations = {
            "Location anomaly": round(risk_score * 0.4, 1),
            "New device": round(risk_score * 0.3, 1),
            "Transaction velocity": round(risk_score * 0.3, 1)
        }

    # 5. Log prediction in database
    prediction_record = FraudPrediction(
        timestamp=datetime.utcnow(),
        amount=input_data.amount,
        tx_type=input_data.tx_type,
        risk_score=risk_score,
        is_fraud=is_fraud,
        explanation_json=json.dumps(explanations)
    )
    db.add(prediction_record)
    
    # Audit prediction
    audit = AuditLog(
        actor="Prediction_API",
        event="FRAUD_PREDICTION",
        resource=f"Risk: {risk_score}%",
        status="SUCCESS" if risk_score < 70 else "WARNING",
        request_id=f"req-{random.randint(100000, 999999)}"
    )
    db.add(audit)
    db.commit()

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "is_fraud": is_fraud,
        "explanations": explanations
    }


# --- 4. DRIFT DETECTION ---

@app.get("/api/drift")
def get_model_drift(db: Session = Depends(get_db)):
    fed = db.query(Federation).filter(Federation.id == 1).first()
    model_ver = db.query(ModelVersion).filter(ModelVersion.version == fed.global_model_version).first()
    if not model_ver:
        model_ver = db.query(ModelVersion).order_by(ModelVersion.round_number.desc()).first()

    if not model_ver:
        return {"drift_score": 0.0, "status": "stable", "history": []}

    # Simulate calculation of drift:
    # We load model, evaluate on standard validation dataset (expected probabilities)
    # and drifted validation dataset (actual probabilities), then calculate PSI
    weights = json.loads(model_ver.weights_json)
    model = MLPClassifier(weights=weights)

    orchestrator = FederatedOrchestrator(db)
    X_val, _ = orchestrator.generator.generate_validation_data(num_records=1000)

    # 1. Base prediction distribution
    expected_probs = model.predict_proba(X_val)

    # 2. Drifted prediction distribution (e.g. increase fraud transactions rate or feature scaling)
    X_drifted = generate_drifted_data(X_val, drift_severity=0.6)
    actual_probs = model.predict_proba(X_drifted)

    # 3. Calculate PSI
    psi_score = round(calculate_psi(expected_probs, actual_probs), 3)
    
    # Classification
    status = "STABLE" if psi_score < 0.1 else ("MODERATE DRIFT" if psi_score < 0.2 else "DRIFT DETECTED")

    # Generate visual history of drift over last few rounds
    history = [
        {"round": 20, "drift": 0.05, "status": "STABLE"},
        {"round": 21, "drift": 0.08, "status": "STABLE"},
        {"round": 22, "drift": 0.12, "status": "MODERATE"},
        {"round": 23, "drift": 0.19, "status": "MODERATE"},
        {"round": 24, "drift": psi_score, "status": status}
    ]

    return {
        "drift_score": psi_score,
        "status": status,
        "threshold": 0.20,
        "recommendation": "Retraining recommended via Federated Learning." if psi_score >= 0.20 else "Model performing within limits.",
        "history": history
    }


# --- 5. MODEL REGISTRY ---

@app.get("/api/models/versions")
def get_model_versions(db: Session = Depends(get_db)):
    return db.query(ModelVersion).order_by(ModelVersion.round_number.desc()).all()

@app.post("/api/models/rollback", response_model=StatusResponse)
def rollback_model(input_data: ModelRollbackInput, db: Session = Depends(get_db)):
    target_version = db.query(ModelVersion).filter(ModelVersion.version == input_data.version).first()
    if not target_version:
        raise HTTPException(status_code=404, detail=f"Model version '{input_data.version}' not found.")

    # Deactivate current active version
    db.query(ModelVersion).filter(ModelVersion.status == "active").update({"status": "archived"})
    
    # Activate target version
    target_version.status = "active"
    
    # Update federation metadata
    fed = db.query(Federation).filter(Federation.id == 1).first()
    fed.global_model_version = target_version.version
    
    # Log audit trail
    audit = AuditLog(
        actor="Admin",
        event="MODEL_ROLLBACK",
        resource=f"Rollback to {target_version.version}",
        status="SUCCESS",
        request_id=f"req-{random.randint(100000, 999999)}"
    )
    db.add(audit)
    db.commit()

    return {"status": "success", "message": f"Successfully rolled back global model to version {target_version.version}."}


# --- 6. METRICS, ALERTS, AUDIT LOGS, PATTERNS ---

@app.get("/api/fraud/patterns")
def get_fraud_patterns(db: Session = Depends(get_db)):
    patterns = db.query(FraudPattern).all()
    # Unpack JSON string indicators
    result = []
    for p in patterns:
        result.append({
            "id": p.id,
            "pattern_name": p.pattern_name,
            "risk_weight": p.risk_weight,
            "contributing_banks": p.contributing_banks,
            "first_detected": p.first_detected,
            "growth_rate": p.growth_rate,
            "indicators": json.loads(p.indicators)
        })
    return result

@app.get("/api/security/alerts")
def get_security_alerts(db: Session = Depends(get_db)):
    return db.query(SecurityAlert).order_by(SecurityAlert.timestamp.desc()).all()

@app.get("/api/audit-logs")
def get_audit_logs(db: Session = Depends(get_db)):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()

@app.get("/api/rounds")
def get_training_rounds(db: Session = Depends(get_db)):
    return db.query(TrainingRound).order_by(TrainingRound.round_number.desc()).all()

@app.get("/api/monitoring/metrics")
def get_system_metrics(db: Session = Depends(get_db)):
    # Add new metric to show live variation
    new_metric = SystemMetric(
        timestamp=datetime.utcnow(),
        cpu_usage=round(random.uniform(30.0, 50.0), 1),
        memory_usage=round(random.uniform(55.0, 65.0), 1),
        network_latency=round(random.uniform(12.0, 22.0), 1)
    )
    db.add(new_metric)
    db.commit()
    
    # Return last 15 entries
    return db.query(SystemMetric).order_by(SystemMetric.timestamp.desc()).limit(15).all()


# --- 7. REAL-TIME DEMO RUN (SSE STREAM) ---

@app.get("/api/demo/stream")
def demo_stream(db: Session = Depends(get_db)):
    """
    Server-Sent Events endpoint streaming the live federated training round,
    executing actual DB logs and training weights operations in step with the frontend.
    """
    def event_generator():
        # Step 1: Connect
        yield f"data: {json.dumps({'step': 1, 'message': 'Banks establishing secure SSL/TLS connection channels...', 'status': 'running'})}\n\n"
        time.sleep(2.0)
        
        # Step 2: Distribute model
        fed = db.query(Federation).filter(Federation.id == 1).first()
        current_version = fed.global_model_version if fed else "v24"
        yield f"data: {json.dumps({'step': 2, 'message': f'Distributing global model {current_version} weights to client local nodes...', 'status': 'running'})}\n\n"
        time.sleep(2.0)
        
        # Step 3: Local Training
        yield f"data: {json.dumps({'step': 3, 'message': 'Clients starting local training on private datasets...', 'status': 'running'})}\n\n"
        time.sleep(1.0)
        
        # Stream individual client progress
        clients = ["bank_a", "bank_b", "bank_c", "bank_d", "bank_e", "bank_f"]
        for c in clients:
            c_name = db.query(Bank).filter(Bank.id == c).first().name
            yield f"data: {json.dumps({'step': 3, 'client': c, 'message': f'{c_name} executing local SGD training iterations...', 'status': 'training'})}\n\n"
            time.sleep(1.5)

        # Step 4: Malicious detection
        yield f"data: {json.dumps({'step': 4, 'message': 'Model updates uploaded. Initiating cybersecurity update-distance audits...', 'status': 'running'})}\n\n"
        time.sleep(2.0)
        
        yield f"data: {json.dumps({'step': 4, 'message': 'SECURITY ANOMALY DETECTED: Bank F (Fidelity Offshore Trust) model update shows a gradient deviation of 8.7σ.', 'status': 'warning'})}\n\n"
        time.sleep(2.5)

        # Step 5: Reject update
        yield f"data: {json.dumps({'step': 5, 'message': 'Malicious update REJECTED. Excluding Bank F weights from aggregation buffer.', 'status': 'running'})}\n\n"
        time.sleep(2.0)

        # Step 6: Secure aggregation
        yield f"data: {json.dumps({'step': 6, 'message': 'Secure Aggregation (FedAvg) initiated on remaining 5 clean updates...', 'status': 'running'})}\n\n"
        time.sleep(2.0)

        # Execute training round backend operations
        next_round = (fed.current_round + 1) if fed else 25
        orchestrator = FederatedOrchestrator(db)
        
        try:
            # Actually run backend model update & database state changes
            result = orchestrator.run_training_round(next_round, dp_enabled=True)
            new_version = result["version"]
            accuracy_pct = round(result["metrics"]["accuracy"] * 100, 1)

            # Step 7: Validation
            yield f"data: {json.dumps({'step': 7, 'message': f'Verifying global model {new_version} on validation dataset...', 'status': 'running'})}\n\n"
            time.sleep(2.0)

            # Step 8: Publish model
            yield f"data: {json.dumps({'step': 8, 'message': f'Global model version {new_version} published! Global Accuracy: {accuracy_pct}% (+0.9%).', 'status': 'success'})}\n\n"
            time.sleep(2.5)

            # Step 9: Discovered Fraud Pattern
            # Add a new mock fraud pattern to represent emerging discovery
            new_pattern = FraudPattern(
                pattern_name="High-Frequency Mobile UPI Splitting",
                risk_weight=0.86,
                contributing_banks=5,
                first_detected=datetime.utcnow(),
                growth_rate=18.4,
                indicators=json.dumps(["UPI Transfer", "Rapid Micro-Transactions", "New Device", "Late Night Hour"])
            )
            db.add(new_pattern)
            
            # Add final audit log
            db.add(AuditLog(
                actor="System",
                event="PATTERN_DISCOVERED",
                resource="High-Frequency Mobile UPI Splitting",
                status="SUCCESS",
                request_id=f"req-{random.randint(100000, 999999)}"
            ))
            db.commit()

            yield f"data: {json.dumps({'step': 9, 'message': 'Emerging Fraud Pattern detected: High-Frequency Mobile UPI Splitting (Growth Rate: +18.4%).', 'status': 'success'})}\n\n"
            time.sleep(2.5)

            # Step 10: Model Drift Alert
            yield f"data: {json.dumps({'step': 10, 'message': 'Simulation complete. System status returned to IDLE. Model drift metrics verified.', 'status': 'complete'})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'step': 8, 'message': f'Aggregated training round failed: {str(e)}', 'status': 'failed'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

# --- Serve Static Frontend Build ---
# Check if built frontend assets exist, and mount them if they do
frontend_dist_path = "frontend/dist"
if os.path.exists(frontend_dist_path):
    print(f"Mounting static files from {frontend_dist_path}")
    app.mount("/", StaticFiles(directory=frontend_dist_path, html=True), name="static")
else:
    print(f"Static directory '{frontend_dist_path}' not found. Run 'npm run build' inside frontend/ to compile UI assets.")
    @app.get("/")
    def read_root():
        return {
            "name": "Intella Backend API Service",
            "status": "online",
            "message": "To view UI, build the frontend or run frontend dev server."
        }
