import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  Terminal,
  Filter,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  FileCode,
  Shield
} from 'lucide-react';
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
    <div className="space-y-8">
      {/* 1. Header & Search Filter Card */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-800/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white flex items-center space-x-2.5">
                  <span>Immutable Decision & Constraint Audit Trail</span>
                  <span className="text-xs font-mono px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {audits.length} Records
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cryptographically structured ledger recording all agent state transitions, tool parameters, and constraint verifications.
                </p>
              </div>
            </div>
          </div>

          {/* Search Filter Input */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search event ID, state, tool..."
              className="bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-80 shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* State Category Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {stateFilters.map((st) => {
            const isSelected = selectedStateFilter === st;
            const count =
              st === 'ALL' ? audits.length : audits.filter((a) => a.agent_state === st).length;
            return (
              <button
                key={st}
                onClick={() => setSelectedStateFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{st}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Audit Stream Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-16 text-center text-slate-400 text-xs">
            <Info className="w-10 h-10 text-slate-500 mx-auto mb-3 opacity-60" />
            <p className="font-bold text-white text-base">No Audit Records Matching Filter</p>
            <p className="text-xs text-slate-500 mt-1">Try selecting 'ALL' or executing an agent run cycle.</p>
          </div>
        ) : (
          filtered.map((a) => {
            const isExpanded = expandedRowId === a.id;
            const resObj = a.constraint_check_result as Record<string, any> | undefined;
            const constraintChecks = resObj && Array.isArray(resObj.checks) ? resObj.checks : [];
            const isFailed = Boolean(resObj && resObj.is_valid === false);
            const toolParams = a.tool_input_params || a.tool_input;

            return (
              <div
                key={a.id}
                className={`bg-slate-900/90 border rounded-3xl transition-all duration-200 overflow-hidden shadow-xl ${
                  isExpanded
                    ? 'border-indigo-500/80 ring-2 ring-indigo-500/30 bg-slate-900'
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Summary Header Row (Clickable) */}
                <div
                  onClick={() => toggleRow(a.id)}
                  className="p-5 sm:p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/30 transition select-none"
                >
                  <div className="flex items-center space-x-3.5 flex-wrap gap-2">
                    <span className="font-mono text-xs text-slate-400 font-bold bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                      {a.event_id}
                    </span>

                    <span className="px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold text-xs uppercase tracking-wide">
                      {a.agent_state}
                    </span>

                    {a.tool_called && (
                      <span className="font-mono text-emerald-400 font-bold text-xs bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                        {a.tool_called}()
                      </span>
                    )}

                    {isFailed && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>CONSTRAINT VIOLATION</span>
                      </span>
                    )}
                  </div>

                  {/* Summary Snippet & Expand Action */}
                  <div className="flex items-center space-x-4 text-xs">
                    <span className="text-slate-400 font-mono text-xs">
                      {new Date(a.timestamp).toLocaleTimeString('en-IN')}
                    </span>
                    <button className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 transition">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Primary Content Row (Spacious & Articulated) */}
                <div className="px-6 pb-6 pt-1 text-xs border-t border-slate-800/60 grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Calculation / Reasoning Summary */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Analysis & Calculation Breakdown
                    </span>
                    <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-2xl text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
                      {a.calculation_summary ||
                        (a.constraint_check_result
                          ? JSON.stringify(a.constraint_check_result, null, 2)
                          : 'Deterministic state transition execution.')}
                    </div>
                  </div>

                  {/* Execution / Verification Result */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Execution & Verification Result
                    </span>
                    <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-2xl text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                      {a.execution_result || a.verification_result || a.decision_summary || 'State verified without ERP mutation.'}
                    </div>
                  </div>
                </div>

                {/* Expanded Deep-Dive Section (Constraint Chips, Tool Arguments, Raw JSON) */}
                {isExpanded && (
                  <div className="p-6 bg-slate-950 border-t border-slate-800/80 space-y-5 animate-in slide-in-from-top-2 duration-200">
                    {/* Constraint Verification Checks Breakdown */}
                    {constraintChecks.length > 0 && (
                      <div className="space-y-2.5">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                          Constraint Compliance Evaluation ({constraintChecks.length} Checks)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {constraintChecks.map((chk: any, idx: number) => (
                            <div
                              key={idx}
                              className={`p-3.5 rounded-2xl border flex items-start space-x-3 text-xs ${
                                chk.passed
                                  ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                                  : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                              }`}
                            >
                              {chk.passed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <div className="font-bold text-xs uppercase tracking-wide">
                                  {chk.check.replace(/_/g, ' ')}
                                </div>
                                <div className="text-xs mt-1 text-slate-300 leading-relaxed">
                                  {chk.details || (chk.passed ? 'Constraint satisfied' : 'Check failed')}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tool Arguments */}
                    {toolParams && Object.keys(toolParams).length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                          Tool Input Arguments ({a.tool_called})
                        </span>
                        <pre className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-emerald-400 font-mono text-xs overflow-x-auto">
                          {JSON.stringify(toolParams, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Complete Event JSON */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Full Immutable Ledger Payload
                        </span>
                        <button
                          onClick={() => handleCopyJson(a)}
                          className="flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-800 transition"
                        >
                          {copiedId === a.id ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy JSON Payload</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-300 font-mono text-xs overflow-x-auto max-h-72 shadow-inner leading-relaxed">
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
