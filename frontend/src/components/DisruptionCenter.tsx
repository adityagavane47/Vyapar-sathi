import React from 'react';
import { ShieldAlert, Play, CheckCircle2, AlertTriangle, ArrowRight, Eye, RefreshCw, Cpu, Layers } from 'lucide-react';
import { DisruptionEvent, AgentStatus, DecisionRecord } from '../types';

interface DisruptionCenterProps {
  disruptions: DisruptionEvent[];
  selectedDisruptionId: number | null;
  onSelectDisruption: (id: number) => void;
  agentStatus: AgentStatus | null;
  decisions: DecisionRecord[];
  onRunAgent: (id: number) => void;
  onStepAgent: (id: number) => void;
}

export const DisruptionCenter: React.FC<DisruptionCenterProps> = ({
  disruptions,
  selectedDisruptionId,
  onSelectDisruption,
  agentStatus,
  decisions,
  onRunAgent,
  onStepAgent,
}) => {
  const selectedDisruption = disruptions.find((d) => d.id === selectedDisruptionId) || disruptions[0];

  const currentDecision = selectedDisruption
    ? decisions.find((dec) => dec.disruption_id === selectedDisruption.id)
    : null;

  // Timeline Stages
  const currentState = agentStatus?.current_state || selectedDisruption?.status || 'OBSERVE';

  const timelineStages = [
    { key: 'OBSERVE', label: 'Detection & Event Normalization', icon: ShieldAlert },
    { key: 'TRIAGE', label: 'Disruption Triage', icon: Eye },
    { key: 'INVESTIGATE', label: 'Inventory & Supplier Investigation', icon: Cpu },
    { key: 'PLAN', label: 'Plan Formulation & RFQs', icon: Layers },
    { key: 'EVALUATE', label: 'Multi-Objective Pareto Scoring', icon: RefreshCw },
    { key: 'VALIDATE', label: 'Constraint Enforcement', icon: AlertTriangle },
    { key: 'APPROVE_OR_EXECUTE', label: 'Authorization & ERP Execution', icon: Play },
    { key: 'VERIFY', label: 'Post-Execution Verification', icon: CheckCircle2 },
    { key: 'COMPLETE', label: 'Disruption Resolved', icon: CheckCircle2 },
  ];

  const getStageStatus = (stageKey: string) => {
    if (currentState === 'COMPLETE') return 'completed';
    if (currentState === stageKey) return 'active';
    const order = ['OBSERVE', 'TRIAGE', 'INVESTIGATE', 'PLAN', 'EVALUATE', 'VALIDATE', 'APPROVE_OR_EXECUTE', 'WAITING_FOR_APPROVAL', 'VERIFY', 'REPLAN', 'COMPLETE'];
    const curIdx = order.indexOf(currentState);
    const stageIdx = order.indexOf(stageKey);
    return stageIdx < curIdx ? 'completed' : 'pending';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left List of Disruptions */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span>Disruption Inbox ({disruptions.length})</span>
          </h3>
        </div>

        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {disruptions.map((d) => {
            const isSelected = selectedDisruptionId === d.id;
            return (
              <div
                key={d.id}
                onClick={() => onSelectDisruption(d.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-indigo-900/40 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400 font-bold">{d.event_code}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-extrabold uppercase text-[10px] ${
                      d.severity === 'Critical'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : d.severity === 'High'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {d.severity}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-1 line-clamp-2">{d.description}</h4>
                <div className="flex items-center justify-between text-xs mt-3 pt-2 border-t border-slate-800/60">
                  <span className="text-slate-400">{d.event_type}</span>
                  <span
                    className={`font-semibold text-[11px] ${
                      d.status === 'RESOLVED'
                        ? 'text-emerald-400'
                        : d.status === 'IN_PROGRESS'
                        ? 'text-amber-400'
                        : 'text-indigo-400'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Detail & Interactive Timeline */}
      {selectedDisruption && (
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                    {selectedDisruption.event_code}
                  </span>
                  <span className="text-xs text-slate-400">
                    Received: {new Date(selectedDisruption.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white mt-2">{selectedDisruption.description}</h2>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onStepAgent(selectedDisruption.id)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition"
                >
                  <ArrowRight className="w-4 h-4 text-indigo-400" />
                  <span>Step Agent</span>
                </button>
                <button
                  onClick={() => onRunAgent(selectedDisruption.id)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
                >
                  <Play className="w-4 h-4" />
                  <span>Auto-Run Agent</span>
                </button>
              </div>
            </div>

            {/* Evidence details */}
            {selectedDisruption.evidence && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 font-mono text-xs text-slate-300">
                <span className="text-slate-500 uppercase font-bold text-[10px] block mb-1">Normalized Evidence Payload:</span>
                <pre className="whitespace-pre-wrap">{JSON.stringify(selectedDisruption.evidence, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Interactive Disruption Lifecycle Timeline */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Disruption Lifecycle & Agent State Timeline</h3>

            <div className="space-y-3">
              {timelineStages.map((stg, idx) => {
                const status = getStageStatus(stg.key);
                const Icon = stg.icon;
                return (
                  <div
                    key={stg.key}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      status === 'active'
                        ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                        : status === 'completed'
                        ? 'bg-slate-800/30 border-slate-800/80 text-slate-300'
                        : 'bg-slate-950/40 border-slate-900 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          status === 'active'
                            ? 'bg-indigo-600 text-white animate-pulse'
                            : status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-600'
                        }`}
                      >
                        {status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span className="font-semibold text-sm">{stg.label}</span>
                    </div>

                    <span
                      className={`text-xs font-mono font-bold ${
                        status === 'active'
                          ? 'text-indigo-400'
                          : status === 'completed'
                          ? 'text-emerald-400'
                          : 'text-slate-600'
                      }`}
                    >
                      {status === 'active' ? 'IN PROGRESS' : status === 'completed' ? 'PASSED' : 'PENDING'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Decision Summary if Available */}
          {currentDecision && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
              <h3 className="text-base font-bold text-white">Recommended Recovery Action</h3>
              <p className="text-sm font-semibold text-emerald-400">{currentDecision.recommendation_summary}</p>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{currentDecision.reasoning}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
