import React from 'react';
import {
  Play,
  RefreshCw,
  PlusCircle,
  Sliders,
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
      badgeColor: 'bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]',
      expectedBehavior: 'Auto-executes without requiring manager intervention.',
    },
    {
      id: 'supplier_delay_high_cost',
      title: '2. Major Equipment Breakdown & High-Cost Spend (> ₹50,000)',
      description: 'Vanguard Assemblies (SUP-005) suffers catastrophic machinery failure delaying Heavy-Duty Power Boards PB-800 for Tier-1 order PRD-9003. Expedited recovery requires emergency spend of ₹68,000. Agent detects threshold breach and escalates for human approval.',
      badge: 'Human-in-the-Loop Gate',
      badgeColor: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]',
      expectedBehavior: 'Pauses at WAITING_FOR_APPROVAL until manager authorizes spend in INR.',
    },
    {
      id: 'quality_defect_moq',
      title: '3. Quality Inspection Failure & MOQ Constraint Enforcement',
      description: 'Incoming batch of Precision Optical Sensors (POS-5) fails QA inspection at Bengaluru Central Hub (25% defect rate). Alternate suppliers enforce hard Minimum Order Quantities (MOQ = 200). Agent validates business rules and adjusts procurement volumes.',
      badge: 'Constraint Enforcement',
      badgeColor: 'bg-indigo-50 text-[#6366F1] border-indigo-200',
      expectedBehavior: 'Evaluates MOQ, ISO certifications, and delivery speed trade-offs.',
    },
    {
      id: 'contradictory_info',
      title: '4. Contradictory Supplier Communication & Telemetry Anomaly',
      description: 'Supplier email claims shipment has dispatched on schedule, but carrier API tracking reports Customs Hold at Transit Port. Agent detects anomaly during post-execution verification and automatically replans secondary recovery route.',
      badge: 'Verification & Replanning',
      badgeColor: 'bg-[#FEE2E2] text-[#EF4444] border-[#FECACA]',
      expectedBehavior: 'Detects data conflict, triggers REPLAN state, and resolves.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Sandbox Controller Header */}
      <div className="glass-card-elevated p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 text-[#6366F1]">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#0F172A]">Simulation Sandbox & Disruption Testbed</h3>
                <p className="text-xs text-[#475569] mt-0.5">
                  Inject deterministic edge-case disruption events to validate agentic behavior, constraint checking, and Pareto trade-offs.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start md:self-auto">
            {onOpenCustomModal && (
              <button
                onClick={onOpenCustomModal}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#22D3EE] hover:brightness-110 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition hover:-translate-y-0.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Custom Scenario</span>
              </button>
            )}

            <button
              onClick={onResetSimulation}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-[#0F172A] font-extrabold text-xs border border-slate-300 shadow-sm transition hover:-translate-y-0.5"
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
              className="p-7 rounded-3xl bg-white border border-slate-200 hover:border-indigo-300 transition-all space-y-4 shadow-sm flex flex-col justify-between hover:-translate-y-1"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-extrabold px-3 py-1 rounded-full border ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                </div>
                <h4 className="text-base font-black text-[#0F172A] pt-1">{sc.title}</h4>
                <p className="text-xs text-[#475569] leading-relaxed">{sc.description}</p>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-[#475569]">
                  <span className="font-extrabold text-[#6366F1]">Expected Agent Behavior: </span>
                  <span>{sc.expectedBehavior}</span>
                </div>
              </div>

              <button
                onClick={() => onTriggerScenario(sc.id)}
                className="w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-cyan-50 hover:from-[#6366F1] hover:to-[#22D3EE] text-[#6366F1] hover:text-white font-extrabold text-xs border border-indigo-200 hover:border-transparent transition shadow-2xs hover:shadow-md duration-200 hover:-translate-y-0.5"
              >
                <Play className="w-4 h-4" />
                <span>Inject Scenario Into Pipeline</span>
              </button>
            </div>
          ))}

          {/* Custom Scenario Builder Card */}
          {onOpenCustomModal && (
            <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-r from-indigo-50/70 via-white to-cyan-50/70 border border-indigo-200 space-y-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="p-4 rounded-2xl bg-white text-[#6366F1] border border-indigo-100 shrink-0 shadow-sm">
                  <Sliders className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base sm:text-lg font-black text-[#0F172A]">Custom Disruption Parameter Builder</h4>
                  <p className="text-xs text-[#475569] max-w-xl leading-relaxed">
                    Test your custom supply chain edge-cases. Select target Purchase Orders, customize delay durations, defect rates, supplier shutdowns, or cost impacts (₹).
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenCustomModal}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#22D3EE] hover:brightness-110 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-600/25 flex items-center space-x-2 shrink-0 transition hover:-translate-y-0.5"
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
