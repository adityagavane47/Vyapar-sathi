import React, { useState } from 'react';
import { Layers, AlertTriangle, CheckCircle2, XCircle, DollarSign, Clock, ShieldAlert } from 'lucide-react';
import { HumanApproval } from '../types';

interface ApprovalModalProps {
  approvals: HumanApproval[];
  onApprove: (id: number, comments: string) => void;
  onReject: (id: number, comments: string) => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({ approvals, onApprove, onReject }) => {
  const pending = approvals.filter((a) => a.status === 'PENDING');
  const [comments, setComments] = useState('');

  if (pending.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">Zero Pending Human Approvals</h3>
        <p className="text-xs text-slate-400 mt-1">
          All recovery decisions within configured policy limits execute autonomously. Escalation triggers only for spend &gt; $50,000 or high risk.
        </p>
      </div>
    );
  }

  const current = pending[0];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-900 border-2 border-amber-500/60 rounded-2xl p-6 shadow-2xl space-y-6">
        {/* Header Banner */}
        <div className="flex items-start justify-between border-b border-amber-500/30 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40 animate-pulse">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs uppercase font-black tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                HUMAN AUTHORIZATION REQUIRED (&gt; $50k Spend)
              </span>
              <h2 className="text-xl font-extrabold text-white mt-1">{current.title}</h2>
              <p className="text-xs text-slate-300">Escalated by Agent Orchestrator for Manager Approval</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black text-amber-300">${current.cost_impact?.toLocaleString()}</div>
            <span className="text-[11px] text-slate-400">Incremental Spend Impact</span>
          </div>
        </div>

        {/* Action & Risk Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Recommended Action:</span>
            <p className="text-sm font-bold text-white">{current.recommended_action}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Risk Assessment:</span>
            <p className="text-xs text-amber-300 font-semibold">{current.description}</p>
          </div>
        </div>

        {/* Approver Comments Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300">Approver Notes & Comments:</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add justification notes for audit log (e.g., Authorized emergency spend for Tier-1 customer order PRD-9003)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 h-20"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-2 border-t border-slate-800">
          <button
            onClick={() => onReject(current.id, comments || 'Rejected by manager')}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-sm transition"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject Plan & Replan</span>
          </button>
          <button
            onClick={() => onApprove(current.id, comments || 'Approved by supply chain manager')}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-600/30 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve & Execute ERP Update</span>
          </button>
        </div>
      </div>
    </div>
  );
};
