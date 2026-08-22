import React from 'react';
import {
  Play,
  RefreshCw,
  ShieldAlert,
  AlertTriangle,
  PlusCircle,
  Sparkles,
  Sliders,
  Flame,
  CheckCircle2,
  Cpu,
  ShieldCheck
} from 'lucide-react';

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
      title: '1. Standard Supplier Delay (Autonomous Recovery)',
      description: 'Primary supplier TechComponents Global (SUP-001) notifies a 7-day delay on PO-7001 (500 units of MCU-32). Spend is within autonomous limits (₹3,500). Agent discovers Apex Micro Systems, validates MOQ & ISO9001, and issues replacement PO automatically.',
      badge: 'Autonomous Flow',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      expectedBehavior: 'Auto-executes without requiring manager intervention.',
    },
    {
      id: 'supplier_delay_high_cost',
      title: '2. Major Equipment Breakdown & High-Cost Spend (> ₹50,000)',
      description: 'Vanguard Assemblies (SUP-005) suffers catastrophic machinery failure delaying Heavy-Duty Power Boards PB-800 for Tier-1 order PRD-9003. Expedited recovery requires emergency spend of ₹68,000. Agent detects threshold breach and escalates for human approval.',
      badge: 'Human-in-the-Loop Gate',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      expectedBehavior: 'Pauses at WAITING_FOR_APPROVAL until manager authorizes spend in INR.',
    },
    {
      id: 'quality_defect_moq',
      title: '3. Quality Inspection Failure & MOQ Constraint Enforcement',
      description: 'Incoming batch of Precision Optical Sensors (POS-5) fails QA inspection at Bengaluru Central Hub (25% defect rate). Alternate suppliers enforce hard Minimum Order Quantities (MOQ = 200). Agent validates business rules and adjusts procurement volumes.',
      badge: 'Constraint Enforcement',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      expectedBehavior: 'Evaluates MOQ, ISO certifications, and delivery speed trade-offs.',
    },
    {
      id: 'contradictory_info',
      title: '4. Contradictory Supplier Communication & Telemetry Anomaly',
      description: 'Supplier email claims shipment has dispatched on schedule, but carrier API tracking reports Customs Hold at Transit Port. Agent detects anomaly during post-execution verification and automatically replans secondary recovery route.',
      badge: 'Verification & Replanning',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      expectedBehavior: 'Detects data conflict, triggers REPLAN state, and resolves.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Sandbox Controller Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-8 shadow-2xl space-y-5 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-800/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-400">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Simulation Sandbox & Disruption Testbed</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inject deterministic edge-case disruption events to validate agentic behavior, constraint checking, and Pareto trade-offs.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start md:self-auto">
            {onOpenCustomModal && (
              <button
                onClick={onOpenCustomModal}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Custom Scenario</span>
              </button>
            )}

            <button
              onClick={onResetSimulation}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 shadow transition"
              title="Reset Database & Clear All Live Disruptions"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          </div>
        </div>

        {/* 2. Preset Scenarios Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {scenarios.map((sc) => (
            <div
              key={sc.id}
              className="p-7 rounded-3xl bg-slate-950/70 border border-slate-800/90 hover:border-indigo-500/50 transition-all space-y-4 shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full border ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                </div>
                <h4 className="text-base font-black text-white pt-1">{sc.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{sc.description}</p>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                  <span className="font-bold text-indigo-300">Expected Agent Behavior: </span>
                  <span>{sc.expectedBehavior}</span>
                </div>
              </div>

              <button
                onClick={() => onTriggerScenario(sc.id)}
                className="w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600/25 to-blue-600/15 hover:from-indigo-600 hover:to-blue-600 text-indigo-200 hover:text-white font-bold text-xs border border-indigo-500/40 transition shadow-md duration-150"
              >
                <Play className="w-4 h-4" />
                <span>Inject Scenario Into Pipeline</span>
              </button>
            </div>
          ))}

          {/* Custom Scenario Builder Card */}
          {onOpenCustomModal && (
            <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-slate-950 to-slate-950 border border-indigo-500/40 space-y-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl">
              <div className="flex items-start space-x-4">
                <div className="p-4 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0 shadow-lg shadow-indigo-500/10">
                  <Sliders className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base sm:text-lg font-black text-white">Custom Disruption Parameter Builder</h4>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    Test your custom supply chain edge-cases. Select target Purchase Orders, customize delay durations, defect rates, supplier shutdowns, or cost impacts (₹).
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenCustomModal}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 flex items-center space-x-2 shrink-0 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Launch Custom Builder</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
