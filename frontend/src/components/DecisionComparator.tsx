import React from 'react';
import {
  Award,
  Clock,
  ShieldCheck,
  IndianRupee,
  XCircle,
  TrendingUp,
  Sparkles,
  Layers,
} from 'lucide-react';
import { DecisionRecord, CandidateOption } from '../types';

interface DecisionComparatorProps {
  decisions: DecisionRecord[];
  disruptionId?: number;
}

export const DecisionComparator: React.FC<DecisionComparatorProps> = ({ decisions, disruptionId }) => {
  const currentDecision = disruptionId
    ? decisions.find((d) => d.disruption_id === disruptionId) || decisions[0]
    : decisions[0];

  if (!currentDecision) {
    return (
      <div className="glass-card p-16 text-center text-[#475569]">
        <Sparkles className="w-10 h-10 text-[#6366F1] mx-auto mb-3 opacity-60" />
        <h3 className="text-base font-extrabold text-[#0F172A]">No Decision Evaluations Recorded</h3>
        <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
          Execute the autonomous agent on an active disruption to compute candidate procurement solutions and multi-objective Pareto trade-offs.
        </p>
      </div>
    );
  }

  const options: CandidateOption[] = currentDecision.options_evaluated || [];
  const rejected: CandidateOption[] = currentDecision.rejected_alternatives || [];

  return (
    <div className="space-y-8">
      {/* 1. Header Card with Optimization Rationale */}
      <div className="glass-card-elevated p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <span className="text-xs uppercase tracking-wider font-extrabold px-3.5 py-1 rounded-full bg-indigo-50 text-[#6366F1] border border-indigo-200 flex items-center space-x-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#6366F1]" />
              <span>Multi-Objective Pareto Decision Matrix</span>
            </span>
            <span className="text-xs text-[#475569] font-mono bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
              Decision #{currentDecision.id}
            </span>
          </div>

          <span className="text-xs font-mono text-[#059669] font-extrabold bg-[#D1FAE5] px-3.5 py-1 rounded-full border border-[#A7F3D0] self-start sm:self-auto shadow-2xs">
            Optimal Score: {currentDecision.score} / 100
          </span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight leading-snug">
            {currentDecision.recommendation_summary}
          </h2>
          <p className="text-xs text-[#475569] mt-1">
            Automated ranking balancing production continuity, delivery lead time, incremental spend, and vendor compliance.
          </p>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-[#334155] whitespace-pre-wrap leading-relaxed font-sans shadow-2xs">
          {currentDecision.reasoning}
        </div>
      </div>

      {/* 2. Evaluated Candidate Solutions Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Layers className="w-4 h-4 text-[#6366F1]" />
            </div>
            <span>Ranked Candidate Options ({options.length})</span>
          </h3>
          <span className="text-xs text-[#64748B]">Sorted by Pareto Score (Descending)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {options.map((opt, idx) => {
            const isRecommended = idx === 0;
            const score = opt.score || 0;
            return (
              <div
                key={opt.option_id || idx}
                className={`rounded-3xl p-7 border space-y-5 shadow-sm relative transition-all duration-200 flex flex-col justify-between hover:-translate-y-1 ${
                  isRecommended
                    ? 'bg-indigo-50/80 border-2 border-[#6366F1] shadow-lg ring-1 ring-[#6366F1]/30'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {isRecommended && (
                  <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-[#6366F1] to-[#22D3EE] text-white font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center space-x-1.5">
                    <Award className="w-3.5 h-3.5 text-white" />
                    <span>Recommended Strategy</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-[#64748B] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 inline-block">
                    {opt.option_id}
                  </span>
                  <h4 className="text-base font-black text-[#0F172A] pt-1">{opt.strategy}</h4>
                  <p className="text-xs text-[#6366F1] font-bold">{opt.supplier_name || 'Vendor'}</p>
                </div>

                {/* Pareto Score Meter */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-black text-[#0F172A] font-mono">{score}</span>
                      <span className="text-xs text-[#64748B] ml-1">/ 100</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-[#059669] uppercase tracking-wider">
                      Pareto Score
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        score >= 85
                          ? 'bg-gradient-to-r from-[#10B981] to-[#22D3EE]'
                          : score >= 70
                          ? 'bg-gradient-to-r from-[#6366F1] to-[#22D3EE]'
                          : 'bg-gradient-to-r from-[#F59E0B] to-[#EF4444]'
                      }`}
                      style={{ width: `${Math.min(100, score)}%` }}
                    />
                  </div>
                </div>

                {/* Multi-Objective Breakdown Meters */}
                {opt.score_breakdown && (
                  <div className="space-y-3 pt-2 text-xs">
                    <div>
                      <div className="flex justify-between text-[#475569] text-[11px] mb-1 font-medium">
                        <span>Production Continuity (35%)</span>
                        <span className="font-bold text-[#059669]">{opt.score_breakdown.continuity} / 35</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#10B981] h-full" style={{ width: `${(opt.score_breakdown.continuity / 35) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[#475569] text-[11px] mb-1 font-medium">
                        <span>Lead Time Speed (25%)</span>
                        <span className="font-bold text-[#6366F1]">{opt.score_breakdown.lead_time} / 25</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#6366F1] h-full" style={{ width: `${(opt.score_breakdown.lead_time / 25) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[#475569] text-[11px] mb-1 font-medium">
                        <span>Cost Efficiency (20%)</span>
                        <span className="font-bold text-[#D97706]">{opt.score_breakdown.cost} / 20</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#F59E0B] h-full" style={{ width: `${(opt.score_breakdown.cost / 20) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[#475569] text-[11px] mb-1 font-medium">
                        <span>Quality & ISO (20%)</span>
                        <span className="font-bold text-[#0891B2]">{opt.score_breakdown.quality} / 20</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#22D3EE] h-full" style={{ width: `${(opt.score_breakdown.quality / 20) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Metrics in INR */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-[#475569]">
                    <span className="flex items-center space-x-1.5 text-[#64748B]">
                      <IndianRupee className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>Total Procurement:</span>
                    </span>
                    <span className="font-extrabold text-[#0F172A] font-mono">
                      ₹{opt.total_cost?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#475569]">
                    <span className="flex items-center space-x-1.5 text-[#64748B]">
                      <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>Lead Time:</span>
                    </span>
                    <span className="font-extrabold text-[#0F172A]">{opt.lead_time_days} Days</span>
                  </div>

                  <div className="flex items-center justify-between text-[#475569]">
                    <span className="flex items-center space-x-1.5 text-[#64748B]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>Supplier Reliability:</span>
                    </span>
                    <span className="font-extrabold text-[#059669]">{opt.reliability_score}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Rejected Alternatives & Trade-Off Explanations */}
      {rejected.length > 0 && (
        <div className="glass-card-elevated p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-[#0F172A] flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
                <XCircle className="w-4 h-4 text-[#EF4444]" />
              </div>
              <span>Rejected Alternatives & Trade-Off Justification ({rejected.length})</span>
            </h3>
            <span className="text-xs text-[#64748B]">Explainable AI Audit Log</span>
          </div>

          <div className="space-y-3.5">
            {rejected.map((r, idx) => {
              const hasViolations = r.violations && r.violations.length > 0;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-2xs hover:-translate-y-0.5 transition-transform"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2.5 flex-wrap gap-1">
                      <span className="font-black text-[#0F172A] text-sm">{r.strategy}</span>
                      <span className="text-[#64748B]">({r.supplier_name})</span>
                      {hasViolations ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FEE2E2] text-[#EF4444] border border-[#FECACA] text-[10px] font-extrabold">
                          Constraint Violation
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] text-[10px] font-extrabold">
                          Lower Pareto Score ({r.score}/100)
                        </span>
                      )}
                    </div>
                    <p className="text-[#475569] text-xs leading-relaxed">
                      {hasViolations
                        ? `Violations: ${r.violations?.join(', ')}`
                        : `Spend: ₹${r.total_cost?.toLocaleString('en-IN')} | Lead Time: ${r.lead_time_days} days | Score: ${r.score}`}
                    </p>
                  </div>

                  <span className="text-[#64748B] font-mono text-xs self-start sm:self-center bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    {r.option_id}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
