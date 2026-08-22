# Vyapar Saathi: Autonomous & Human-in-the-Loop AI Supply-Chain Agentic Controller

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python)](https://python.org)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Vyapar Saathi** is an enterprise-grade Autonomous & Human-in-the-Loop AI Agent Controller designed to mitigate real-time supply chain disruptions, optimize procurement decisions, and autonomously orchestrate ERP workflows while strictly adhering to business governance thresholds.

---

## 🌟 Key Capabilities

1. **⚡ Autonomous Disruption Triage & Investigation**
   - Ingests real-time events (supplier delays, inventory shortages, quality defects, demand spikes, and contradictory freight telemetry).
   - Dynamically analyzes BOM (Bill of Materials), warehouse stock levels, PO pipeline, and production deadlines.

2. **📊 Multi-Objective Optimization & Pareto Ranking**
   - Formulates and compares competing mitigation options against multi-dimensional scoring objectives:
     - **Production Continuity** (weight: 35%)
     - **Delivery Lead Time** (weight: 25%)
     - **Total Cost Impact** (weight: 20%)
     - **Supplier Quality & Reliability** (weight: 20%)

3. **🛡️ Constraint Verification & Business Guardrails**
   - Validates candidate options against hard operational constraints:
     - Budget authority limits (e.g. max spend threshold).
     - Minimum Order Quantity (MOQ) compatibility.
     - Required quality and compliance certifications (e.g. ISO9001, AS9100, CE).
     - Delivery deadline feasibility.
     - Supplier weekly manufacturing capacity.

4. **👤 Human-in-the-Loop (HITL) Governance**
   - Low-risk/standard threshold decisions are autonomously authorized and executed directly in the ERP.
   - High-cost, constraint-violating, or high-risk exceptions trigger human approval requests with full decision comparator cards and rationale.
   - If a human manager rejects an option, the agent automatically triggers replanning and fallback evaluation.

5. **📜 Immutable Audit Trail & Decision Explainability**
   - Generates structured, timestamped audit logs for every state transition, tool execution, reasoning step, constraint validation check, and human interaction.

6. **🧪 Simulation Sandbox & Scenario Builder**
   - Allows supply chain operators to trigger synthetic disruption scenarios on demand and observe agent orchestrations step-by-step or end-to-end.

---

## 🏗️ System Architecture

```text
               +--------------------------------------------------+
               |                  DISRUPTIONS                     |
               | (Supplier Delays, Shortages, Quality, Telemetry) |
               +------------------------+-------------------------+
                                        |
                                        v
               +--------------------------------------------------+
               |             AGENT ORCHESTRATOR                   |
               |                                                  |
               |  [TRIAGE] -> [INVESTIGATE] -> [PLAN]             |
               |       ^                           |              |
               |       | (Replan on Reject)        v              |
               |  [VALIDATE] <--- [EVALUATE OPTIONS]              |
               |       |                                          |
               |       v                                          |
               |  [DECISION GATEWAY]                              |
               +-----------+--------------------------+-----------+
                           |                          |
                (Low Risk / Autonomous)       (High Risk / Exceeds Limit)
                           |                          |
                           v                          v
               +----------------------+   +-----------------------+
               |  Autonomous ERP Exec |   | Human Approval Portal |
               |  (PO / Inventory Up) |   | (Approve / Reject)    |
               +-----------+----------+   +-----------+-----------+
                           |                          |
                           +------------+-------------+
                                        |
                                        v
               +--------------------------------------------------+
               |           VERIFICATION & AUDIT LOGGER            |
               |   (Execution Verified -> COMPLETE -> Audit Log)  |
               +--------------------------------------------------+
```

---

## 📁 Repository Structure

```text
├── backend/
│   ├── main.py                     # FastAPI gateway, CORS middleware & SPA static mount
│   ├── requirements.txt            # Python dependencies (FastAPI, SQLAlchemy, Pydantic, etc.)
│   ├── agent/
│   │   ├── orchestrator.py         # 8-stage state machine orchestrator
│   │   ├── reasoning.py            # Natural language decision explainer
│   │   └── state_memory.py         # Persistent agent state store & step history
│   ├── api/
│   │   └── routes.py               # REST API endpoints (/api/events, /api/decisions, /api/agent, etc.)
│   ├── audit/
│   │   └── logger.py               # Structured audit event logging system
│   ├── constraints/
│   │   └── validator.py            # Business constraint verification rules
│   ├── database/
│   │   ├── connection.py           # SQLAlchemy database session & SQLite engine
│   │   └── models.py               # ORM schemas (Disruptions, Suppliers, POs, Approvals, Audits)
│   ├── optimization/
│   │   └── decision_engine.py      # Multi-objective Pareto scoring & candidate generator
│   ├── schemas/
│   │   └── pydantic_models.py      # Pydantic request/response validation schemas
│   ├── services/
│   │   └── erp_service.py          # Simulated ERP integration (PO creation, inventory allocation)
│   ├── simulation/
│   │   ├── engine.py               # Scenario simulation dispatcher
│   │   └── seed_data.py            # Enterprise demo database seeder
│   └── tools/
│       └── supply_chain_tools.py   # Agent supply chain inspection and ERP action tools
│
├── frontend/
│   ├── src/
│   │   ├── components/             # UI views & operational cards
│   │   │   ├── Navbar.tsx          # System header with active status
│   │   │   ├── OverviewDashboard.tsx # Real-time KPIs, supply chain stats & recent disruptions
│   │   │   ├── DisruptionCenter.tsx  # Interactive triage and live agent execution panel
│   │   │   ├── AgentVisualizer.tsx   # Visual state machine progress tracker
│   │   │   ├── DecisionComparator.tsx # Trade-off matrix & rejected alternative explainers
│   │   │   ├── ApprovalModal.tsx     # Human approval governance interface
│   │   │   ├── SupplyChainExplorer.tsx # Interactive inventory, supplier & PO tables
│   │   │   ├── AuditLogView.tsx      # Filterable enterprise audit trail
│   │   │   └── ScenarioSandbox.tsx   # One-click disruption scenario injector
│   │   ├── api.ts                  # Axios/Fetch API client
│   │   ├── types/                  # TypeScript domain models
│   │   ├── App.tsx                 # Main application state & tab router
│   │   ├── main.tsx                # React DOM entrypoint
│   │   └── index.css               # Tailwind CSS & design tokens
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── tests/                          # Automated Pytest suite
│   ├── test_agent_scenarios.py     # End-to-end autonomous, HITL & replanning test cases
│   ├── test_api.py                 # REST API integration tests
│   ├── test_constraints.py         # Constraint validation unit tests
│   ├── test_optimization.py        # Multi-objective scoring tests
│   └── test_tools.py               # Tool execution & ERP update tests
│
├── cli.py                          # Interactive CLI test suite and orchestrator runner
├── Dockerfile                      # Multistage production Docker container build
├── docker-compose.yml              # Single container deployment coordinator
└── README.md
```

---

## 🚀 Quickstart Guide

### Option 1: Running Locally (Recommended)

#### 1. Backend Server Setup
Ensure Python 3.10+ is installed:
```powershell
# 1. Install backend dependencies
pip install -r backend/requirements.txt

# 2. Start the FastAPI server (runs on port 8000)
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
- API Docs & Swagger UI: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/health`

#### 2. Frontend React Setup
Ensure Node.js 18+ and npm are installed:
```powershell
# Navigate to frontend
cd frontend

# Install npm packages
npm install

# Start Vite dev server (runs on port 5173 with proxy to 8000)
npm run dev
```
Open **`http://localhost:5173`** in your browser.

#### 3. Unified Production Mode
To have FastAPI serve both the compiled frontend and the API unified:
```powershell
cd frontend
npm run build
cd ..
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Open **`http://localhost:8000`** in your browser.

---

### Option 2: Run with Docker Compose

```powershell
# Build and run container
docker compose up --build

# Access dashboard
http://localhost:8000
```

---

## 💻 CLI Commands & Automated Scenarios

Vyapar Saathi includes a comprehensive CLI runner ([`cli.py`](file:///c:/Users/Dell/OneDrive/Desktop/intella/Intella/Intella/cli.py)) for automated testing:

```powershell
# Reset simulation database
python cli.py reset

# Trigger autonomous recovery scenario (low cost, valid lead time)
python cli.py trigger-disruption --scenario supplier_delay_autonomous

# Run agent orchestrator on disruption ID 1
python cli.py run-agent --disruption-id 1

# Check current agent state & memory context
python cli.py status --disruption-id 1

# Trigger scenario requiring human approval (high cost)
python cli.py trigger-disruption --scenario supplier_delay_high_cost

# Approve a pending human decision
python cli.py approve --approval-id 1 --comments "Authorized expedited procurement"

# Reject a pending decision (triggers automatic agent replanning)
python cli.py reject --approval-id 1 --comments "Cost too high, find alternate supplier"

# View structured audit logs
python cli.py audit-log
```

---

## 🧪 Testing

Execute the automated test suite covering all 16 agent scenarios, multi-objective optimizations, and API routes:

```powershell
python -m pytest tests/
```

---

## 📄 License
This project is licensed under the MIT License.
