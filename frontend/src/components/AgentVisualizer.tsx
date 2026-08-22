import React, { useState } from 'react';
import {
  Cpu,
  Terminal,
  Database,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Activity,
  Layers,
  Search,
  Code,
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
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-8 shadow-2xl space-y-6 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-5">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
                <Cpu className="w-6 h-6" />
              </div>
              <span>Agent State Machine Architecture & Transitions</span>
            </h3>
            <p className="text-xs text-slate-400">
              Autonomous state cycle orchestrating supply chain investigation, constraint validation, and ERP transactions.
            </p>
          </div>

          <span className="text-xs text-slate-400 font-mono bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
            Transitions Executed: <strong className="font-bold text-indigo-300">{agentStatus?.step_count || 0}</strong>
          </span>
        </div>

        {/* State Nodes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 pt-2">
          {stateNodes.map((s) => {
            const isCurrent = currentState === s.key;
            return (
              <div
                key={s.key}
                className={`p-4 rounded-2xl border text-center transition-all duration-200 flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-gradient-to-br from-indigo-900/95 via-indigo-950 to-slate-900 border-indigo-400 text-white shadow-2xl shadow-indigo-500/25 ring-2 ring-indigo-500/60 scale-105'
                    : 'bg-slate-950/70 border-slate-800/80 text-slate-400'
                }`}
              >
                <div>
                  <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">
                    {s.title}
                  </div>
                  <div className="text-xs font-black tracking-tight">{s.key}</div>
                  <p className="text-[10px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{s.desc}</p>
                </div>

                {isCurrent && (
                  <span className="mt-3 inline-block text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 animate-pulse">
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
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-8 shadow-2xl space-y-5 backdrop-blur-xl flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <h3 className="text-base font-black text-white flex items-center space-x-2.5">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <span>Tool Call Execution Trace ({toolsCalled.length})</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400">Dynamic Tool Dispatch</span>
          </div>

          <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1 flex-1">
            {toolsCalled.length === 0 ? (
              <div className="p-12 text-center text-slate-500 italic text-xs bg-slate-950/60 rounded-2xl border border-slate-800">
                No tool executions recorded in the active session. Run the agent on an active disruption to view execution trace.
              </div>
            ) : (
              toolsCalled.map((t: any, idx: number) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-2.5 text-xs shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-400 text-xs bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      {t.tool}()
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(t.timestamp).toLocaleTimeString('en-IN')}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-300 font-mono bg-slate-900/90 p-3 rounded-xl border border-slate-800 overflow-x-auto">
                    <span className="text-slate-500 font-bold block mb-1 text-[10px] uppercase tracking-wider">
                      Input Arguments:
                    </span>
                    {JSON.stringify(t.args, null, 2)}
                  </div>

                  <div className="text-[11px] text-slate-300 font-mono bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/60 leading-relaxed">
                    <span className="text-indigo-400 font-bold">Outcome: </span>
                    {t.result_summary}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Working Memory Context Inspector */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-8 shadow-2xl space-y-5 backdrop-blur-xl flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <h3 className="text-base font-black text-white flex items-center space-x-2.5">
              <Database className="w-5 h-5 text-indigo-400" />
              <span>Working Memory Blackboard</span>
            </h3>
            <button
              onClick={handleCopyMemory}
              className="flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 transition"
            >
              {copiedMemory ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 font-mono text-xs text-indigo-300 max-h-[480px] overflow-y-auto shadow-inner flex-1 leading-relaxed">
            <pre className="whitespace-pre-wrap">{JSON.stringify(agentStatus?.memory_context || {}, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
