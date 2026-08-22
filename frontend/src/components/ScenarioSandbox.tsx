import React from 'react';
import { Play, RefreshCw, ShieldAlert, Cpu, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

interface ScenarioSandboxProps {
  onTriggerScenario: (scenario: string) => void;
  onResetSimulation: () => void;
}

export const ScenarioSandbox: React.FC<ScenarioSandboxProps> = ({ onTriggerScenario, onResetSimulation }) => {
  const scenarios = [
    {
      id: 'supplier_delay_autonomous',
      title: '1. Standard Supplier Delay (Autonomous)',
      description: 'TechComponents Global (SUP-001) delays PO-7001 by 7 days ($3,500 incremental cost). Agent evaluates, plans, and executes recovery autonomously.',
      badge: 'Autonomous Flow',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'supplier_delay_high_cost',
      title: '2. Major Breakdown & High-Cost Spend (> $50k)',
      description: 'Vanguard Assemblies (SUP-005) shutdown delays Power Boards for Tier-1 order PRD-9003 ($68,000 spend). Agent escalates for human manager approval.',
      badge: 'Human-in-the-Loop',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      id: 'quality_defect_moq',
      title: '3. Quality Inspection Failure & MOQ Constraint',
      description: 'Batch of optical sensors rejected during inspection. Alternate vendor requires Minimum Order Quantity (MOQ = 200). Enforces hard business rules.',
      badge: 'Constraint Enforcement',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    },
    {
      id: 'contradictory_info',
      title: '4. Contradictory Supplier Communication Anomaly',
      description: 'Supplier claims order is on schedule, but carrier tracking shows Customs Hold. Agent detects contradiction during post-execution verification.',
      badge: 'Verification & Replanning',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-indigo-400" />
              <span>Simulation Sandbox & Edge-Case Generator</span>
            </h3>
            <p className="text-xs text-slate-400">Trigger repeatable disruption scenarios to evaluate agent robustness and constraint compliance</p>
          </div>

          <button
            onClick={onResetSimulation}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 shadow"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Simulation Environment</span>
          </button>
        </div>

        {/* Scenarios Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {scenarios.map((sc) => (
            <div
              key={sc.id}
              className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 transition-all space-y-3 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded border ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-2">{sc.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{sc.description}</p>
              </div>

              <button
                onClick={() => onTriggerScenario(sc.id)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white font-bold text-xs border border-indigo-500/40 transition shadow"
              >
                <Play className="w-4 h-4" />
                <span>Inject Disruption Event</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
