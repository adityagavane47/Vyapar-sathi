import React, { useState } from 'react';
import {
  Cpu,
  Terminal,
  Database,
  Copy,
  Check
} from 'lucide-react';
import { AgentStatus } from '../types';

interface AgentVisualizerProps {
  agentStatus: AgentStatus | null;
}

export const AgentVisualizer: React.FC<AgentVisualizerProps> = ({ agentStatus }) => {
  const currentState = agentStatus?.current_state || 'OBSERVE';
  const toolsCalled = agentStatus?.memory_context?.tools_called || [];
  const [copiedMemory, setCopiedMemory] = useState<boolean>(false);

  const stateNodes = [
    { key: 'OBSERVE', title: '1. Observe', desc: 'Signal & Event Ingestion' },
    { key: 'TRIAGE', title: '2. Triage', desc: 'Impact Scope & PO Mapping' },
    { key: 'INVESTIGATE', title: '3. Investigate', desc: 'Inventory & Vendor Query' },
    { key: 'PLAN', title: '4. Plan', desc: 'Recovery Formulation' },
    { key: 'EVALUATE', title: '5. Evaluate', desc: 'Pareto Trade-Off Scoring' },
    { key: 'VALIDATE', title: '6. Validate', desc: 'Hard Constraint Checks' },
    { key: 'APPROVE_OR_EXECUTE', title: '7. Execute', desc: 'Autonomous ERP Mutation' },
    { key: 'WAITING_FOR_APPROVAL', title: '8. Authorize', desc: 'Human-in-the-Loop Gate' },
    { key: 'VERIFY', title: '9. Verify', desc: 'Post-Execution Audit' },
    { key: 'REPLAN', title: '10. Replan', desc: 'Secondary Recovery' },
    { key: 'COMPLETE', title: '11. Complete', desc: 'Continuity Restored' },
  ];

  const handleCopyMemory = () => {
    navigator.clipboard.writeText(JSON.stringify(agentStatus?.memory_context || {}, null, 2));
    setCopiedMemory(true);
    setTimeout(() => setCopiedMemory(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* 1. State Machine Graphic Visualizer */}
      <div className="glass-card-elevated p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-[#0F172A] flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-indigo-50 text-[#6366F1]">
                <Cpu className="w-6 h-6" />
              </div>
              <span>Agent State Machine Architecture & Transitions</span>
            </h3>
            <p className="text-xs text-[#475569]">
              Autonomous state cycle orchestrating supply chain investigation, constraint validation, and ERP transactions.
            </p>
          </div>

          <span className="text-xs text-[#475569] font-mono bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto font-medium">
            Transitions Executed: <strong className="font-extrabold text-[#6366F1]">{agentStatus?.step_count || 0}</strong>
          </span>
        </div>

        {/* State Nodes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 pt-2">
          {stateNodes.map((s) => {
            const isCurrent = currentState === s.key;
            return (
              <div
                key={s.key}
                className={`p-4 rounded-2xl border text-center transition-all duration-200 flex flex-col justify-between hover:-translate-y-0.5 ${
                  isCurrent
                    ? 'bg-indigo-50/90 border-2 border-[#6366F1] text-[#0F172A] shadow-md ring-1 ring-[#6366F1]/30 scale-105'
                    : 'bg-white border-slate-200 text-[#475569]'
                }`}
              >
                <div>
                  <div className="text-[10px] font-extrabold uppercase text-[#64748B] tracking-wider mb-1">
                    {s.title}
                  </div>
                  <div className="text-xs font-black text-[#0F172A] tracking-tight">{s.key}</div>
                  <p className="text-[10px] text-[#475569] mt-1.5 line-clamp-2 leading-relaxed">{s.desc}</p>
                </div>

                {isCurrent && (
                  <span className="mt-3 inline-block text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#10B981] text-white shadow-xs">
                    CURRENT STATE
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Tool Trace & Memory Context Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Real-time Tool Call Trace */}
        <div className="glass-card-elevated p-8 space-y-5 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-[#0F172A] flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Terminal className="w-4 h-4 text-[#059669]" />
              </div>
              <span>Tool Call Execution Trace ({toolsCalled.length})</span>
            </h3>
            <span className="text-xs font-mono text-[#059669] font-bold">Dynamic Tool Dispatch</span>
          </div>

          <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1 flex-1">
            {toolsCalled.length === 0 ? (
              <div className="p-12 text-center text-[#64748B] italic text-xs bg-slate-50 rounded-2xl border border-slate-200">
                No tool executions recorded in the active session. Run the agent on an active disruption to view execution trace.
              </div>
            ) : (
              toolsCalled.map((t: any, idx: number) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2.5 text-xs shadow-sm hover:-translate-y-0.5 transition-transform"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#059669] text-xs bg-[#D1FAE5] px-2.5 py-1 rounded-lg border border-[#A7F3D0]">
                      {t.tool}()
                    </span>
                    <span className="text-[10px] text-[#64748B] font-mono">
                      {new Date(t.timestamp).toLocaleTimeString('en-IN')}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#334155] font-mono bg-slate-50 p-3 rounded-xl border border-slate-200 overflow-x-auto">
                    <span className="text-[#64748B] font-bold block mb-1 text-[10px] uppercase tracking-wider">
                      Input Arguments:
                    </span>
                    {JSON.stringify(t.args, null, 2)}
                  </div>

                  <div className="text-[11px] text-[#334155] font-mono bg-slate-50/70 p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                    <span className="text-[#6366F1] font-bold">Outcome: </span>
                    {t.result_summary}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Working Memory Context Inspector */}
        <div className="glass-card-elevated p-8 space-y-5 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-[#0F172A] flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Database className="w-4 h-4 text-[#6366F1]" />
              </div>
              <span>Working Memory Blackboard</span>
            </h3>
            <button
              onClick={handleCopyMemory}
              className="flex items-center space-x-1.5 text-xs text-[#6366F1] hover:text-[#4F46E5] bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200 transition font-bold"
            >
              {copiedMemory ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#059669]" />
                  <span className="text-[#059669]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-[#334155] max-h-[480px] overflow-y-auto shadow-2xs flex-1 leading-relaxed">
            <pre className="whitespace-pre-wrap">{JSON.stringify(agentStatus?.memory_context || {}, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
