import React from 'react';
import { Layers, CheckCircle2, XCircle, Award, DollarSign, Clock, ShieldCheck } from 'lucide-react';
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
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        <p>No decision evaluations recorded yet. Run the agent to generate multi-objective candidate solutions.</p>
      </div>
    );
  }

  const options: CandidateOption[] = currentDecision.options_evaluated || [];
  const rejected: CandidateOption[] = currentDecision.rejected_alternatives || [];

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Multi-Objective Optimization Matrix
          </span>
          <span className="text-xs text-slate-400 font-mono">Decision ID: #{currentDecision.id}</span>
        </div>
        <h2 className="text-xl font-extrabold text-white">{currentDecision.recommendation_summary}</h2>
        <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          {currentDecision.reasoning}
        </p>
      </div>

      {/* Options Comparison Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {options.map((opt, idx) => {
          const isRecommended = idx === 0;
          const score = opt.score || 0;
          return (
            <div
              key={opt.option_id || idx}
              className={`rounded-2xl p-6 border space-y-4 shadow-xl relative transition-all ${
                isRecommended
                  ? 'bg-gradient-to-b from-indigo-950/90 via-slate-900 to-slate-900 border-indigo-500 shadow-indigo-500/10 ring-2 ring-indigo-500/50'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              {isRecommended && (
                <div className="absolute -top-3 right-4 bg-indigo-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-lg flex items-center space-x-1">
                  <Award className="w-3 h-3" />
                  <span>Recommended Option</span>
                </div>
              )}

              <div>
                <h4 className="text-base font-bold text-white">{opt.strategy}</h4>
                <p className="text-xs text-slate-400 font-semibold">{opt.supplier_name || 'Vendor'}</p>
              </div>

              {/* Total Score Gauge */}
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-white">{score}</span>
                <span className="text-xs text-slate-400">/ 100 Pareto Score</span>
              </div>

              {/* Score Breakdown Bar */}
              {opt.score_breakdown && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Production Continuity:</span>
                    <span className="font-bold text-emerald-400">{opt.score_breakdown.continuity} / 35</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Lead Time Speed:</span>
                    <span className="font-bold text-indigo-400">{opt.score_breakdown.lead_time} / 25</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Total Cost Efficiency:</span>
                    <span className="font-bold text-amber-400">{opt.score_breakdown.cost} / 20</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Quality & Certifications:</span>
                    <span className="font-bold text-blue-400">{opt.score_breakdown.quality} / 20</span>
                  </div>
                </div>
              )}

              {/* Details List */}
              <div className="space-y-2 pt-2 text-xs border-t border-slate-800/80">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center space-x-1.5 text-slate-400">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Total Cost:</span>
                  </span>
                  <span className="font-bold text-white">${opt.total_cost?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center space-x-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Lead Time:</span>
                  </span>
                  <span className="font-bold text-white">{opt.lead_time_days} Days</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center space-x-1.5 text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Reliability Index:</span>
                  </span>
                  <span className="font-bold text-emerald-400">{opt.reliability_score}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
