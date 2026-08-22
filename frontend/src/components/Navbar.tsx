import React from 'react';
import { Activity, ShieldAlert, Cpu, RefreshCw, Layers, PlusCircle, CheckCircle2, Sliders } from 'lucide-react';

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
    <header className="bg-slate-900/95 border-b border-slate-800 text-white sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand / Logo */}
          <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  Vyapar Saathi
                </span>
                <span className="text-[9px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Autonomous AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Supply Chain Operational Controller</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-1 overflow-x-auto">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-inner'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
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

          {/* Global Quick Action Buttons */}
          <div className="flex items-center space-x-2.5 shrink-0">
            {onOpenCustomModal && (
              <button
                onClick={onOpenCustomModal}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition"
                title="Create and inject a custom disruption"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">+ Custom Disruption</span>
              </button>
            )}

            <button
              onClick={onResetSimulation}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 shadow-sm transition"
              title="Reset Simulation Sandbox & Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Twin</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden space-x-1 overflow-x-auto py-2 border-t border-slate-800/80">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{t.label}</span>
                {t.badge !== undefined && t.badge > 0 && (
                  <span className="text-[10px] px-1 rounded-full bg-rose-500 text-white">
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
