# Vyapar Saathi: Autonomous & Human-in-the-Loop AI Supply-Chain Agentic Controller

Vyapar Saathi is an intelligent supply chain management system that combines autonomous AI agents with human-in-the-loop decision-making. It simulates supply chain disruptions, evaluates mitigation strategies, and automatically executes optimal solutions while pausing for human approval when high-risk decisions are required.

---

## Core Features

- **Autonomous Agent Orchestrator**: Automatically detects supply chain disruptions and runs a specialized multi-step pipeline (analyze, plan, execute) to resolve them.
- **Simulation Engine**: Triggers various supply-chain disruption scenarios, such as supplier delays or quality defects, to test system resilience.
- **Human-in-the-Loop (HITL)**: Intelligently requests human approval for critical actions. The system gracefully handles both approvals and rejections, triggering replanning if a proposal is rejected.
- **Audit Trails**: Detailed, structured logging of agent state changes, tool usage, calculations, and execution outcomes for complete transparency.

---

## System Architecture

The project consists of three main components:

1. **Backend (FastAPI & SQLite)**: Exposes a REST API for the frontend and houses the core AI agent logic, disruption simulation, database models, and optimization tools.
2. **Frontend (React, Vite, Tailwind CSS)**: A modern, responsive dashboard to monitor the supply chain status, view active disruptions, and manage human approval requests.
3. **CLI (`cli.py`)**: A comprehensive command-line interface to interact with the backend, trigger disruptions, and run agent simulations locally.

---

## Directory Structure

```text
Vyapar-sathi/
├── backend/
│   ├── main.py            # FastAPI application entry point
│   ├── database.py        # SQLAlchemy SQLite models & initialization
│   ├── schemas.py         # Pydantic schemas for API validation
│   ├── api/               # REST API endpoints (routes.py)
│   ├── agent/             # Core agent orchestrator logic
│   ├── simulation/        # Supply chain disruption scenarios
│   ├── ml/ & optimization/# Decision and calculation utilities
│   ├── requirements.txt   # Python dependencies
│   └── ...
├── frontend/
│   ├── src/               # React components and application logic
│   ├── index.html         # Main HTML file
│   ├── package.json       # Node.js dependencies
│   ├── vite.config.ts     # Vite bundler configuration
│   └── tailwind.config.js # Tailwind CSS styling setup
├── cli.py                 # Command-line interface suite
├── Dockerfile             # Container setup
└── docker-compose.yml     # Services orchestration
```

---

## Setup and Installation

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Backend Setup
1. Navigate to the project root:
   ```bash
   cd Vyapar-sathi
   ```
2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Run the FastAPI server (will auto-seed the database if empty):
   ```bash
   python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
   ```

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## Command Line Interface (CLI)

The included `cli.py` script provides robust tools to interact with and test the simulation without using the frontend.

**Usage:**
```bash
python cli.py <command> [options]
```

**Commands:**
- `reset`: Reset the simulation environment and seed data.
- `trigger-disruption`: Trigger a disruption scenario.
  - Options: `--scenario` (e.g., `supplier_delay_autonomous`, `quality_defect_moq`)
- `run-agent`: Run the agent orchestrator on a specific disruption.
  - Options: `--disruption-id <ID>`
- `status`: Get current agent status and memory.
  - Options: `--disruption-id <ID>`
- `approve`: Approve a human decision request.
  - Options: `--approval-id <ID>` `--comments <TEXT>`
- `reject`: Reject a human decision request (triggers replanning).
  - Options: `--approval-id <ID>` `--comments <TEXT>`
- `audit-log`: Display the structured audit trail of agent actions.
  - Options: `--disruption-id <ID>` (Optional filter)
