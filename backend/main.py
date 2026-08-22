import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

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

# Check for frontend build
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")
else:
    @app.get("/", response_class=HTMLResponse)
    def root_landing_page():
        return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Vyapar Saathi - Autonomous AI Supply-Chain Controller</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-slate-950 text-slate-100 font-sans antialiased min-h-screen flex flex-col justify-between">
            <header class="border-b border-slate-800 bg-slate-900/80 px-8 py-4 backdrop-blur-md">
                <div class="max-w-7xl mx-auto flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center font-black text-xl text-white px-3 py-1 shadow-lg">VS</div>
                        <div>
                            <h1 class="text-xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Vyapar Saathi</h1>
                            <p class="text-xs text-slate-400">Autonomous AI Supply-Chain Operational Controller</p>
                        </div>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">System Status: Active</span>
                </div>
            </header>

            <main class="max-w-5xl mx-auto px-6 py-12 space-y-8 w-full">
                <div class="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/40 rounded-2xl p-8 shadow-2xl text-center space-y-4">
                    <span class="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">11-Layer Event-Driven Agentic Architecture</span>
                    <h2 class="text-3xl font-extrabold text-white">Vyapar Saathi Engine Live</h2>
                    <p class="text-sm text-slate-300 max-w-2xl mx-auto">
                        Autonomous monitoring, multi-objective Pareto recovery optimization, Scikit-Learn predictive forecasting radar, $50,000 human approval threshold, and immutable audit logs.
                    </p>
                    <div class="flex items-center justify-center space-x-4 pt-4">
                        <a href="/docs" class="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg transition">Interactive Swagger API Docs (/docs)</a>
                        <a href="/health" class="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-extrabold text-xs transition">Health Check (/health)</a>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-2">
                        <h3 class="font-bold text-indigo-400 text-sm">Disruptions & Triage API</h3>
                        <p class="text-xs text-slate-400">Ingest, triage, and manage active supply-chain events.</p>
                        <a href="/api/disruptions" class="text-xs font-mono text-emerald-400 hover:underline block pt-2">GET /api/disruptions &rarr;</a>
                    </div>
                    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-2">
                        <h3 class="font-bold text-indigo-400 text-sm">Predictive ML Radar API</h3>
                        <p class="text-xs text-slate-400">Weather, port congestion, & ML risk predictions.</p>
                        <a href="/api/predictive/supplier-risk" class="text-xs font-mono text-emerald-400 hover:underline block pt-2">GET /api/predictive/supplier-risk &rarr;</a>
                    </div>
                    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-2">
                        <h3 class="font-bold text-indigo-400 text-sm">Immutable Audit Logs API</h3>
                        <p class="text-xs text-slate-400">Structured logs of state transitions & tool calls.</p>
                        <a href="/api/audit" class="text-xs font-mono text-emerald-400 hover:underline block pt-2">GET /api/audit &rarr;</a>
                    </div>
                </div>
            </main>

            <footer class="border-t border-slate-800 px-8 py-4 text-center text-xs text-slate-500">
                Vyapar Saathi Autonomous Supply-Chain Agent • Powered by FastAPI & Scikit-Learn
            </footer>
        </body>
        </html>
        """
