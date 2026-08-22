import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  IndianRupee,
  FileCheck,
  Check,
  Info,
  Layers,
  UserCheck
} from 'lucide-react';
import { HumanApproval } from '../types';

interface ApprovalModalProps {
  approvals: HumanApproval[];
  onApprove: (id: number, comments: string) => void;
  onReject: (id: number, comments: string) => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({ approvals, onApprove, onReject }) => {
  const [activeFilter, setActiveFilter] = useState<'PENDING' | 'RESOLVED' | 'ALL'>('PENDING');
  const [comments, setComments] = useState('');
  const [actionInProgressId, setActionInProgressId] = useState<number | null>(null);

  const pending = approvals.filter((a) => a.status === 'PENDING');
  const resolved = approvals.filter((a) => a.status !== 'PENDING');

  const displayList =
    activeFilter === 'PENDING' ? pending : activeFilter === 'RESOLVED' ? resolved : approvals;

  return (
    <div className="space-y-8">
      {/* 1. Header & Governance Scope */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Human-in-the-Loop Governance & Authorization</h2>
              <p className="text-xs text-slate-400">
                Mandatory escalation gate for procurement decisions exceeding ₹50,000 spend thresholds or critical operational risks.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveFilter('PENDING')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeFilter === 'PENDING'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Pending Review</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/30 text-amber-200 font-mono">
              {pending.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('RESOLVED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeFilter === 'RESOLVED'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Resolved ({resolved.length})
          </button>

          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeFilter === 'ALL'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Ledger ({approvals.length})
          </button>
        </div>
      </div>

      {/* 2. Escalation Records List */}
      {displayList.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-16 text-center text-slate-400">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
          <h3 className="text-base font-bold text-white">No Escalations in Current View</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            All active recovery actions comply with automated policy constraints (spend ≤ ₹50,000). System operating autonomously.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {displayList.map((appr) => {
            const isPending = appr.status === 'PENDING';
            return (
              <div
                key={appr.id}
                className={`rounded-3xl p-8 border shadow-2xl space-y-6 transition-all duration-200 ${
                  isPending
                    ? 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/60 ring-2 ring-amber-500/30'
                    : 'bg-slate-900/90 border-slate-800/90'
                }`}
              >
                {/* Header Information Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 border-b border-slate-800/80 pb-5">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-3.5 rounded-2xl border shrink-0 ${
                        isPending
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                          : appr.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      <ShieldAlert className="w-7 h-7" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2.5 flex-wrap gap-1">
                        <span
                          className={`text-[10px] uppercase font-black tracking-wider px-3 py-1 rounded-full border ${
                            isPending
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : appr.status === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {appr.status === 'PENDING' ? 'MANAGER REVIEW REQUIRED (> ₹50k SPEND)' : appr.status}
                        </span>
                        <span className="text-xs text-slate-400 font-mono bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
                          Disruption #{appr.disruption_id}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-white leading-snug pt-1">{appr.title}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">{appr.description}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                    <div className="text-2xl font-black text-amber-300 font-mono">
                      ₹{appr.cost_impact?.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Incremental Spend Impact
                    </span>
                  </div>
                </div>

                {/* Recommended Plan Details */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                    Agent Formulated Recovery Recommendation
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">{appr.recommended_action}</p>
                </div>

                {/* If Pending: Approver Notes & Decision Actions */}
                {isPending ? (
                  <div className="space-y-5 pt-2">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                        Manager Authorization Remarks & Audit Justification
                      </label>
                      <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Add justification notes for immutable compliance audit (e.g. Authorized emergency expedited procurement to safeguard Tier-1 customer production line)..."
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 h-24 font-sans leading-relaxed shadow-inner"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-2">
                      <button
                        onClick={async () => {
                          setActionInProgressId(appr.id);
                          await onReject(appr.id, comments || 'Rejected by Manager - Re-evaluate Alternate Suppliers');
                          setActionInProgressId(null);
                        }}
                        disabled={actionInProgressId === appr.id}
                        className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-xs transition disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>Reject Strategy & Trigger Re-planning</span>
                      </button>

                      <button
                        onClick={async () => {
                          setActionInProgressId(appr.id);
                          await onApprove(appr.id, comments || 'Authorized by Supply Chain Operations Manager');
                          setActionInProgressId(null);
                        }}
                        disabled={actionInProgressId === appr.id}
                        className="w-full sm:w-auto flex items-center justify-center space-x-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/30 transition disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Authorize & Execute Autonomous ERP Mutation</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 text-xs flex items-center justify-between text-slate-400">
                    <div>
                      <span className="font-bold text-slate-300">Manager Justification: </span>
                      <span>{appr.approver_comments || 'No remarks recorded.'}</span>
                    </div>
                    <span className="text-[11px] font-mono">
                      {appr.timestamp ? new Date(appr.timestamp).toLocaleString('en-IN') : ''}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
