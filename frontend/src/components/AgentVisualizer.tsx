import React from 'react';
import { Cpu, Terminal, Database, CheckCircle2, ShieldAlert, Sparkles, Activity } from 'lucide-react';
import { AgentStatus } from '../types';

interface AgentVisualizerProps {
  agentStatus: AgentStatus | null;
}

export const AgentVisualizer: React.FC<AgentVisualizerProps> = ({ agentStatus }) => {
  const currentState = agentStatus?.current_state || 'OBSERVE';
  const toolsCalled = agentStatus?.memory_context?.tools_called || [];

  const stateNodes = [
    { key: 'OBSERVE', desc: 'Ingestion' },
    { key: 'TRIAGE', desc: 'Scope' },
    { key: 'INVESTIGATE', desc: 'Twin Query' },
    { key: 'PLAN', desc: 'RFQs' },
    { key: 'EVALUATE', desc: 'Pareto Scoring' },
    { key: 'VALIDATE', desc: 'Constraints' },
    { key: 'APPROVE_OR_EXECUTE', desc: 'Execution' },
    { key: 'WAITING_FOR_APPROVAL', desc: 'HITL Escalation' },
    { key: 'VERIFY', desc: 'Audit Check' },
    { key: 'REPLAN', desc: 'Recovery' },
    { key: 'COMPLETE', desc: 'Resolved' },
  ];

  return (
    <div className="space-y-6">
      {/* State Machine Graphic Visualizer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <span>Agent Brain Architecture & State Flow</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 self-start sm:self-auto">
            Transitions Executed: <span className="font-bold text-indigo-300">{agentStatus?.step_count || 0}</span>
          </span>
        </div>

        {/* State Nodes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
          {stateNodes.map((s) => {
            const isCurrent = currentState === s.key;
            return (
              <div
                key={s.key}
                className={`p-3.5 rounded-2xl border text-center transition-all duration-200 ${
                  isCurrent
                    ? 'bg-gradient-to-br from-indigo-900/90 to-blue-900/80 border-indigo-400 text-white shadow-xl shadow-indigo-500/25 ring-2 ring-indigo-500 scale-105'
                    : 'bg-slate-950/70 border-slate-800/80 text-slate-400'
                }`}
              >
                <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  {s.desc}
                </div>
                <div className="text-xs font-black tracking-tight">{s.key}</div>
                {isCurrent && (
                  <span className="mt-2 inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 animate-pulse">
                    CURRENT STATE
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Memory & Tool Execution Trace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Tool Call Trace */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <span>Executed Tool Call Trace ({toolsCalled.length})</span>
            </h3>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {toolsCalled.length === 0 ? (
              <div className="p-10 text-center text-slate-500 italic text-xs bg-slate-950/60 rounded-xl border border-slate-800">
                No tool executions recorded in the active session.
              </div>
            ) : (
              toolsCalled.map((t: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-400 text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {t.tool}()
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(t.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 overflow-x-auto">
                    <span className="text-slate-500 font-bold block mb-1 text-[10px] uppercase">Input Parameters:</span>
                    {JSON.stringify(t.args, null, 2)}
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono bg-slate-900/50 p-2 rounded-lg border border-slate-800/60">
                    <span className="text-indigo-400 font-bold">Outcome: </span>
                    {t.result_summary}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Memory Context Inspector */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <span>Working Memory & Blackboard Context</span>
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-xs text-indigo-300 max-h-[420px] overflow-y-auto shadow-inner">
            <pre className="whitespace-pre-wrap">{JSON.stringify(agentStatus?.memory_context || {}, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
