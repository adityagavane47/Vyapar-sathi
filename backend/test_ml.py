import unittest
import json
import numpy as np
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.database import Base, Bank, Federation, ModelVersion, ModelUpdate, TrainingRound, SecurityAlert
from backend.ml.model import MLPClassifier
from backend.ml.federated import FederatedOrchestrator
from backend.ml.drift import calculate_psi

class TestFederatedLearningEngine(unittest.TestCase):
    def setUp(self):
        # 1. Setup in-memory SQLite database
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(bind=self.engine)
        self.Session = sessionmaker(bind=self.engine)
        self.db = self.Session()

        # Seed initial metadata
        self.fed = Federation(id=1, name="Test Federation", status="idle", current_round=0, global_model_version="v0")
        self.db.add(self.fed)

        # Seed 6 banks
        banks_data = [
            {"id": "bank_a", "name": "Bank A"},
            {"id": "bank_b", "name": "Bank B"},
            {"id": "bank_c", "name": "Bank C"},
            {"id": "bank_d", "name": "Bank D"},
            {"id": "bank_e", "name": "Bank E"},
            {"id": "bank_f", "name": "Bank F"}, # Malicious
        ]
        for b in banks_data:
            bank = Bank(
                id=b["id"],
                name=b["name"],
                status="online",
                trust_score=1.0,
                local_accuracy=0.8,
                total_transactions=1000,
                fraud_cases=50,
                avg_tx_value=100.0
            )
            self.db.add(bank)
        self.db.commit()

        self.orchestrator = FederatedOrchestrator(self.db)

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(bind=self.engine)

    def test_model_initialization(self):
        # Verify latest global model can be generated/retrieved
        model = self.orchestrator.get_latest_global_model()
        self.assertEqual(model.version, "v0")
        self.assertEqual(model.round_number, 0)
        
        # Verify structure of loaded weights
        weights = json.loads(model.weights_json)
        self.assertIn("W1", weights)
        self.assertIn("b1", weights)
        self.assertIn("W2", weights)
        self.assertIn("b2", weights)
        self.assertEqual(len(weights["W1"]), 8) # 8 input features
        self.assertEqual(len(weights["W1"][0]), 16) # 16 hidden nodes

    def test_local_model_training(self):
        # Create some random binary classification data
        X = np.random.rand(100, 8)
        y = np.random.randint(0, 2, size=(100,))
        
        model = MLPClassifier()
        initial_metrics = model.evaluate(X, y)
        
        # Train local model
        model.train(X, y, epochs=10, lr=0.1)
        post_metrics = model.evaluate(X, y)
        
        # Training should generally improve or change performance metrics
        # We verify that predictions are valid output probabilities [0, 1]
        probs = model.predict_proba(X)
        self.assertTrue(np.all(probs >= 0.0) and np.all(probs <= 1.0))

    def test_malicious_client_detection(self):
        # Run a simulated federated round
        # Under round 1, Bank F is simulated as malicious client inside the orchestrator code
        result = self.orchestrator.run_training_round(round_number=1, dp_enabled=True)
        
        self.assertIsNotNone(result)
        self.assertEqual(result["round_number"], 1)
        self.assertEqual(result["version"], "v1")
        
        # Check that bank_f was successfully rejected
        self.assertIn("bank_f", result["rejections"])
        self.assertNotIn("bank_a", result["rejections"])

        # Check database records
        # Verify ModelUpdate status
        update_f = self.db.query(ModelUpdate).filter(
            ModelUpdate.round_number == 1,
            ModelUpdate.bank_id == "bank_f"
        ).first()
        self.assertEqual(update_f.status, "rejected")
        self.assertTrue("poisoning" in update_f.rejection_reason.lower())

        # Verify SecurityAlert is logged for Bank F
        alert = self.db.query(SecurityAlert).filter(SecurityAlert.bank_id == "bank_f").first()
        self.assertIsNotNone(alert)
        self.assertEqual(alert.alert_type, "Model Poisoning Attack")
        self.assertEqual(alert.severity, "HIGH")

    def test_drift_calculation_psi(self):
        # Verify PSI calculation returns 0 on identical inputs
        expected = np.random.normal(0.5, 0.1, size=(500,))
        actual = np.copy(expected)
        
        psi_score = calculate_psi(expected, actual, num_bins=10)
        self.assertAlmostEqual(psi_score, 0.0, places=3)
        
        # Shifted inputs should result in higher PSI score (> 0.2)
        drifted_actual = expected + 0.35
        psi_drifted = calculate_psi(expected, drifted_actual, num_bins=10)
        self.assertGreater(psi_drifted, 0.20)

if __name__ == "__main__":
    unittest.main()
