import React from 'react';
import { Play, RefreshCw, ShieldAlert, AlertTriangle, PlusCircle, Sparkles, Sliders } from 'lucide-react';

interface ScenarioSandboxProps {
  onTriggerScenario: (scenario: string) => void;
  onResetSimulation: () => void;
  onOpenCustomModal?: () => void;
}

export const ScenarioSandbox: React.FC<ScenarioSandboxProps> = ({
  onTriggerScenario,
  onResetSimulation,
  onOpenCustomModal,
}) => {
  const scenarios = [
    {
      id: 'supplier_delay_autonomous',
      title: '1. Standard Supplier Delay (Autonomous)',
      description: 'TechComponents Global (SUP-001) delays PO-7001 by 7 days (₹3,500 incremental cost). Agent evaluates, plans, and executes recovery autonomously.',
      badge: 'Autonomous Flow',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'supplier_delay_high_cost',
      title: '2. Major Breakdown & High-Cost Spend (> ₹50k)',
      description: 'Vanguard Assemblies (SUP-005) shutdown delays Power Boards for Tier-1 order PRD-9003 (₹68,000 spend). Agent escalates for human manager approval.',
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
      {/* Sandbox Controller Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-indigo-400" />
              <span>Simulation Sandbox & Edge-Case Generator</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Trigger repeatable test scenarios or inject custom parameterized disruptions into the digital twin.
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            {onOpenCustomModal && (
              <button
                onClick={onOpenCustomModal}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Custom Scenario</span>
              </button>
            )}

            <button
              onClick={onResetSimulation}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 shadow transition"
              title="Reset Database & Simulation Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          </div>
        </div>

        {/* Preset Scenarios Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {scenarios.map((sc) => (
            <div
              key={sc.id}
              className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 transition-all space-y-3.5 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-2">{sc.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{sc.description}</p>
              </div>

              <button
                onClick={() => onTriggerScenario(sc.id)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold text-xs border border-indigo-500/40 transition shadow-sm"
              >
                <Play className="w-4 h-4" />
                <span>Inject Scenario Into Pipeline</span>
              </button>
            </div>
          ))}

          {/* Custom Disruption Card */}
          {onOpenCustomModal && (
            <div className="md:col-span-2 p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-950 to-slate-950 border border-indigo-500/30 space-y-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                  <Sliders className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Custom Disruption Parameter Builder</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Customize component, delay duration, defective volume, supplier failure, or high cost escalation (INR).
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenCustomModal}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-2 shrink-0 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Open Custom Builder</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
