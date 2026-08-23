import React, { useState } from 'react';
import {
  Shield,
  Search,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Info
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
      <div className="glass-card-elevated p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 text-[#6366F1]">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#0F172A] flex items-center space-x-2.5">
                  <span>Immutable Decision & Constraint Audit Trail</span>
                  <span className="text-xs font-mono px-3 py-0.5 rounded-full bg-indigo-50 text-[#6366F1] border border-indigo-200 font-bold">
                    {audits.length} Records
                  </span>
                </h3>
                <p className="text-xs text-[#475569] mt-0.5">
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
              className="bg-white border border-slate-300 rounded-2xl pl-10 pr-4 py-2 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#6366F1] w-full sm:w-80 shadow-2xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#6366F1] to-[#22D3EE] text-white shadow-md shadow-indigo-600/25'
                    : 'bg-slate-100 text-[#475569] hover:text-[#0F172A] hover:bg-slate-200'
                }`}
              >
                <span>{st}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-white text-[#64748B]'
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
          <div className="glass-card p-16 text-center text-[#475569] text-xs">
            <Info className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-60" />
            <p className="font-bold text-[#0F172A] text-base">No Audit Records Matching Filter</p>
            <p className="text-xs text-[#64748B] mt-1">Try selecting 'ALL' or executing an agent run cycle.</p>
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
                className={`glass-card rounded-3xl transition-all duration-200 overflow-hidden shadow-sm ${
                  isExpanded
                    ? 'border-2 border-[#6366F1] ring-1 ring-[#6366F1]/30 shadow-md'
                    : 'hover:border-slate-300'
                }`}
              >
                {/* Summary Header Row (Clickable) */}
                <div
                  onClick={() => toggleRow(a.id)}
                  className="p-5 sm:p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition select-none"
                >
                  <div className="flex items-center space-x-3.5 flex-wrap gap-2">
                    <span className="font-mono text-xs text-[#6366F1] font-extrabold bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
                      {a.event_id}
                    </span>

                    <span className="px-3 py-1 rounded-xl bg-slate-100 text-[#0F172A] border border-slate-200 font-extrabold text-xs uppercase tracking-wide">
                      {a.agent_state}
                    </span>

                    {a.tool_called && (
                      <span className="font-mono text-[#059669] font-extrabold text-xs bg-[#D1FAE5] px-2.5 py-0.5 rounded-lg border border-[#A7F3D0]">
                        {a.tool_called}()
                      </span>
                    )}

                    {isFailed && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#FEE2E2] text-[#EF4444] border border-[#FECACA] text-[10px] font-extrabold flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>CONSTRAINT VIOLATION</span>
                      </span>
                    )}
                  </div>

                  {/* Summary Snippet & Expand Action */}
                  <div className="flex items-center space-x-4 text-xs">
                    <span className="text-[#64748B] font-mono text-xs font-medium">
                      {new Date(a.timestamp).toLocaleTimeString('en-IN')}
                    </span>
                    <button className="p-2 rounded-xl text-[#475569] hover:text-[#0F172A] bg-slate-100 transition">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Primary Content Row */}
                <div className="px-6 pb-6 pt-1 text-xs border-t border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Calculation / Reasoning Summary */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                      Analysis & Calculation Breakdown
                    </span>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[#334155] font-sans leading-relaxed whitespace-pre-wrap">
                      {a.calculation_summary ||
                        (a.constraint_check_result
                          ? JSON.stringify(a.constraint_check_result, null, 2)
                          : 'Deterministic state transition execution.')}
                    </div>
                  </div>

                  {/* Execution / Verification Result */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                      Execution & Verification Result
                    </span>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[#334155] font-sans leading-relaxed whitespace-pre-wrap">
                      {a.execution_result || a.verification_result || a.decision_summary || 'State verified without ERP mutation.'}
                    </div>
                  </div>
                </div>

                {/* Expanded Deep-Dive Section */}
                {isExpanded && (
                  <div className="p-6 bg-slate-50/80 border-t border-slate-200 space-y-5 animate-in slide-in-from-top-2 duration-200">
                    {/* Constraint Verification Checks Breakdown */}
                    {constraintChecks.length > 0 && (
                      <div className="space-y-2.5">
                        <span className="text-xs font-bold text-[#6366F1] uppercase tracking-wider block">
                          Constraint Compliance Evaluation ({constraintChecks.length} Checks)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {constraintChecks.map((chk: any, idx: number) => (
                            <div
                              key={idx}
                              className={`p-3.5 rounded-2xl border flex items-start space-x-3 text-xs ${
                                chk.passed
                                  ? 'bg-[#D1FAE5]/60 border-[#A7F3D0] text-[#059669]'
                                  : 'bg-[#FEE2E2]/60 border-[#FECACA] text-[#EF4444]'
                              }`}
                            >
                              {chk.passed ? (
                                <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <div className="font-extrabold text-xs uppercase tracking-wide">
                                  {chk.check.replace(/_/g, ' ')}
                                </div>
                                <div className="text-xs mt-1 text-[#334155] leading-relaxed font-sans">
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
                        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                          Tool Input Arguments ({a.tool_called})
                        </span>
                        <pre className="p-4 bg-white border border-slate-200 rounded-2xl text-[#059669] font-mono text-xs overflow-x-auto">
                          {JSON.stringify(toolParams, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Complete Event JSON */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          Full Immutable Ledger Payload
                        </span>
                        <button
                          onClick={() => handleCopyJson(a)}
                          className="flex items-center space-x-1.5 text-xs text-[#6366F1] hover:text-[#4F46E5] bg-white px-3.5 py-1.5 rounded-xl border border-slate-300 transition font-bold"
                        >
                          {copiedId === a.id ? (
                            <>
                              <Check className="w-4 h-4 text-[#059669]" />
                              <span className="text-[#059669]">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy JSON Payload</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-4 bg-white border border-slate-200 rounded-2xl text-[#334155] font-mono text-xs overflow-x-auto max-h-72 shadow-2xs leading-relaxed">
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
