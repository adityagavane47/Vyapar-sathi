import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Cpu, RefreshCw, Layers, PlusCircle, Sparkles, Wifi, Sliders } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingApprovalsCount: number;
  activeDisruptionsCount: number;
  onResetSimulation: () => void;
  onOpenCustomModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pendingApprovalsCount,
  activeDisruptionsCount,
  onResetSimulation,
  onOpenCustomModal,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Executive Overview', icon: Activity },
    { id: 'disruptions', label: 'Disruption Center', icon: ShieldAlert, badge: activeDisruptionsCount },
    { id: 'agent', label: 'Agent Brain & State', icon: Cpu },
    { id: 'approvals', label: 'Human Approvals', icon: Layers, badge: pendingApprovalsCount, badgeColor: 'bg-amber-500' },
    { id: 'explorer', label: 'Supply Chain Twin', icon: Layers },
    { id: 'audit', label: 'Audit & Explainability', icon: Activity },
    { id: 'sandbox', label: 'Scenario Sandbox', icon: RefreshCw },
  ];

  return (
    <header className="bg-slate-900/95 border-b border-slate-800/90 text-white sticky top-0 z-40 backdrop-blur-xl shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-6">
          {/* Brand Identity */}
          <div
            className="flex items-center space-x-3.5 cursor-pointer shrink-0 group"
            onClick={() => setActiveTab('overview')}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent font-sans">
                  Vyapar Saathi
                </span>
                <span className="text-[9px] uppercase font-mono font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  <span>AUTONOMOUS AGENT</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Supply Chain Operational Controller & ERP Twin</p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden lg:flex space-x-1.5 items-center p-1 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{t.label}</span>
                  {t.badge !== undefined && t.badge > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold text-white shadow ${
                        t.badgeColor || 'bg-rose-500'
                      }`}
                    >
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right System Telemetry & Quick Action Buttons */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Live Clock Telemetry */}
            <div className="hidden xl:flex flex-col text-right">
              <span className="text-[11px] font-mono text-slate-300 font-bold">{timeStr}</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">IST (UTC+5:30)</span>
            </div>

            {onOpenCustomModal && (
              <button
                onClick={onOpenCustomModal}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition duration-200"
                title="Create and inject a custom disruption"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Inject Disruption</span>
              </button>
            )}

            <button
              onClick={onResetSimulation}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 shadow-md transition duration-200"
              title="Reset Simulation Sandbox & Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Twin</span>
            </button>
          </div>
        </div>

        {/* Medium / Tablet Navigation Bar */}
        <div className="flex lg:hidden space-x-1 overflow-x-auto py-2.5 border-t border-slate-800/80 scrollbar-none">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
                {t.badge !== undefined && t.badge > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold">
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
