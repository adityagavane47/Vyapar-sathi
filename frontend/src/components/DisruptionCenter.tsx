import React, { useState } from 'react';
import {
  ShieldAlert,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  RefreshCw,
  Cpu,
  Layers,
  PlusCircle,
  Sparkles,
  Activity,
  Search,
  Check,
} from 'lucide-react';
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
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isStepping, setIsStepping] = useState<boolean>(false);

  const selectedDisruption = disruptions.find((d) => d.id === selectedDisruptionId) || disruptions[0];

  const currentDecision = selectedDisruption
    ? decisions.find((dec) => dec.disruption_id === selectedDisruption.id)
    : null;

  // Filter disruptions
  const filteredDisruptions = disruptions.filter((d) => {
    const isResolved = d.status === 'RESOLVED' || (d.status as string) === 'COMPLETE';
    if (filterTab === 'ACTIVE' && isResolved) return false;
    if (filterTab === 'RESOLVED' && !isResolved) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = d.event_code.toLowerCase().includes(q);
      const matchDesc = d.description.toLowerCase().includes(q);
      const matchType = d.event_type.toLowerCase().includes(q);
      return matchCode || matchDesc || matchType;
    }
    return true;
  });

  // State Machine Stages
  const currentState = agentStatus?.current_state || selectedDisruption?.status || 'OBSERVE';

  const timelineStages = [
    { key: 'OBSERVE', label: '1. Detection & Event Normalization', desc: 'Ingest and sanitize ERP / IoT signal data', icon: ShieldAlert },
    { key: 'TRIAGE', label: '2. Disruption Scope & Order Triage', desc: 'Map impacted POs and calculate criticality', icon: Eye },
    { key: 'INVESTIGATE', label: '3. Inventory Twin & Supplier Discovery', desc: 'Query stock levels, allocations & vendor RFQs', icon: Cpu },
    { key: 'PLAN', label: '4. Multi-Strategy Formulation', desc: 'Generate candidate expedited & substitute plans', icon: Layers },
    { key: 'EVALUATE', label: '5. Multi-Objective Pareto Optimization', desc: 'Score options on Continuity, Time, Cost, Quality', icon: RefreshCw },
    { key: 'VALIDATE', label: '6. Hard Constraint Enforcement', desc: 'Validate MOQ, ISO certificates, and budget limits', icon: AlertTriangle },
    { key: 'APPROVE_OR_EXECUTE', label: '7. Authorization & Autonomous Execution', desc: 'Trigger HITL escalation (> ₹50k) or autonomous ERP PO', icon: Play },
    { key: 'VERIFY', label: '8. Post-Execution Audit Verification', desc: 'Confirm ERP mutation and detect contradictory signals', icon: CheckCircle2 },
    { key: 'COMPLETE', label: '9. Operational Continuity Restored', desc: 'Disruption fully resolved with complete audit ledger', icon: CheckCircle2 },
  ];

  const getStageStatus = (stageKey: string) => {
    if (currentState === 'COMPLETE' || selectedDisruption?.status === 'RESOLVED') return 'completed';
    if (currentState === stageKey) return 'active';
    const order = ['OBSERVE', 'TRIAGE', 'INVESTIGATE', 'PLAN', 'EVALUATE', 'VALIDATE', 'APPROVE_OR_EXECUTE', 'WAITING_FOR_APPROVAL', 'VERIFY', 'REPLAN', 'COMPLETE'];
    const curIdx = order.indexOf(currentState);
    const stageIdx = order.indexOf(stageKey);
    return stageIdx < curIdx ? 'completed' : 'pending';
  };

  const handleRun = async (id: number) => {
    setIsRunning(true);
    try {
      await onRunAgent(id);
    } finally {
      setIsRunning(false);
    }
  };

  const handleStep = async (id: number) => {
    setIsStepping(true);
    try {
      await onStepAgent(id);
    } finally {
      setIsStepping(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Disruption Inbox (4 cols) */}
      <div className="lg:col-span-4 glass-card-elevated p-6 space-y-5 flex flex-col max-h-[840px]">
        {/* Inbox Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-[#EF4444] border border-rose-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A]">Disruption Inbox</h3>
              <p className="text-[11px] text-[#475569]">{disruptions.length} Total Incidents Logged</p>
            </div>
          </div>

          {onOpenCustomModal && (
            <button
              onClick={onOpenCustomModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#22D3EE] hover:brightness-110 text-white font-bold text-xs shadow-sm transition hover:-translate-y-0.5"
              title="Create a custom disruption event"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Custom</span>
            </button>
          )}
        </div>

        {/* Filter Pills & Search Box */}
        <div className="space-y-3">
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(['ALL', 'ACTIVE', 'RESOLVED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition text-center ${
                  filterTab === tab
                    ? 'bg-white text-[#0F172A] shadow-sm'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, supplier, component..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#6366F1] font-sans shadow-2xs"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Incident List */}
        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
          {filteredDisruptions.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-[#475569] text-xs">
              <Sparkles className="w-6 h-6 text-slate-400 mx-auto mb-2 opacity-60" />
              <p className="font-bold text-[#0F172A]">No Incidents Found</p>
              <p className="text-[11px] text-[#64748B] mt-1">
                {searchQuery ? 'Try modifying your search criteria.' : 'Inject a custom disruption to test recovery.'}
              </p>
            </div>
          ) : (
            filteredDisruptions.map((d) => {
              const isSelected = selectedDisruption?.id === d.id;
              const isResolved = d.status === 'RESOLVED' || (d.status as string) === 'COMPLETE';
              return (
                <div
                  key={d.id}
                  onClick={() => onSelectDisruption(d.id)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border select-none duration-200 ${
                    isSelected
                      ? 'bg-indigo-50/90 border-[#6366F1] shadow-md ring-1 ring-[#6366F1]/40'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[#6366F1] font-extrabold">{d.event_code}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-extrabold uppercase text-[9px] border ${
                        d.severity === 'Critical'
                          ? 'bg-[#FEE2E2] text-[#EF4444] border-[#FECACA]'
                          : d.severity === 'High'
                          ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
                          : 'bg-[#CFFAFE] text-[#0891B2] border-[#A5F3FC]'
                      }`}
                    >
                      {d.severity}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-extrabold text-[#0F172A] mt-2 line-clamp-2 leading-relaxed">
                    {d.description}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] mt-3 pt-2 border-t border-slate-100">
                    <span className="text-[#475569] capitalize font-medium">{d.event_type.replace(/_/g, ' ')}</span>
                    <span
                      className={`font-mono font-extrabold ${
                        isResolved
                          ? 'text-[#059669]'
                          : d.status === 'IN_PROGRESS' || (d.status as string) === 'WAITING_FOR_APPROVAL'
                          ? 'text-[#D97706]'
                          : 'text-[#6366F1]'
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

      {/* Right Column: Detailed Inspector & State Machine Controller (8 cols) */}
      {selectedDisruption ? (
        <div className="lg:col-span-8 space-y-7">
          {/* Header Action Card */}
          <div className="glass-card-elevated p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 border-b border-slate-100 pb-5">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-3 flex-wrap gap-2">
                  <span className="font-mono text-xs text-[#6366F1] bg-indigo-50 border border-indigo-200 px-3 py-0.5 rounded-lg font-bold">
                    {selectedDisruption.event_code}
                  </span>
                  <span className="text-xs text-[#475569]">
                    Detected: {new Date(selectedDisruption.timestamp).toLocaleTimeString('en-IN')}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#D97706] bg-[#FEF3C7] px-2.5 py-0.5 rounded-full border border-[#FDE68A]">
                    Severity: {selectedDisruption.severity}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-black text-[#0F172A] leading-snug pt-1">
                  {selectedDisruption.description}
                </h2>
              </div>

              {/* Execution Controls */}
              <div className="flex items-center space-x-3 shrink-0 self-start sm:self-center">
                <button
                  onClick={() => handleStep(selectedDisruption.id)}
                  disabled={isStepping || isRunning || selectedDisruption.status === 'RESOLVED'}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#0F172A] border border-slate-300 font-extrabold text-xs shadow-sm transition disabled:opacity-40 hover:-translate-y-0.5"
                  title="Execute next single state transition"
                >
                  <ArrowRight className="w-4 h-4 text-[#6366F1]" />
                  <span>{isStepping ? 'Stepping...' : 'Step Once'}</span>
                </button>

                <button
                  onClick={() => handleRun(selectedDisruption.id)}
                  disabled={isRunning || isStepping || selectedDisruption.status === 'RESOLVED'}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#22D3EE] hover:brightness-110 text-white font-extrabold text-xs shadow-md shadow-indigo-600/25 transition disabled:opacity-40 hover:-translate-y-0.5"
                  title="Run end-to-end autonomous resolution loop"
                >
                  <Play className="w-4 h-4" />
                  <span>{isRunning ? 'Running Agent Loop...' : 'Auto-Run Agent'}</span>
                </button>
              </div>
            </div>

            {/* Evidence Telemetry Card */}
            {selectedDisruption.evidence && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
                  Normalized Evidence Telemetry:
                </span>
                <pre className="text-[#334155] whitespace-pre-wrap text-[11px] leading-relaxed font-mono">
                  {JSON.stringify(selectedDisruption.evidence, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Interactive 9-Stage State Flowchart */}
          <div className="glass-card-elevated p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#0F172A] flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-[#6366F1]" />
                  </div>
                  <span>Agent Decision & Execution State Progression</span>
                </h3>
                <p className="text-xs text-[#475569] mt-0.5">
                  Deterministic transition sequence governed by multi-objective scoring and hard constraint validators.
                </p>
              </div>
              <span className="text-xs font-mono font-extrabold text-[#6366F1] bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                State: {currentState}
              </span>
            </div>

            <div className="space-y-3">
              {timelineStages.map((stg, idx) => {
                const status = getStageStatus(stg.key);
                return (
                  <div
                    key={stg.key}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all duration-200 gap-3 ${
                      status === 'active'
                        ? 'bg-indigo-50/90 border-2 border-[#6366F1] shadow-md ring-1 ring-[#6366F1]/30'
                        : status === 'completed'
                        ? 'bg-emerald-50/70 border-emerald-200 text-[#0F172A]'
                        : 'bg-slate-50 border-slate-200/80 text-[#64748B]'
                    }`}
                  >
                    <div className="flex items-start sm:items-center space-x-3.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                          status === 'active'
                            ? 'bg-[#6366F1] text-white animate-pulse shadow-md shadow-indigo-600/40'
                            : status === 'completed'
                            ? 'bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0]'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {status === 'completed' ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div>
                        <div className="font-extrabold text-xs sm:text-sm text-[#0F172A]">{stg.label}</div>
                        <p className="text-[11px] text-[#475569] mt-0.5">{stg.desc}</p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-mono font-extrabold self-start sm:self-center px-3 py-1 rounded-full ${
                        status === 'active'
                          ? 'bg-indigo-100 text-[#6366F1] border border-indigo-300'
                          : status === 'completed'
                          ? 'bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0]'
                          : 'bg-slate-200 text-[#64748B]'
                      }`}
                    >
                      {status === 'active' ? 'IN PROGRESS' : status === 'completed' ? 'SATISFIED' : 'QUEUED'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Decision Summary Card if Available */}
          {currentDecision && (
            <div className="glass-card-elevated p-7 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748B]">
                  Recommended Recovery Strategy (Decision #{currentDecision.id})
                </h3>
                <span className="text-xs font-mono text-[#059669] bg-[#D1FAE5] px-2.5 py-0.5 rounded-full font-extrabold border border-[#A7F3D0]">
                  Score: {currentDecision.score}/100
                </span>
              </div>
              <p className="text-base font-black text-[#059669]">{currentDecision.recommendation_summary}</p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-[#334155] leading-relaxed whitespace-pre-wrap font-sans">
                {currentDecision.reasoning}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="lg:col-span-8 glass-card p-16 text-center text-[#475569]">
          <p className="font-bold text-[#0F172A]">Select a disruption from the inbox</p>
          <p className="text-xs text-[#64748B] mt-1">Or click "+ Custom" to create a new incident</p>
        </div>
      )}
    </div>
  );
};
