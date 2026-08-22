import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.database import init_db, SessionLocal
from backend.simulation.seed_data import seed_database
from backend.database.models import Supplier
from backend.api import router as api_router

# Initialize database schema
init_db()

# Auto-seed database if empty
db = SessionLocal()
try:
    if db.query(Supplier).count() == 0:
        seed_database(db)
finally:
    db.close()

app = FastAPI(
    title="Vyapar Saathi API",
    description="Autonomous & Human-in-the-Loop AI Supply-Chain Agentic Controller System API",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include REST API router under /api
app.include_router(api_router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "ok", "system": "Vyapar Saathi Autonomous AI Agent"}

# Serve frontend build static files if present
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")
