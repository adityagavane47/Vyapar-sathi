import React, { useState } from 'react';
import { Activity, ShieldCheck, Terminal, Filter } from 'lucide-react';
import { AuditEvent } from '../types';

interface AuditLogViewProps {
  audits: AuditEvent[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ audits }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = audits.filter(
    (a) =>
      a.event_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.agent_state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.tool_called && a.tool_called.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <span>Immutable Agent Audit & Explainability Trail ({audits.length})</span>
          </h3>
          <p className="text-xs text-slate-400">Structured log of state transitions, tool execution inputs, and constraint checks</p>
        </div>

        {/* Search */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter audit logs..."
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-64"
        />
      </div>

      {/* Audit Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="text-slate-400 uppercase bg-slate-800/50 border-b border-slate-800">
            <tr>
              <th className="py-3 px-3">Timestamp</th>
              <th className="py-3 px-3">State</th>
              <th className="py-3 px-3">Tool Called</th>
              <th className="py-3 px-3">Calculation / Constraint Check</th>
              <th className="py-3 px-3">Result / Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                  {new Date(a.timestamp).toLocaleTimeString()}
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold text-[10px]">
                    {a.agent_state}
                  </span>
                </td>
                <td className="py-3 px-3 text-emerald-400 font-bold">
                  {a.tool_called ? `${a.tool_called}()` : '—'}
                </td>
                <td className="py-3 px-3 max-w-xs truncate text-slate-300">
                  {a.calculation_summary || (a.constraint_check_result ? JSON.stringify(a.constraint_check_result) : '—')}
                </td>
                <td className="py-3 px-3 max-w-xs truncate text-slate-400">
                  {a.execution_result || a.verification_result || a.decision_summary || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
