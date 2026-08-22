import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Clock, ShieldAlert, IndianRupee, FileCheck, Check, Info } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header & Filter Tabs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-black text-white flex items-center space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>Human-in-the-Loop Governance & Authorization</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review decisions exceeding ₹50,000 spend thresholds, critical risk constraints, or certification exceptions.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeFilter === 'PENDING'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Pending</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/30 text-amber-200">
              {pending.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('RESOLVED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeFilter === 'RESOLVED'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Resolved ({resolved.length})
          </button>

          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeFilter === 'ALL'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({approvals.length})
          </button>
        </div>
      </div>

      {/* Main List */}
      {displayList.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
          <h3 className="text-base font-bold text-white">No Pending Escalations</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            All current recovery decisions are within automated policy boundaries (spend ≤ ₹50,000). System operating autonomously.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {displayList.map((appr) => {
            const isPending = appr.status === 'PENDING';
            return (
              <div
                key={appr.id}
                className={`rounded-2xl p-6 border shadow-2xl space-y-5 transition-all ${
                  isPending
                    ? 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/60 ring-1 ring-amber-500/30'
                    : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div className="flex items-start space-x-3.5">
                    <div
                      className={`p-3 rounded-xl border shrink-0 ${
                        isPending
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                          : appr.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      <ShieldAlert className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <span
                          className={`text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full border ${
                            isPending
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : appr.status === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {appr.status === 'PENDING' ? 'AUTHORIZATION REQUIRED (> ₹50,000 SPEND)' : appr.status}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Disruption #{appr.disruption_id}</span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-white mt-1.5">{appr.title}</h3>
                      <p className="text-xs text-slate-300 mt-0.5">{appr.description}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <div className="text-xl font-black text-amber-300 font-mono">
                      ₹{appr.cost_impact?.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Incremental Spend
                    </span>
                  </div>
                </div>

                {/* Recommended Plan Details */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    Agent Recommended Autonomous Plan
                  </span>
                  <p className="text-xs font-bold text-white">{appr.recommended_action}</p>
                </div>

                {/* If Pending: Approver Notes & Decision Actions */}
                {isPending ? (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                        Approver Justification Notes (Stored in Audit Ledger)
                      </label>
                      <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Add authorization remarks (e.g. Approved emergency expedited freight to protect Tier-1 delivery deadline)..."
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 h-20 font-sans leading-relaxed"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                      <button
                        onClick={async () => {
                          setActionInProgressId(appr.id);
                          await onReject(appr.id, comments || 'Rejected by Manager - Seek Alternate Vendor');
                          setActionInProgressId(null);
                        }}
                        disabled={actionInProgressId === appr.id}
                        className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-xs transition disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>Reject Plan & Trigger Replanning</span>
                      </button>

                      <button
                        onClick={async () => {
                          setActionInProgressId(appr.id);
                          await onApprove(appr.id, comments || 'Authorized by Supply Chain Manager');
                          setActionInProgressId(null);
                        }}
                        disabled={actionInProgressId === appr.id}
                        className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-xl shadow-emerald-600/30 transition disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Authorize & Execute ERP Update</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs flex items-center justify-between text-slate-400">
                    <div>
                      <span className="font-bold text-slate-300">Manager Notes: </span>
                      <span>{appr.approver_comments || 'No remarks entered.'}</span>
                    </div>
                    <span className="text-[11px] font-mono">
                      {appr.timestamp ? new Date(appr.timestamp).toLocaleString() : ''}
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
