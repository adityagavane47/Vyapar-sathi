import React from 'react';
import { Radar, CloudRain, Anchor, TrendingUp, AlertTriangle, ShieldCheck, Play, Cpu, Zap } from 'lucide-react';
import { ExternalSignals, SupplierRiskPrediction, ProactiveScanResult } from '../types';

interface PredictiveViewProps {
  externalSignals: ExternalSignals | null;
  riskPredictions: SupplierRiskPrediction[];
  onRunProactiveScan: () => void;
  onSelectDisruption: (id: number) => void;
  onNavigateToTab: (tab: string) => void;
  proactiveScanResult: ProactiveScanResult | null;
}

export const PredictiveForecastingView: React.FC<PredictiveViewProps> = ({
  externalSignals,
  riskPredictions,
  onRunProactiveScan,
  onSelectDisruption,
  onNavigateToTab,
  proactiveScanResult,
}) => {
  const globalRisk = externalSignals?.global_logistics_risk || 'Elevated';
  const weatherIndex = externalSignals?.weather_severity_index || 6.6;
  const portCongestion = externalSignals?.overall_port_congestion || 5.6;
  const freightIndex = externalSignals?.freight_rate_spike_index || 5.4;

  return (
    <div className="space-y-6">
      {/* Top Banner: See-Through Liquid Glass Hero */}
      <div className="glass-hero p-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start space-x-4">
            <div className="p-3.5 bg-gradient-to-tr from-[#6366F1] to-[#22D3EE] text-white rounded-2xl shadow-lg shadow-indigo-500/25 shrink-0">
              <Radar className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="text-xs uppercase font-mono font-extrabold tracking-wider px-3 py-1 rounded-full bg-indigo-500/15 text-[#6366F1] border border-indigo-300/60 shadow-2xs glow-live-radar backdrop-blur-md">
                  ML EARLY-WARNING RADAR ACTIVE
                </span>
                <span className="text-xs text-[#475569] font-mono font-semibold">Real-Time Risk Forecasting</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-2 tracking-tight">
                Predictive Disruption Intelligence
              </h2>
              <p className="text-xs sm:text-sm text-[#475569] mt-1.5 max-w-2xl leading-relaxed">
                Scans machine learning risk models against weather radar, transit port congestion, and historical vendor features to detect failure risks <span className="text-[#6366F1] font-extrabold">5 days before downtime occurs</span>.
              </p>
            </div>
          </div>

          <button
            onClick={onRunProactiveScan}
            className="flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#22D3EE] hover:brightness-110 text-white font-extrabold text-xs shadow-md shadow-indigo-600/25 transition transform hover:-translate-y-0.5 shrink-0"
          >
            <Zap className="w-4 h-4 text-white fill-white" />
            <span>Run Proactive ML Scan</span>
          </button>
        </div>

        {/* Global Signal Indices - Translucent Glass Metric Panels */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-7 pt-6 border-t border-white/60">
          <div className="glass-inner-item p-4">
            <div className="flex items-center justify-between text-xs text-[#475569]">
              <span className="font-bold">Global Risk Level</span>
              <ShieldCheck className="w-4 h-4 text-[#D97706]" />
            </div>
            <div className="text-2xl font-black text-[#D97706] mt-1.5 tracking-tight font-mono">{globalRisk}</div>
            <span className="text-[10px] text-[#64748B] font-medium">Live Forecast Index</span>
          </div>

          <div className="glass-inner-item p-4">
            <div className="flex items-center justify-between text-xs text-[#475569]">
              <span className="font-bold">Weather Severity</span>
              <CloudRain className="w-4 h-4 text-[#0891B2]" />
            </div>
            <div className="text-2xl font-black text-[#0891B2] mt-1.5 tracking-tight font-mono">
              {weatherIndex} <span className="text-xs text-[#64748B] font-normal">/ 10</span>
            </div>
            <span className="text-[10px] text-[#64748B] font-medium">Transit Lane Weather</span>
          </div>

          <div className="glass-inner-item p-4">
            <div className="flex items-center justify-between text-xs text-[#475569]">
              <span className="font-bold">Port Congestion</span>
              <Anchor className="w-4 h-4 text-[#059669]" />
            </div>
            <div className="text-2xl font-black text-[#059669] mt-1.5 tracking-tight font-mono">
              {portCongestion} <span className="text-xs text-[#64748B] font-normal">/ 10</span>
            </div>
            <span className="text-[10px] text-[#64748B] font-medium">Avg Vessel Wait Time</span>
          </div>

          <div className="glass-inner-item p-4">
            <div className="flex items-center justify-between text-xs text-[#475569]">
              <span className="font-bold">Freight Rate Volatility</span>
              <TrendingUp className="w-4 h-4 text-[#6366F1]" />
            </div>
            <div className="text-2xl font-black text-[#6366F1] mt-1.5 tracking-tight font-mono">
              {freightIndex} <span className="text-xs text-[#64748B] font-normal">/ 10</span>
            </div>
            <span className="text-[10px] text-[#64748B] font-medium">3PL Spot Market Rate</span>
          </div>
        </div>
      </div>

      {/* Proactive Scan Notification Result */}
      {proactiveScanResult && proactiveScanResult.proactive_disruptions_generated > 0 && (
        <div className="bg-amber-500/15 border-2 border-amber-300/80 backdrop-blur-md rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <AlertTriangle className="w-6 h-6 text-[#D97706] animate-bounce shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-[#0F172A]">
                Proactive Early Warning Generated ({proactiveScanResult.proactive_disruptions_generated} High-Risk Order)
              </h4>
              <p className="text-xs text-[#475569] mt-0.5">
                ML model predicted failure risk &gt; 65%. Ingested into Agent Orchestrator for proactive pre-ordering.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (proactiveScanResult.generated_events.length > 0) {
                onSelectDisruption(proactiveScanResult.generated_events[0].event_id);
                onNavigateToTab('disruptions');
              }
            }}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-xs shadow transition hover:-translate-y-0.5"
          >
            <Play className="w-4 h-4 fill-white text-white" />
            <span>Launch Proactive Controller</span>
          </button>
        </div>
      )}

      {/* Main Grid: ML Supplier Risk Heatmap & Active Port Hubs (See-Through Glass Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ML Supplier Risk Heatmap */}
        <div className="lg:col-span-2 glass-card-elevated p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/60">
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A] flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-[#6366F1] flex items-center justify-center border border-indigo-300/60">
                  <Cpu className="w-4 h-4" />
                </div>
                <span>ML Sourcing Risk Heatmap (Scikit-Learn Model)</span>
              </h3>
              <p className="text-xs text-[#475569] mt-0.5">
                RandomForest classifier predictions combining historical delivery variance & live transit signals
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskPredictions.map((rp) => {
              const isHigh = rp.disruption_probability >= 60;
              const isMed = rp.disruption_probability >= 30 && rp.disruption_probability < 60;

              return (
                <div
                  key={rp.supplier_id}
                  className={`p-4 rounded-xl border space-y-3 transition-all duration-200 hover:-translate-y-0.5 backdrop-blur-md ${
                    isHigh
                      ? 'bg-rose-500/10 border-rose-300/60 shadow-sm'
                      : isMed
                      ? 'bg-amber-500/10 border-amber-300/60 shadow-sm'
                      : 'bg-white/45 border-white/80 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0F172A] text-sm">{rp.supplier_name}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold border backdrop-blur-md ${
                        isHigh
                          ? 'bg-rose-500/15 text-[#EF4444] border-rose-300/80'
                          : isMed
                          ? 'bg-amber-500/15 text-[#D97706] border-amber-300/80'
                          : 'bg-emerald-500/15 text-[#059669] border-emerald-300/80'
                      }`}
                    >
                      {rp.risk_level} Risk
                    </span>
                  </div>

                  {/* Disruption Probability Gauge */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-[#475569]">Disruption Probability:</span>
                      <span
                        className={`font-mono font-extrabold ${
                          isHigh ? 'text-[#EF4444]' : isMed ? 'text-[#D97706]' : 'text-[#059669]'
                        }`}
                      >
                        {rp.disruption_probability}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/50 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isHigh ? 'bg-[#EF4444]' : isMed ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
                        }`}
                        style={{ width: `${rp.disruption_probability}%` }}
                      />
                    </div>
                  </div>

                  {/* Key Risk Drivers */}
                  <div className="space-y-1.5 pt-1.5 border-t border-white/60">
                    <span className="text-[10px] uppercase font-bold text-[#64748B]">Top Risk Drivers:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {rp.key_risk_drivers.map((drv, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/60 text-[#334155] border border-white/80 shadow-2xs backdrop-blur-sm"
                        >
                          {drv}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transit Port Hub Radar Signals */}
        <div className="glass-card-elevated p-6 space-y-4">
          <div className="pb-3 border-b border-white/60">
            <h3 className="text-base font-extrabold text-[#0F172A] flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-teal-500/15 text-teal-600 flex items-center justify-center border border-teal-300/60">
                <Anchor className="w-4 h-4" />
              </div>
              <span>Transit Port Signals</span>
            </h3>
            <p className="text-xs text-[#475569] mt-0.5">Container vessel wait times & marine conditions</p>
          </div>

          <div className="space-y-3">
            {externalSignals?.active_port_hubs?.map((hub) => {
              const isCongested = hub.congestion_index >= 7.0;
              return (
                <div
                  key={hub.port_code}
                  className="glass-inner-item p-3.5 space-y-2 hover:-translate-y-0.5 transition-transform"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0F172A] text-sm">{hub.port_name}</span>
                    <span
                      className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full border backdrop-blur-md ${
                        isCongested
                          ? 'bg-rose-500/15 text-[#EF4444] border-rose-300/80'
                          : 'bg-emerald-500/15 text-[#059669] border-emerald-300/80'
                      }`}
                    >
                      {hub.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-[#475569] font-medium">
                    <span>
                      Congestion: <span className="font-bold text-[#0F172A]">{hub.congestion_index}/10</span>
                    </span>
                    <span>
                      Wait: <span className="font-bold text-[#D97706]">{hub.vessel_wait_time_days} days</span>
                    </span>
                  </div>
                  <div className="text-[11px] text-teal-700 font-mono bg-teal-500/10 px-2 py-1 rounded border border-teal-300/50">
                    <span>Marine Weather: {hub.weather_condition}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
