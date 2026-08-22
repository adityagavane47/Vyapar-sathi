import React from 'react';
import { ShieldAlert, Play, CheckCircle2, AlertTriangle, ArrowRight, Eye, RefreshCw, Cpu, Layers, PlusCircle, Sparkles, Activity } from 'lucide-react';
import { DisruptionEvent, AgentStatus, DecisionRecord } from '../types';

interface DisruptionCenterProps {
  disruptions: DisruptionEvent[];
  selectedDisruptionId: number | null;
  onSelectDisruption: (id: number) => void;
  agentStatus: AgentStatus | null;
  decisions: DecisionRecord[];
  onRunAgent: (id: number) => void;
  onStepAgent: (id: number) => void;
  onOpenCustomModal?: () => void;
}

export const DisruptionCenter: React.FC<DisruptionCenterProps> = ({
  disruptions,
  selectedDisruptionId,
  onSelectDisruption,
  agentStatus,
  decisions,
  onRunAgent,
  onStepAgent,
  onOpenCustomModal,
}) => {
  const selectedDisruption = disruptions.find((d) => d.id === selectedDisruptionId) || disruptions[0];

  const currentDecision = selectedDisruption
    ? decisions.find((dec) => dec.disruption_id === selectedDisruption.id)
    : null;

  // Timeline Stages
  const currentState = agentStatus?.current_state || selectedDisruption?.status || 'OBSERVE';

  const timelineStages = [
    { key: 'OBSERVE', label: 'Detection & Event Normalization', icon: ShieldAlert },
    { key: 'TRIAGE', label: 'Disruption Triage & Order Scope', icon: Eye },
    { key: 'INVESTIGATE', label: 'Twin Inventory & Supplier Query', icon: Cpu },
    { key: 'PLAN', label: 'Plan Formulation & Dynamic RFQs', icon: Layers },
    { key: 'EVALUATE', label: 'Multi-Objective Pareto Scoring', icon: RefreshCw },
    { key: 'VALIDATE', label: 'Constraint Enforcement & Policy Checks', icon: AlertTriangle },
    { key: 'APPROVE_OR_EXECUTE', label: 'Authorization & Autonomous ERP Execution', icon: Play },
    { key: 'VERIFY', label: 'Post-Execution ERP Confirmation', icon: CheckCircle2 },
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
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span>Disruption Inbox ({disruptions.length})</span>
          </h3>

          {onOpenCustomModal && (
            <button
              onClick={onOpenCustomModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Custom</span>
            </button>
          )}
        </div>

        <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
          {disruptions.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-400 text-xs">
              <Sparkles className="w-6 h-6 text-slate-500 mx-auto mb-2" />
              <p className="font-semibold text-white">Inbox Zero</p>
              <p className="text-[11px] text-slate-500 mt-1">No active disruptions reported. Inject a custom event to begin.</p>
            </div>
          ) : (
            disruptions.map((d) => {
              const isSelected = selectedDisruption?.id === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => onSelectDisruption(d.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border select-none ${
                    isSelected
                      ? 'bg-gradient-to-br from-indigo-950/80 to-slate-900 border-indigo-500/80 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500/40'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60'
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
                  <h4 className="text-sm font-bold text-white mt-1.5 line-clamp-2">{d.description}</h4>
                  <div className="flex items-center justify-between text-xs mt-3 pt-2 border-t border-slate-800/60">
                    <span className="text-slate-400 text-[11px] capitalize">{d.event_type.replace(/_/g, ' ')}</span>
                    <span
                      className={`font-semibold text-[11px] font-mono ${
                        (d.status as string) === 'RESOLVED' || (d.status as string) === 'COMPLETE'
                          ? 'text-emerald-400'
                          : (d.status as string) === 'IN_PROGRESS' || (d.status as string) === 'WAITING_FOR_APPROVAL'
                          ? 'text-amber-400'
                          : 'text-indigo-400'
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Detail & Interactive State Progression Timeline */}
      {selectedDisruption ? (
        <div className="lg:col-span-2 space-y-6">
          {/* Header Action Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-lg font-bold">
                    {selectedDisruption.event_code}
                  </span>
                  <span className="text-xs text-slate-400">
                    Detected: {new Date(selectedDisruption.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white mt-2 leading-snug">
                  {selectedDisruption.description}
                </h2>
              </div>

              {/* Action Execution Buttons */}
              <div className="flex items-center space-x-2.5 self-start sm:self-center shrink-0">
                <button
                  onClick={() => onStepAgent(selectedDisruption.id)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition"
                  title="Execute a single step transition"
                >
                  <ArrowRight className="w-4 h-4 text-indigo-400" />
                  <span>Step Once</span>
                </button>
                <button
                  onClick={() => onRunAgent(selectedDisruption.id)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
                  title="Execute full autonomous loop"
                >
                  <Play className="w-4 h-4" />
                  <span>Auto-Run Loop</span>
                </button>
              </div>
            </div>

            {/* Evidence Payload Details */}
            {selectedDisruption.evidence && (
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 font-mono text-xs text-slate-300">
                <span className="text-slate-500 uppercase font-bold text-[10px] block mb-1">
                  Normalized Evidence Telemetry:
                </span>
                <pre className="whitespace-pre-wrap text-[11px] text-indigo-300">
                  {JSON.stringify(selectedDisruption.evidence, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Interactive State Timeline */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <span>Agent Execution State Machine</span>
              </h3>
              <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                Current: {currentState}
              </span>
            </div>

            <div className="space-y-2.5">
              {timelineStages.map((stg, idx) => {
                const status = getStageStatus(stg.key);
                const Icon = stg.icon;
                return (
                  <div
                    key={stg.key}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      status === 'active'
                        ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500/40'
                        : status === 'completed'
                        ? 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                        : 'bg-slate-950/30 border-slate-900/80 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          status === 'active'
                            ? 'bg-indigo-600 text-white animate-pulse'
                            : status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-600'
                        }`}
                      >
                        {status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span className="font-semibold text-xs sm:text-sm">{stg.label}</span>
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
                      {status === 'active' ? 'IN PROGRESS' : status === 'completed' ? 'RESOLVED' : 'QUEUED'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Decision Summary Callout if Available */}
          {currentDecision && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3 backdrop-blur-md">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Recommended Recovery Action
              </h3>
              <p className="text-sm font-bold text-emerald-400">{currentDecision.recommendation_summary}</p>
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                {currentDecision.reasoning}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <p>Select or create a disruption to view the state timeline.</p>
        </div>
      )}
    </div>
  );
};
