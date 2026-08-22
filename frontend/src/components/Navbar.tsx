import React from 'react';
import { Activity, ShieldAlert, Cpu, RefreshCw, Layers } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingApprovalsCount: number;
  activeDisruptionsCount: number;
  onResetSimulation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pendingApprovalsCount,
  activeDisruptionsCount,
  onResetSimulation,
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
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Vyapar Saathi
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Autonomous AI
                </span>
              </div>
              <p className="text-xs text-slate-400">Supply Chain Operational Controller</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 overflow-x-auto">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-inner'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{t.label}</span>
                  {t.badge !== undefined && t.badge > 0 && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full font-bold text-white shadow ${
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

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onResetSimulation}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Reset Simulation Sandbox & Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Twin</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
