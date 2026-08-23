import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ShieldAlert,
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
      <div className="glass-card-elevated p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-[#D97706] border border-amber-200">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#0F172A]">Human-in-the-Loop Governance & Authorization</h2>
              <p className="text-xs text-[#475569]">
                Mandatory escalation gate for procurement decisions exceeding ₹50,000 spend thresholds or critical operational risks.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveFilter('PENDING')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center space-x-2 ${
              activeFilter === 'PENDING'
                ? 'bg-white text-[#D97706] shadow-sm'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            <span>Pending Review</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#FEF3C7] text-[#D97706] font-mono font-bold">
              {pending.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('RESOLVED')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeFilter === 'RESOLVED'
                ? 'bg-white text-[#0F172A] shadow-sm'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            Resolved ({resolved.length})
          </button>

          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeFilter === 'ALL'
                ? 'bg-white text-[#0F172A] shadow-sm'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            All ({approvals.length})
          </button>
        </div>
      </div>

      {/* 2. Escalation Records List */}
      {displayList.length === 0 ? (
        <div className="glass-card p-16 text-center text-[#475569]">
          <CheckCircle2 className="w-12 h-12 text-[#059669] mx-auto mb-3 opacity-80" />
          <h3 className="text-base font-extrabold text-[#0F172A]">No Escalations in Current View</h3>
          <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
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
                className={`glass-card rounded-3xl p-8 space-y-6 transition-all duration-200 ${
                  isPending
                    ? 'border-2 border-[#F59E0B] shadow-md ring-1 ring-[#F59E0B]/30'
                    : 'border-slate-200'
                }`}
              >
                {/* Header Information Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 border-b border-slate-100 pb-5">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-3.5 rounded-2xl border shrink-0 ${
                        isPending
                          ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A] animate-pulse'
                          : appr.status === 'APPROVED'
                          ? 'bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]'
                          : 'bg-[#FEE2E2] text-[#EF4444] border-[#FECACA]'
                      }`}
                    >
                      <ShieldAlert className="w-7 h-7" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2.5 flex-wrap gap-1">
                        <span
                          className={`text-[10px] uppercase font-extrabold tracking-wider px-3 py-1 rounded-full border ${
                            isPending
                              ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
                              : appr.status === 'APPROVED'
                              ? 'bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]'
                              : 'bg-[#FEE2E2] text-[#EF4444] border-[#FECACA]'
                          }`}
                        >
                          {appr.status === 'PENDING' ? 'MANAGER REVIEW REQUIRED (> ₹50k SPEND)' : appr.status}
                        </span>
                        <span className="text-xs text-[#64748B] font-mono bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 font-bold">
                          Disruption #{appr.disruption_id}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-[#0F172A] leading-snug pt-1">{appr.title}</h3>
                      <p className="text-xs text-[#475569] leading-relaxed">{appr.description}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="text-2xl font-black text-[#D97706] font-mono">
                      ₹{appr.cost_impact?.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] uppercase font-extrabold text-[#64748B] tracking-wider">
                      Incremental Spend Impact
                    </span>
                  </div>
                </div>

                {/* Recommended Plan Details */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-extrabold text-[#6366F1] uppercase tracking-wider block">
                    Agent Formulated Recovery Recommendation
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-[#0F172A] leading-relaxed">{appr.recommended_action}</p>
                </div>

                {/* If Pending: Approver Notes & Decision Actions */}
                {isPending ? (
                  <div className="space-y-5 pt-2">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#334155] uppercase tracking-wider block">
                        Manager Authorization Remarks & Audit Justification
                      </label>
                      <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Add justification notes for immutable compliance audit (e.g. Authorized emergency expedited procurement to safeguard Tier-1 customer production line)..."
                        className="w-full bg-white border border-slate-300 rounded-2xl p-4 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#6366F1] h-24 font-sans leading-relaxed shadow-2xs"
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
                        className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-2xl bg-[#FEE2E2] hover:bg-[#FECACA] text-[#EF4444] border border-[#FECACA] font-extrabold text-xs transition disabled:opacity-50 hover:-translate-y-0.5"
                      >
                        <XCircle className="w-4 h-4 text-[#EF4444]" />
                        <span>Reject Strategy & Trigger Re-planning</span>
                      </button>

                      <button
                        onClick={async () => {
                          setActionInProgressId(appr.id);
                          await onApprove(appr.id, comments || 'Authorized by Supply Chain Operations Manager');
                          setActionInProgressId(null);
                        }}
                        disabled={actionInProgressId === appr.id}
                        className="w-full sm:w-auto flex items-center justify-center space-x-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#22D3EE] hover:brightness-110 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition disabled:opacity-50 hover:-translate-y-0.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Authorize & Execute Autonomous ERP Mutation</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between text-[#475569]">
                    <div>
                      <span className="font-bold text-[#0F172A]">Manager Justification: </span>
                      <span>{appr.approver_comments || 'No remarks recorded.'}</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#64748B]">
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
