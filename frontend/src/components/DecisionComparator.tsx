import React from 'react';
import {
  Award,
  Clock,
  ShieldCheck,
  IndianRupee,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldAlert,
  Percent
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
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-16 text-center text-slate-400">
        <Sparkles className="w-10 h-10 text-indigo-400 mx-auto mb-3 opacity-60" />
        <h3 className="text-base font-bold text-white">No Decision Evaluations Recorded</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
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
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-slate-800/90 rounded-3xl p-8 shadow-2xl space-y-5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-3">
            <span className="text-xs uppercase tracking-wider font-extrabold px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              <span>Multi-Objective Pareto Decision Matrix</span>
            </span>
            <span className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
              Decision #{currentDecision.id}
            </span>
          </div>

          <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 self-start sm:self-auto">
            Optimal Score: {currentDecision.score} / 100
          </span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
            {currentDecision.recommendation_summary}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated ranking balancing production continuity, delivery lead time, incremental spend, and vendor compliance.
          </p>
        </div>

        <div className="bg-slate-950/90 p-5 rounded-2xl border border-slate-800/80 text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-sans shadow-inner">
          {currentDecision.reasoning}
        </div>
      </div>

      {/* 2. Evaluated Candidate Solutions Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Ranked Candidate Options ({options.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Sorted by Pareto Score (Descending)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {options.map((opt, idx) => {
            const isRecommended = idx === 0;
            const score = opt.score || 0;
            return (
              <div
                key={opt.option_id || idx}
                className={`rounded-3xl p-7 border space-y-5 shadow-2xl relative transition-all duration-200 flex flex-col justify-between ${
                  isRecommended
                    ? 'bg-gradient-to-b from-indigo-950/90 via-slate-900 to-slate-900 border-indigo-500 shadow-indigo-500/15 ring-2 ring-indigo-500/40'
                    : 'bg-slate-900/90 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                {isRecommended && (
                  <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg flex items-center space-x-1.5 border border-indigo-400/30">
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    <span>Recommended Strategy</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 inline-block">
                    {opt.option_id}
                  </span>
                  <h4 className="text-base font-black text-white pt-1">{opt.strategy}</h4>
                  <p className="text-xs text-indigo-300 font-bold">{opt.supplier_name || 'Vendor'}</p>
                </div>

                {/* Pareto Score Meter */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-black text-white font-mono">{score}</span>
                      <span className="text-xs text-slate-400 ml-1">/ 100</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      Pareto Score
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        score >= 85
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : score >= 70
                          ? 'bg-gradient-to-r from-indigo-500 to-blue-400'
                          : 'bg-gradient-to-r from-amber-500 to-rose-400'
                      }`}
                      style={{ width: `${Math.min(100, score)}%` }}
                    />
                  </div>
                </div>

                {/* Multi-Objective Breakdown Meters */}
                {opt.score_breakdown && (
                  <div className="space-y-3 pt-2 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                        <span>Production Continuity (35%)</span>
                        <span className="font-bold text-emerald-400">{opt.score_breakdown.continuity} / 35</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${(opt.score_breakdown.continuity / 35) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                        <span>Lead Time Speed (25%)</span>
                        <span className="font-bold text-indigo-400">{opt.score_breakdown.lead_time} / 25</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{ width: `${(opt.score_breakdown.lead_time / 25) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                        <span>Cost Efficiency (20%)</span>
                        <span className="font-bold text-amber-400">{opt.score_breakdown.cost} / 20</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: `${(opt.score_breakdown.cost / 20) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                        <span>Quality & ISO (20%)</span>
                        <span className="font-bold text-blue-400">{opt.score_breakdown.quality} / 20</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: `${(opt.score_breakdown.quality / 20) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Metrics in INR */}
                <div className="space-y-2.5 pt-4 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center space-x-1.5 text-slate-400">
                      <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                      <span>Total Procurement:</span>
                    </span>
                    <span className="font-bold text-white font-mono">
                      ₹{opt.total_cost?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center space-x-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Lead Time:</span>
                    </span>
                    <span className="font-bold text-white">{opt.lead_time_days} Days</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center space-x-1.5 text-slate-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Supplier Reliability:</span>
                    </span>
                    <span className="font-bold text-emerald-400">{opt.reliability_score}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Rejected Alternatives & Trade-Off Explanations */}
      {rejected.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-8 shadow-xl space-y-5 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2.5">
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>Rejected Alternatives & Trade-Off Justification ({rejected.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Explainable AI Audit Log</span>
          </div>

          <div className="space-y-3.5">
            {rejected.map((r, idx) => {
              const hasViolations = r.violations && r.violations.length > 0;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2.5 flex-wrap gap-1">
                      <span className="font-black text-white text-sm">{r.strategy}</span>
                      <span className="text-slate-400">({r.supplier_name})</span>
                      {hasViolations ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                          Constraint Violation
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                          Lower Pareto Score ({r.score}/100)
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {hasViolations
                        ? `Violations: ${r.violations?.join(', ')}`
                        : `Spend: ₹${r.total_cost?.toLocaleString('en-IN')} | Lead Time: ${r.lead_time_days} days | Score: ${r.score}`}
                    </p>
                  </div>

                  <span className="text-slate-500 font-mono text-xs self-start sm:self-center bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
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
