import React, { useState } from 'react';
import { Activity, ShieldCheck, Terminal, Filter, ChevronDown, ChevronUp, Copy, Check, Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { AuditEvent } from '../types';

interface AuditLogViewProps {
  audits: AuditEvent[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ audits }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('ALL');
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const stateFilters = ['ALL', 'TRIAGE', 'INVESTIGATE', 'PLAN', 'EVALUATE', 'VALIDATE', 'APPROVE_OR_EXECUTE', 'VERIFY', 'REPLAN'];

  const filtered = audits.filter((a) => {
    const matchesSearch =
      a.event_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.agent_state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.tool_called && a.tool_called.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.decision_summary && a.decision_summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.calculation_summary && a.calculation_summary.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesState = selectedStateFilter === 'ALL' || a.agent_state === selectedStateFilter;
    return matchesSearch && matchesState;
  });

  const handleCopyJson = (audit: AuditEvent) => {
    navigator.clipboard.writeText(JSON.stringify(audit, null, 2));
    setCopiedId(audit.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleRow = (id: number) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <span>Immutable Agent Audit & Decision Trail</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {audits.length} Records
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Complete, transparent breakdown of state transitions, constraint evaluations, tool executions, and ERP actions.
            </p>
          </div>

          {/* Search Filter Input */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search event ID, state, tool..."
              className="bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-72 shadow-inner"
            />
            <Filter className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* State Category Filter Chips */}
        <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-800/80">
          {stateFilters.map((st) => {
            const isSelected = selectedStateFilter === st;
            return (
              <button
                key={st}
                onClick={() => setSelectedStateFilter(st)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>

      {/* Audit Log Stream Cards / Expandable List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
            <Info className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="font-semibold text-white">No audit records found</p>
            <p className="text-[11px] text-slate-500 mt-1">Try clearing your search query or triggering an agent run</p>
          </div>
        ) : (
          filtered.map((a) => {
            const isExpanded = expandedRowId === a.id;
            const resObj = a.constraint_check_result as Record<string, any> | undefined;
            const constraintChecks = (resObj && Array.isArray(resObj.checks)) ? resObj.checks : [];
            const isFailed = Boolean(resObj && resObj.is_valid === false);
            const toolParams = a.tool_input_params || a.tool_input;

            return (
              <div
                key={a.id}
                className={`bg-slate-900/90 border rounded-2xl transition-all duration-200 overflow-hidden shadow-lg ${
                  isExpanded
                    ? 'border-indigo-500/50 ring-1 ring-indigo-500/30 bg-slate-900'
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Summary Header Row (Clickable) */}
                <div
                  onClick={() => toggleRow(a.id)}
                  className="p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-800/30 transition select-none"
                >
                  <div className="flex items-start sm:items-center space-x-3">
                    <span className="font-mono text-[11px] text-slate-400 font-bold whitespace-nowrap bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      {a.event_id}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold text-[10px] tracking-wide uppercase">
                      {a.agent_state}
                    </span>
                    {a.tool_called && (
                      <span className="font-mono text-emerald-400 font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {a.tool_called}()
                      </span>
                    )}
                    {isFailed && (
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>CONSTRAINT VIOLATION</span>
                      </span>
                    )}
                  </div>

                  {/* Summary Snippet & Expand Action */}
                  <div className="flex items-center justify-between md:justify-end space-x-4 text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">
                      {new Date(a.timestamp).toLocaleTimeString()}
                    </span>
                    <button className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800/50">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Primary Content Row (Always fully visible) */}
                <div className="px-4 pb-4 pt-1 text-xs border-t border-slate-800/40 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Calculation / Reasoning Summary */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Analysis & Calculation Summary
                    </span>
                    <div className="p-3 bg-slate-950/70 border border-slate-800/60 rounded-xl text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
                      {a.calculation_summary || (a.constraint_check_result ? JSON.stringify(a.constraint_check_result) : 'Standard state transition execution.')}
                    </div>
                  </div>

                  {/* Execution / Verification Result */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Result & Verification Outcome
                    </span>
                    <div className="p-3 bg-slate-950/70 border border-slate-800/60 rounded-xl text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                      {a.execution_result || a.verification_result || a.decision_summary || 'No direct ERP mutation in this stage.'}
                    </div>
                  </div>
                </div>

                {/* Expanded Deep-Dive Section (Constraint Chips, Tool Arguments, Raw JSON) */}
                {isExpanded && (
                  <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {/* Constraint Verification Breakdown if available */}
                    {constraintChecks.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block mb-2">
                          Constraint Verification Checks ({constraintChecks.length})
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {constraintChecks.map((chk: any, idx: number) => (
                            <div
                              key={idx}
                              className={`p-2.5 rounded-xl border flex items-start space-x-2.5 text-xs ${
                                chk.passed
                                  ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                                  : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                              }`}
                            >
                              {chk.passed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <div className="font-bold text-[11px] uppercase tracking-wide">
                                  {chk.check.replace(/_/g, ' ')}
                                </div>
                                <div className="text-[11px] mt-0.5 text-slate-300">
                                  {chk.details || (chk.passed ? 'Constraint satisfied' : 'Check failed')}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tool Arguments if executed */}
                    {toolParams && Object.keys(toolParams).length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Tool Input Arguments ({a.tool_called})
                        </span>
                        <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 font-mono text-[11px] overflow-x-auto">
                          {JSON.stringify(toolParams, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Complete Event JSON */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Full Immutable Audit Payload
                        </span>
                        <button
                          onClick={() => handleCopyJson(a)}
                          className="flex items-center space-x-1 text-[11px] text-indigo-400 hover:text-indigo-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 transition"
                        >
                          {copiedId === a.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy JSON</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-300 font-mono text-[11px] overflow-x-auto max-h-60 shadow-inner">
                        {JSON.stringify(a, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
