import numpy as np
import random

# Features details:
# 0: Amount (scaled)
# 1: Hour of Day (0-23, scaled)
# 2: Transaction Velocity (number of transactions in last 1hr, scaled)
# 3: Device Age in Days (scaled)
# 4: New Device (0 or 1)
# 5: New Beneficiary (0 or 1)
# 6: Location Anomaly (0 or 1)
# 7: Account Age in Days (scaled)

class FraudDatasetGenerator:
    def __init__(self, seed=42):
        np.random.seed(seed)
        random.seed(seed)

    def generate_bank_data(self, bank_id, num_records=2000):
        """
        Generates transaction data for a specific bank.
        Each bank has a distinct non-IID distribution representing its market profile.
        Returns X (features) and y (labels).
        """
        # Base distributions
        X = np.zeros((num_records, 8))
        y = np.zeros(num_records)

        # Skew parameters based on bank_id
        if bank_id == "bank_a":
            # Aegis Retail Bank: Standard retail, card-present focus. Card skimming, high velocity card fraud.
            fraud_rate = 0.05
            for i in range(num_records):
                is_fraud = random.random() < fraud_rate
                if is_fraud:
                    X[i, 0] = np.random.normal(120, 30) # Amount
                    X[i, 1] = random.randint(0, 23)     # Hour
                    X[i, 2] = np.random.normal(8, 2)    # Velocity (High)
                    X[i, 3] = np.random.normal(30, 20)  # Device age (Old)
                    X[i, 4] = 0                         # New Device
                    X[i, 5] = random.choice([0, 1])     # New Beneficiary
                    X[i, 6] = 0                         # Location Anomaly
                    X[i, 7] = np.random.normal(365, 100)# Account age
                    y[i] = 1
                else:
                    X[i, 0] = np.random.exponential(45)
                    X[i, 1] = np.random.choice([8,9,10,11,12,13,14,15,16,17,18,19,20])
                    X[i, 2] = np.random.normal(1.5, 0.5)
                    X[i, 3] = np.random.normal(200, 50)
                    X[i, 4] = 0
                    X[i, 5] = 0
                    X[i, 6] = 0
                    X[i, 7] = np.random.normal(500, 150)

        elif bank_id == "bank_b":
            # Boreal Digital Credit: Mobile-first. UPI/Instant transfer fraud, new devices, location anomalies.
            fraud_rate = 0.08
            for i in range(num_records):
                is_fraud = random.random() < fraud_rate
                if is_fraud:
                    X[i, 0] = np.random.normal(15, 5)   # Amount (Low)
                    X[i, 1] = random.randint(0, 5)      # Hour (Late night)
                    X[i, 2] = np.random.normal(5, 1.5)  # Velocity
                    X[i, 3] = np.random.normal(2, 1)    # Device age (Brand new)
                    X[i, 4] = 1                         # New Device
                    X[i, 5] = 1                         # New Beneficiary
                    X[i, 6] = 1                         # Location Anomaly
                    X[i, 7] = np.random.normal(45, 15)  # Account age (Newer accounts)
                    y[i] = 1
                else:
                    X[i, 0] = np.random.exponential(20)
                    X[i, 1] = random.randint(6, 23)
                    X[i, 2] = np.random.normal(1.2, 0.4)
                    X[i, 3] = np.random.normal(120, 40)
                    X[i, 4] = random.choice([0, 0, 0, 1])
                    X[i, 5] = random.choice([0, 0, 1])
                    X[i, 6] = 0
                    X[i, 7] = np.random.normal(250, 80)

        elif bank_id == "bank_c":
            # Crestwood Commercial: Business accounts. High value fraud, new beneficiaries, location anomaly.
            fraud_rate = 0.03
            for i in range(num_records):
                is_fraud = random.random() < fraud_rate
                if is_fraud:
                    X[i, 0] = np.random.normal(8500, 2000) # Large Amount
                    X[i, 1] = random.randint(9, 17)        # Business Hours
                    X[i, 2] = np.random.normal(2, 0.8)     # Velocity
                    X[i, 3] = np.random.normal(450, 100)   # Device age
                    X[i, 4] = 0
                    X[i, 5] = 1                            # New Beneficiary
                    X[i, 6] = 1                            # Location Anomaly
                    X[i, 7] = np.random.normal(1200, 300)  # Account age
                    y[i] = 1
                else:
                    X[i, 0] = np.random.normal(1200, 500)
                    X[i, 1] = random.randint(9, 17)
                    X[i, 2] = np.random.normal(1.0, 0.3)
                    X[i, 3] = np.random.normal(500, 120)
                    X[i, 4] = 0
                    X[i, 5] = random.choice([0, 0, 0, 1])
                    X[i, 6] = 0
                    X[i, 7] = np.random.normal(1500, 400)

        elif bank_id == "bank_d":
            # Delta Wealth Management: High net worth. Account Takeover, device swapping, location anomaly, high values.
            fraud_rate = 0.04
            for i in range(num_records):
                is_fraud = random.random() < fraud_rate
                if is_fraud:
                    X[i, 0] = np.random.normal(25000, 5000) # Extremely High
                    X[i, 1] = random.randint(0, 23)
                    X[i, 2] = np.random.normal(3, 1)
                    X[i, 3] = np.random.normal(1, 0.5)      # New device
                    X[i, 4] = 1                             # New device
                    X[i, 5] = 1                             # New beneficiary
                    X[i, 6] = 1                             # Location anomaly
                    X[i, 7] = np.random.normal(1800, 200)   # Old account (Takeover)
                    y[i] = 1
                else:
                    X[i, 0] = np.random.normal(4500, 1500)
                    X[i, 1] = random.randint(8, 20)
                    X[i, 2] = np.random.normal(0.8, 0.3)
                    X[i, 3] = np.random.normal(600, 100)
                    X[i, 4] = 0
                    X[i, 5] = 0
                    X[i, 6] = 0
                    X[i, 7] = np.random.normal(2000, 300)

        elif bank_id == "bank_f":
            # Fidelity Offshore Trust: Normal/high-value profile (acts as standard client but weights will be poisoned inside simulated training round).
            fraud_rate = 0.05
            for i in range(num_records):
                is_fraud = random.random() < fraud_rate
                if is_fraud:
                    X[i, 0] = np.random.normal(5000, 1000)
                    X[i, 1] = random.randint(0, 23)
                    X[i, 2] = np.random.normal(4, 1.2)
                    X[i, 3] = np.random.normal(15, 10)
                    X[i, 4] = 1
                    X[i, 5] = 1
                    X[i, 6] = 1
                    X[i, 7] = np.random.normal(600, 150)
                    y[i] = 1
                else:
                    X[i, 0] = np.random.exponential(800)
                    X[i, 1] = random.randint(8, 22)
                    X[i, 2] = np.random.normal(1.1, 0.4)
                    X[i, 3] = np.random.normal(300, 80)
                    X[i, 4] = 0
                    X[i, 5] = 0
                    X[i, 6] = 0
                    X[i, 7] = np.random.normal(800, 200)

        else:
            # Bank E / Default (Elysian Mobile Pay): High volume, micro-transactions. Small transactions.
            fraud_rate = 0.06
            for i in range(num_records):
                is_fraud = random.random() < fraud_rate
                if is_fraud:
                    X[i, 0] = np.random.normal(35, 10)
                    X[i, 1] = random.randint(0, 23)
                    X[i, 2] = np.random.normal(6, 2)
                    X[i, 3] = np.random.normal(5, 3)
                    X[i, 4] = 1
                    X[i, 5] = 0
                    X[i, 6] = 1
                    X[i, 7] = np.random.normal(80, 30)
                    y[i] = 1
                else:
                    X[i, 0] = np.random.exponential(12)
                    X[i, 1] = random.randint(7, 23)
                    X[i, 2] = np.random.normal(1.8, 0.6)
                    X[i, 3] = np.random.normal(80, 25)
                    X[i, 4] = random.choice([0, 0, 1])
                    X[i, 5] = 0
                    X[i, 6] = 0
                    X[i, 7] = np.random.normal(150, 50)

        # Scale features between 0 and 1 using min-max scaling parameters
        # Features min-max bounds (to keep simple scaling inside the generator)
        mins = np.array([0, 0, 0, 0, 0, 0, 0, 0])
        maxs = np.array([35000, 23, 20, 1000, 1, 1, 1, 3000])

        X_scaled = (X - mins) / (maxs - mins + 1e-8)
        X_scaled = np.clip(X_scaled, 0.0, 1.0)

        return X_scaled.tolist(), y.tolist()

    def generate_validation_data(self, num_records=3000):
        """
        Generates a balanced validation dataset by combining patterns from all bank types.
        """
        bank_types = ["bank_a", "bank_b", "bank_c", "bank_d", "bank_e"]
        records_per_bank = num_records // len(bank_types)
        
        X_all = []
        y_all = []
        
        for bt in bank_types:
            X_b, y_b = self.generate_bank_data(bt, records_per_bank)
            X_all.extend(X_b)
            y_all.extend(y_b)
            
        return np.array(X_all), np.array(y_all)
