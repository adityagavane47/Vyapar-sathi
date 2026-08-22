import React from 'react';
import { Award, Clock, ShieldCheck, IndianRupee, AlertTriangle, XCircle, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
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
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-60" />
        <p className="font-semibold text-white">No decision evaluations recorded yet</p>
        <p className="text-xs text-slate-500 mt-1">Run the autonomous agent on an active disruption to compute candidate solutions.</p>
      </div>
    );
  }

  const options: CandidateOption[] = currentDecision.options_evaluated || [];
  const rejected: CandidateOption[] = currentDecision.rejected_alternatives || [];

  return (
    <div className="space-y-6">
      {/* Header card with Explainability Rationale */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            <span>Multi-Objective Pareto Decision Matrix</span>
          </span>
          <span className="text-xs text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            Decision #{currentDecision.id}
          </span>
        </div>

        <h2 className="text-lg md:text-xl font-black text-white tracking-tight">
          {currentDecision.recommendation_summary}
        </h2>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
          {currentDecision.reasoning}
        </div>
      </div>

      {/* Evaluated Options Cards Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
          <span>Ranked Candidate Solutions ({options.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {options.map((opt, idx) => {
            const isRecommended = idx === 0;
            const score = opt.score || 0;
            return (
              <div
                key={opt.option_id || idx}
                className={`rounded-2xl p-6 border space-y-5 shadow-xl relative transition-all duration-200 ${
                  isRecommended
                    ? 'bg-gradient-to-b from-indigo-950/80 via-slate-900 to-slate-900 border-indigo-500/80 ring-2 ring-indigo-500/40 shadow-indigo-500/15'
                    : 'bg-slate-900/90 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                {isRecommended && (
                  <div className="absolute -top-3 right-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-lg flex items-center space-x-1.5 border border-indigo-400/30">
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    <span>Best Pareto Trade-Off</span>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {opt.option_id}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1.5">{opt.strategy}</h4>
                  <p className="text-xs text-indigo-300 font-semibold">{opt.supplier_name || 'Vendor'}</p>
                </div>

                {/* Pareto Score Gauge */}
                <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800/80">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-black text-white">{score}</span>
                      <span className="text-xs text-slate-400 ml-1">/ 100</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                      Overall Score
                    </span>
                  </div>

                  {/* Progress Meter Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
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
                  <div className="space-y-2.5 pt-1 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                        <span>Production Continuity (35%)</span>
                        <span className="font-bold text-emerald-400">{opt.score_breakdown.continuity} / 35</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${(opt.score_breakdown.continuity / 35) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                        <span>Lead Time Speed (25%)</span>
                        <span className="font-bold text-indigo-400">{opt.score_breakdown.lead_time} / 25</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{ width: `${(opt.score_breakdown.lead_time / 25) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                        <span>Total Cost Efficiency (20%)</span>
                        <span className="font-bold text-amber-400">{opt.score_breakdown.cost} / 20</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: `${(opt.score_breakdown.cost / 20) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                        <span>Quality & Compliance (20%)</span>
                        <span className="font-bold text-blue-400">{opt.score_breakdown.quality} / 20</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: `${(opt.score_breakdown.quality / 20) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Cost & Lead Time Stats (in INR ₹) */}
                <div className="space-y-2 pt-3 text-xs border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center space-x-1.5 text-slate-400">
                      <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                      <span>Total Procurement Cost:</span>
                    </span>
                    <span className="font-bold text-white font-mono">
                      ₹{opt.total_cost?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center space-x-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Delivery Lead Time:</span>
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

      {/* Rejected Alternatives Section */}
      {rejected.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>Rejected Alternatives & Trade-Off Explanations ({rejected.length})</span>
            </h3>
          </div>

          <div className="space-y-3">
            {rejected.map((r, idx) => {
              const hasViolations = r.violations && r.violations.length > 0;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{r.strategy}</span>
                      <span className="text-slate-400">({r.supplier_name})</span>
                      {hasViolations ? (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                          Constraint Violation
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                          Lower Pareto Score ({r.score}/100)
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      {hasViolations
                        ? `Violations: ${r.violations?.join(', ')}`
                        : `Cost: ₹${r.total_cost?.toLocaleString('en-IN')} | Lead Time: ${r.lead_time_days} days`}
                    </p>
                  </div>

                  <span className="text-slate-500 font-mono text-[11px] self-start sm:self-center">
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
