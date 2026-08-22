import React from 'react';
import { Cpu, Terminal, Database, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AgentStatus } from '../types';

interface AgentVisualizerProps {
  agentStatus: AgentStatus | null;
}

export const AgentVisualizer: React.FC<AgentVisualizerProps> = ({ agentStatus }) => {
  const currentState = agentStatus?.current_state || 'OBSERVE';
  const toolsCalled = agentStatus?.memory_context?.tools_called || [];

  const stateNodes = [
    'OBSERVE',
    'TRIAGE',
    'INVESTIGATE',
    'PLAN',
    'EVALUATE',
    'VALIDATE',
    'APPROVE_OR_EXECUTE',
    'WAITING_FOR_APPROVAL',
    'VERIFY',
    'REPLAN',
    'COMPLETE',
  ];

  return (
    <div className="space-y-6">
      {/* State Machine Graphic Visualizer */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <span>Agent Orchestrator State Machine</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Total Tool Steps Executed: <span className="font-bold text-white">{agentStatus?.step_count || 0}</span>
          </span>
        </div>

        {/* State nodes grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
          {stateNodes.map((s) => {
            const isCurrent = currentState === s;
            return (
              <div
                key={s}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-lg shadow-indigo-500/20 scale-105 ring-2 ring-indigo-500'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider mb-1">State</div>
                <div className="text-xs font-black tracking-tight">{s}</div>
                {isCurrent && (
                  <span className="mt-1.5 inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500 text-white animate-pulse">
                    ACTIVE
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
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <span>Executed Tool Trace ({toolsCalled.length})</span>
          </h3>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {toolsCalled.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">No tools executed yet in current run.</p>
            ) : (
              toolsCalled.map((t: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-emerald-400">{t.tool}()</span>
                    <span className="text-[10px] text-slate-500">{new Date(t.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono bg-slate-900/60 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 font-bold block mb-1">Arguments:</span>
                    {JSON.stringify(t.args)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono line-clamp-2">
                    <span className="text-slate-500 font-bold">Result: </span>
                    {t.result_summary}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Memory Context Inspector */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <span>Agent Memory Context & Variables</span>
          </h3>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-slate-300 max-h-[400px] overflow-y-auto">
            <pre className="whitespace-pre-wrap">{JSON.stringify(agentStatus?.memory_context || {}, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
