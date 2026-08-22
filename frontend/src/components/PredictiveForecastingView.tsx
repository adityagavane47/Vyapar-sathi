import React from 'react';
import { Radar, CloudRain, Anchor, TrendingUp, AlertTriangle, ShieldCheck, Play, RefreshCw, Cpu, Zap } from 'lucide-react';
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
  const globalRisk = externalSignals?.global_logistics_risk || 'Stable';
  const weatherIndex = externalSignals?.weather_severity_index || 6.2;
  const portCongestion = externalSignals?.overall_port_congestion || 5.8;
  const freightIndex = externalSignals?.freight_rate_spike_index || 5.4;

  return (
    <div className="space-y-6">
      {/* Top Banner: Real-Time Logistics Signal Radar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl backdrop-blur-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/40 shadow-lg animate-pulse">
              <Radar className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ML Early-Warning Radar Active
                </span>
                <span className="text-xs text-slate-400 font-mono">Real-Time Risk Forecasting</span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1">Predictive Disruption Intelligence</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Scans machine learning risk models against weather radar, transit port congestion, and historical vendor features to detect failure risks <span className="text-indigo-300 font-bold">5 days before downtime occurs</span>.
              </p>
            </div>
          </div>

          <button
            onClick={onRunProactiveScan}
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-extrabold text-xs shadow-xl shadow-indigo-600/30 transition transform hover:scale-105"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Run Proactive ML Scan</span>
          </button>
        </div>

        {/* Global Signal Indices */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-indigo-500/20">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-indigo-500/20">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Global Risk Level</span>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-black text-amber-400 mt-1">{globalRisk}</div>
            <span className="text-[10px] text-slate-400">Live Forecast Index</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-indigo-500/20">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Weather Severity</span>
              <CloudRain className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-black text-blue-400 mt-1">{weatherIndex} <span className="text-xs text-slate-400 font-normal">/ 10</span></div>
            <span className="text-[10px] text-slate-400">Transit Lane Weather</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-indigo-500/20">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Port Congestion</span>
              <Anchor className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-xl font-black text-teal-400 mt-1">{portCongestion} <span className="text-xs text-slate-400 font-normal">/ 10</span></div>
            <span className="text-[10px] text-slate-400">Avg Vessel Wait Time</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-indigo-500/20">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Freight Rate Volatility</span>
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl font-black text-indigo-300 mt-1">{freightIndex} <span className="text-xs text-slate-400 font-normal">/ 10</span></div>
            <span className="text-[10px] text-slate-400">3PL Spot Market Rate</span>
          </div>
        </div>
      </div>

      {/* Proactive Scan Notification Result */}
      {proactiveScanResult && proactiveScanResult.proactive_disruptions_generated > 0 && (
        <div className="bg-amber-950/60 border-2 border-amber-500/80 rounded-2xl p-5 shadow-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 animate-bounce" />
            <div>
              <h4 className="text-sm font-bold text-white">
                Proactive Early Warning Generated ({proactiveScanResult.proactive_disruptions_generated} High-Risk Order)
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
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
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow transition"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Launch Proactive Controller</span>
          </button>
        </div>
      )}

      {/* Main Grid: ML Supplier Risk Heatmap & Active Port Hubs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ML Supplier Risk Heatmap */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <span>ML Supplier Risk Heatmap (Scikit-Learn Model)</span>
              </h3>
              <p className="text-xs text-slate-400">RandomForest model predictions combining vendor metrics & external feeds</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskPredictions.map((rp) => {
              const isHigh = rp.disruption_probability >= 60;
              const isMed = rp.disruption_probability >= 30 && rp.disruption_probability < 60;
              return (
                <div
                  key={rp.supplier_id}
                  className={`p-4 rounded-xl border space-y-3 transition-all ${
                    isHigh
                      ? 'bg-rose-950/30 border-rose-600/60 shadow-lg shadow-rose-600/10'
                      : isMed
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{rp.supplier_name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-black border ${
                        isHigh
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : isMed
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {rp.risk_level} Risk
                    </span>
                  </div>

                  {/* Disruption Probability Gauge */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Disruption Probability:</span>
                      <span className={`font-mono font-bold ${isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {rp.disruption_probability}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${rp.disruption_probability}%` }}
                      />
                    </div>
                  </div>

                  {/* Key Drivers */}
                  <div className="space-y-1 pt-1 border-t border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Top Risk Drivers:</span>
                    <div className="flex flex-wrap gap-1">
                      {rp.key_risk_drivers.map((drv, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
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
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Anchor className="w-5 h-5 text-teal-400" />
              <span>Transit Port Signals</span>
            </h3>
            <p className="text-xs text-slate-400">Container vessel wait times & weather conditions</p>
          </div>

          <div className="space-y-3">
            {externalSignals?.active_port_hubs?.map((hub) => (
              <div key={hub.port_code} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{hub.port_name}</span>
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      hub.congestion_index >= 7.0
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {hub.status}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Congestion: <span className="font-bold text-white">{hub.congestion_index}/10</span></span>
                  <span>Wait Time: <span className="font-bold text-amber-400">{hub.vessel_wait_time_days} days</span></span>
                </div>
                <div className="text-[11px] text-blue-300 font-mono">
                  <span>Weather: {hub.weather_condition}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
