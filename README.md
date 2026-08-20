# Intella: Privacy-Preserving Federated Fraud Intelligence Platform

Intella is an enterprise-grade federated machine learning platform designed for multiple banks to collaboratively train fraud detection models without sharing their customer transaction databases.

---

## Core Product Concept

> **"Banks learn from each other's fraud patterns without sharing raw customer transactions."**

The platform simulates multiple independent banks, each possessing its own private non-IID transaction dataset. Each bank trains a local neural network on its data. Only computed weight updates (gradients) are uploaded to the central server. The server securely aggregates the updates into a global model using the **FedAvg** algorithm and redistributes the improved model back to the banks.

### Key Capabilities:
1. **Privacy-Preserving Collaborative Learning**: Differential privacy (DP) noise prevents model inversion attacks, and raw customer data never leaves local bank databases.
2. **Malicious Client Detection**: High-dimension L2 weight deviation thresholds filter and quarantine poisoned updates (e.g. Bank F's malicious updates).
3. **Data/Model Drift Detection**: Measures Population Stability Index (PSI) to trigger federated retraining when fraud distributions drift.

---

## System Architecture

```text
                  +----------------------------------+
                  |        FEDERATION SERVER         |
                  |                                  |
                  |     +----------------------+     |
                  |     |     API Gateway      |     |
                  |     +-----------+----------+     |
                  |                 |                |
                  |     +-----------v----------+     |
                  |     |  Secure Aggregator   |     |
                  |     |   (FedAvg Engine)    |     |
                  |     +-----------+----------+     |
                  |                 |                |
                  |     +-----------v----------+     |
                  |     |  Quarantine Filters  |     |
                  |     |  (Anomaly Detection) |     |
                  |     +-----------+----------+     |
                  +-----------------|----------------+
                                    |
            +-----------------------+-----------------------+
            | (Encrypted Gradients) | (Encrypted Gradients) | (Quarantined Gradients)
            |                       |                       |
     +------v------+         +------v------+         +------v------+
     |   BANK A    |         |   BANK B    |         |   BANK F    |
     | (Retail)    |         | (UPI/Mobile)|         | (Malicious) |
     +------+------+         +------+------+         +------+------+
            |                       |                       |
     +------v------+         +------v------+         +------v------+
     | Private DB  |         | Private DB  |         | Private DB  |
     | (Local Only)|         | (Local Only)|         | (Local Only)|
     +-------------+         +-------------+         +-------------+
```

---

## Directory Structure

```text
/backend/
  ├── main.py            # FastAPI gateway routes, explainability engine & SSE simulator
  ├── database.py        # SQLAlchemy SQLite models & historical database seeder
  ├── schemas.py         # Pydantic input/output validation shapes
  ├── test_ml.py         # Automated unit tests for ML, drift, and FedAvg
  ├── ml/
  │   ├── dataset.py     # Non-IID transaction generator for Bank A to F
  │   ├── model.py       # NumPy-based MLP Neural Network classifier with SGD
  │   ├── federated.py   # Client local training & central anomaly check coordinator
  │   └── drift.py       # Statistical drift (PSI) calculation utility
/frontend/
  ├── src/
  │   ├── components/    # Shared card components & design variables
  │   ├── App.tsx        # React client application state and subpage router
  │   ├── index.css      # Styling with glassmorphism classes & SVG flow animations
  │   └── main.tsx       # Mount client DOM script
  ├── tailwind.config.js # Dark theme & Outfit font configuration
  ├── postcss.config.js
  ├── vite.config.ts     # Dev proxy configuration
  └── package.json
docker-compose.yml       # Single container coordinate service
Dockerfile               # Multi-stage image builder (React build + FastAPI uvicorn)
```

---

## Prerequisites & Installation

### Option 1: Run with Docker (Recommended)
Compile and launch the entire package (frontend React static bundle + Python backend) in a single step:

```bash
# 1. Build and start container
docker compose up --build

# 2. Access dashboard
Open http://localhost:8000 in your browser.
```

### Option 2: Build & Run Locally

#### 1. Setup Backend
Ensure you have Python 3.10+ installed:
```bash
# Navigate to workspace
cd backend

# Install dependencies
pip install -r requirements.txt

# Run server (runs on port 8000)
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

#### 2. Build Frontend
Ensure you have Node.js 18+ and npm installed:
```bash
# Navigate to frontend folder
cd frontend

# Install Node packages
npm install

# Build static assets (generates files in /dist)
npm run build
```
Once the build is complete, the FastAPI server will automatically mount and serve the static files at `http://localhost:8000/`.

---

## Live Demo Narrative

The dashboard includes a **"Run Full Demo"** execution script inside the sidebar. Triggering it displays the end-to-end story:

1. **Secure Handshake**: Bank nodes establish encrypted pipelines to the central federation server.
2. **Model Distribution**: Server pushes current global model weights to client folders.
3. **Local SGD Training**: Banks train independent neural networks locally on private databases.
4. **Quarantine Filter Alert**: Node F (Fidelity Offshore Trust) uploads corrupted weight gradients. The security engine flags a **gradient deviation of 8.7σ**.
5. **Node Exclusion**: Quarantined gradients are discarded from the aggregation buffer.
6. **Aggregated FedAvg**: Remaining 5 clean updates are merged to create global model `v25`.
7. **Inference Explanations**: Demonstrates risk classification of transaction templates.
8. **Drift Warning**: System detects feature shift (PSI = 0.31) and prompts for retraining.
