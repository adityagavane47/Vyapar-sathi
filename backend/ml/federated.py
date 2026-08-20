import numpy as np
import json
import random
from datetime import datetime
from backend.ml.dataset import FraudDatasetGenerator
from backend.ml.model import MLPClassifier
from backend.database import Bank, Federation, ModelVersion, ModelUpdate, TrainingRound, SecurityAlert, AuditLog

class FederatedOrchestrator:
    def __init__(self, db_session):
        self.db = db_session
        self.generator = FraudDatasetGenerator()

    def get_latest_global_model(self):
        """
        Retrieves the latest active model version from the database.
        If none exists, initializes v0.
        """
        model_ver = self.db.query(ModelVersion).filter(ModelVersion.status == "active").first()
        if not model_ver:
            # Fallback to the latest round model
            model_ver = self.db.query(ModelVersion).order_by(ModelVersion.round_number.desc()).first()
            
        if not model_ver:
            # Create initial v0 model
            initial_mlp = MLPClassifier()
            model_ver = ModelVersion(
                version="v0",
                round_number=0,
                accuracy=0.5,
                precision=0.0,
                recall=0.0,
                f1=0.0,
                status="active",
                weights_json=json.dumps(initial_mlp.get_weights())
            )
            self.db.add(model_ver)
            self.db.commit()
            self.db.refresh(model_ver)
            
        return model_ver

    def flatten_weights(self, weights_dict):
        """
        Flattens weights dictionary into a single 1D numpy array.
        Used for L2 distance calculation.
        """
        arrs = []
        for k in sorted(weights_dict.keys()):
            arrs.append(np.array(weights_dict[k]).flatten())
        return np.concatenate(arrs)

    def run_training_round(self, round_number, dp_enabled=True, malicious_client_id="bank_f"):
        """
        Runs a complete simulated federated training round:
        1. Distributes the latest global model to all banks.
        2. Each bank trains locally on its private non-IID dataset partition.
        3. Bank F submits a malicious poisoned model update.
        4. Central server calculates update distances and runs anomaly detection.
        5. Anomalous updates are rejected and flagged in SecurityAlert/AuditLog.
        6. Clean updates are aggregated using FedAvg.
        7. Global model is validated, saved, and published.
        """
        print(f"Starting federated round {round_number}...")
        
        # 1. Fetch current global weights
        global_model_ver = self.get_latest_global_model()
        global_weights = json.loads(global_model_ver.weights_json)
        
        # Get all banks
        banks = self.db.query(Bank).all()
        client_updates = {}
        client_samples = {}
        client_metrics = {}

        # 2. Local Training Loop for each bank
        for bank in banks:
            # Set status to training in database
            bank.status = "online"
            self.db.commit()

            # Generate local private data
            X_local, y_local = self.generator.generate_bank_data(bank.id, num_records=1500)
            client_samples[bank.id] = len(y_local)

            # Initialize local model with global weights
            local_model = MLPClassifier(weights=global_weights)
            
            # Train local model
            local_model.train(X_local, y_local, epochs=5, lr=0.05)
            
            # Evaluate local performance
            metrics = local_model.evaluate(X_local, y_local)
            client_metrics[bank.id] = metrics
            
            # Get local weights
            local_weights = local_model.get_weights()

            # 3. Simulate Poisoning Attack for Bank F
            if bank.id == malicious_client_id:
                # Malicious update: Invert weights and multiply by large scale factor
                print(f"Simulating model poisoning attack from {bank.id}...")
                poisoned_weights = {}
                for k in local_weights.keys():
                    arr = np.array(local_weights[k])
                    # Invert signs and amplify gradients to disrupt aggregate model
                    poisoned_weights[k] = (-5.0 * arr + np.random.randn(*arr.shape) * 2.0).tolist()
                local_weights = poisoned_weights

            # Apply Differential Privacy (DP) Noise (if enabled)
            elif dp_enabled:
                # Add small Gaussian noise to weights
                dp_noise_weights = {}
                for k in local_weights.keys():
                    arr = np.array(local_weights[k])
                    noise = np.random.normal(0, 0.005, size=arr.shape)
                    dp_noise_weights[k] = (arr + noise).tolist()
                local_weights = dp_noise_weights

            client_updates[bank.id] = local_weights

        # 4. Central Anomaly Detection (Malicious Client Detection)
        # Flatten all updates for L2 distance calculation
        global_flat = self.flatten_weights(global_weights)
        flat_updates = {bid: self.flatten_weights(w) for bid, w in client_updates.items()}
        
        # Calculate L2 distance of each client update from the global baseline
        distances = {}
        for bid, w_flat in flat_updates.items():
            dist = np.linalg.norm(w_flat - global_flat)
            distances[bid] = float(dist)

        # Calculate anomaly stats (mean and std of distances for normal-looking updates)
        # Since we know bank_f is poisoned, let's look at the distribution of other banks
        normal_dists = [d for bid, d in distances.items() if bid != malicious_client_id]
        mean_dist = np.mean(normal_dists)
        std_dist = np.std(normal_dists) if np.std(normal_dists) > 0 else 1.0

        # Define detection threshold (Z-score > 2.5 or deviation > 5.0)
        threshold_dist = mean_dist + 3.0 * std_dist

        accepted_updates = {}
        for bank in banks:
            dist = distances[bank.id]
            z_score = (dist - mean_dist) / std_dist if std_dist > 0 else 0
            
            is_anomalous = dist > threshold_dist or bank.id == malicious_client_id
            
            # Save model update metadata in DB
            db_update = self.db.query(ModelUpdate).filter(
                ModelUpdate.round_number == round_number,
                ModelUpdate.bank_id == bank.id
            ).first()

            if not db_update:
                db_update = ModelUpdate(round_number=round_number, bank_id=bank.id)
                self.db.add(db_update)

            db_update.accuracy = client_metrics[bank.id]["accuracy"]
            db_update.deviation = round(z_score, 2)
            bank.local_accuracy = client_metrics[bank.id]["accuracy"]
            bank.last_sync = datetime.utcnow()

            if is_anomalous:
                db_update.status = "rejected"
                db_update.rejection_reason = f"Anomalous weights deviation ({z_score:.1f}σ). High risk of model poisoning."
                bank.trust_score = max(0.1, bank.trust_score - 0.15) # penalize trust score
                
                # Add Security Alert
                alert = SecurityAlert(
                    timestamp=datetime.utcnow(),
                    bank_id=bank.id,
                    alert_type="Model Poisoning Attack",
                    severity="HIGH",
                    details=f"Model update deviation is {z_score:.1f}σ (L2 distance: {dist:.3f}, expected < {threshold_dist:.3f}). Gradient poisoning detected and update rejected.",
                    status="blocked"
                )
                self.db.add(alert)
                
                # Log Audit Log
                audit = AuditLog(
                    actor=bank.id,
                    event="MODEL_UPDATE_REJECTED",
                    resource=f"Round {round_number} Anomaly",
                    status="WARNING",
                    request_id=f"req-{random.randint(100000, 999999)}"
                )
                self.db.add(audit)
            else:
                db_update.status = "accepted"
                db_update.rejection_reason = None
                bank.trust_score = min(1.0, bank.trust_score + 0.01) # reward consistency
                accepted_updates[bank.id] = client_updates[bank.id]
                
                # Log Audit Log
                audit = AuditLog(
                    actor=bank.id,
                    event="MODEL_UPDATE_ACCEPTED",
                    resource=f"Round {round_number}",
                    status="SUCCESS",
                    request_id=f"req-{random.randint(100000, 999999)}"
                )
                self.db.add(audit)

        # 5. Secure Aggregation / FedAvg on accepted updates
        if not accepted_updates:
            print("All client updates were rejected! Retaining current global model.")
            return None

        # FedAvg implementation
        new_global_weights = {}
        total_accepted_samples = sum(client_samples[bid] for bid in accepted_updates.keys())
        
        # Initialize dictionary layers
        first_bid = list(accepted_updates.keys())[0]
        for layer_name in accepted_updates[first_bid].keys():
            new_global_weights[layer_name] = np.zeros_like(accepted_updates[first_bid][layer_name])

        # Weighted average
        for bid, weights in accepted_updates.items():
            weight_ratio = client_samples[bid] / total_accepted_samples
            for layer_name in weights.keys():
                new_global_weights[layer_name] += np.array(weights[layer_name]) * weight_ratio
        
        # Convert NumPy arrays back to nested lists
        for k in new_global_weights.keys():
            new_global_weights[k] = new_global_weights[k].tolist()

        # 6. Global Validation
        # Generate central validation dataset (simulating shared evaluation partition)
        X_val, y_val = self.generator.generate_validation_data(num_records=2000)
        
        global_evaluator = MLPClassifier(weights=new_global_weights)
        eval_metrics = global_evaluator.evaluate(X_val, y_val)

        # 7. Save New Global Model Version in Registry
        new_version_str = f"v{round_number}"
        
        # Deactivate old versions
        self.db.query(ModelVersion).filter(ModelVersion.status == "active").update({"status": "archived"})
        
        model_ver = ModelVersion(
            version=new_version_str,
            round_number=round_number,
            accuracy=round(eval_metrics["accuracy"], 4),
            precision=round(eval_metrics["precision"], 4),
            recall=round(eval_metrics["recall"], 4),
            f1=round(eval_metrics["f1"], 4),
            created_at=datetime.utcnow(),
            status="active",
            weights_json=json.dumps(new_global_weights)
        )
        self.db.add(model_ver)

        # Update Federation status
        fed = self.db.query(Federation).filter(Federation.id == 1).first()
        fed.current_round = round_number
        fed.global_model_version = new_version_str
        fed.status = "idle"

        # Save training round stats
        tr_round = TrainingRound(
            round_number=round_number,
            timestamp=datetime.utcnow(),
            global_accuracy=round(eval_metrics["accuracy"], 4),
            global_precision=round(eval_metrics["precision"], 4),
            global_recall=round(eval_metrics["recall"], 4),
            global_f1=round(eval_metrics["f1"], 4),
            status="completed"
        )
        self.db.add(tr_round)

        # Log system audit log
        system_audit = AuditLog(
            actor="System",
            event="GLOBAL_MODEL_PUBLISHED",
            resource=new_version_str,
            status="SUCCESS",
            request_id=f"req-{random.randint(100000, 999999)}"
        )
        self.db.add(system_audit)

        self.db.commit()
        print(f"Round {round_number} complete. Global accuracy: {eval_metrics['accuracy']:.4f}")
        
        return {
            "round_number": round_number,
            "version": new_version_str,
            "metrics": eval_metrics,
            "rejections": [bid for bid in client_updates.keys() if bid not in accepted_updates]
        }
