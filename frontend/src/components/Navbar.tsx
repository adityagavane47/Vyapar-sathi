import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Cpu, RefreshCw, Layers, PlusCircle, Radar, History, Box, HelpCircle } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingApprovalsCount: number;
  activeDisruptionsCount: number;
  onResetSimulation: () => void;
  onOpenCustomModal?: () => void;
  theme?: string;
  onToggleTheme?: () => void;
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
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'predictive', label: 'Predictive Radar', icon: Radar },
    { id: 'disruptions', label: 'Disruptions', icon: ShieldAlert, badge: activeDisruptionsCount, alertType: 'danger' as const },
    { id: 'agent', label: 'Agent Brain', icon: Cpu },
    { id: 'approvals', label: 'Approvals', icon: Layers, badge: pendingApprovalsCount, alertType: 'warning' as const },
    { id: 'explorer', label: 'Twin Explorer', icon: Box },
    { id: 'audit', label: 'Audit Log', icon: History },
    { id: 'sandbox', label: 'Sandbox', icon: RefreshCw },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/50 backdrop-blur-xl border-b border-white/80 shadow-[0_4px_30px_rgba(0,0,0,0.03)] text-[#0F172A] w-full">
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 xl:gap-4">
          {/* Left Column: Brand Identity */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer shrink-0 group"
            onClick={() => setActiveTab('overview')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#22D3EE] flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-base sm:text-lg tracking-tight text-[#0F172A] font-sans">
                  Vyapar Saathi
                </span>
                <span className="text-[8px] uppercase font-mono font-extrabold tracking-wider px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-[#059669] border border-emerald-500/30 glow-autonomous-agent shrink-0">
                  AGENT
                </span>
              </div>
              <p className="hidden xl:block text-[9.5px] text-[#64748B] font-medium truncate max-w-[180px]">
                ERP Twin Controller
              </p>
            </div>
          </div>

          {/* Center Column: Perfectly Centered Navigation Tab Switcher (Fits All Screens) */}
          <div className="hidden lg:flex items-center justify-center">
            <nav className="flex space-x-0.5 xl:space-x-1 items-center p-1 bg-slate-200/40 rounded-2xl border border-white/80 backdrop-blur-md shadow-inner">
              {tabs.map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;
                const hasAlert = t.badge !== undefined && t.badge > 0;

                // Subtle alert tab styling
                let idleClass = 'text-[#475569] hover:text-[#0F172A] hover:bg-white/60';
                if (!isActive && hasAlert) {
                  if (t.alertType === 'danger') {
                    idleClass = 'bg-rose-500/10 text-rose-700 border border-rose-300/40 hover:bg-rose-500/18 shadow-2xs';
                  } else if (t.alertType === 'warning') {
                    idleClass = 'bg-amber-500/10 text-amber-700 border border-amber-300/40 hover:bg-amber-500/18 shadow-2xs';
                  }
                }

                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 2xl:px-3 2xl:py-2 rounded-xl text-xs font-extrabold transition-all duration-200 transform ${
                      isActive
                        ? 'bg-gradient-to-r from-[#6366F1] to-[#22D3EE] text-white shadow-[0_4px_16px_rgba(99,102,241,0.35)] scale-[1.02]'
                        : `${idleClass} hover:-translate-y-0.5`
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive
                          ? 'text-white'
                          : hasAlert && t.alertType === 'danger'
                          ? 'text-rose-600'
                          : hasAlert && t.alertType === 'warning'
                          ? 'text-amber-600'
                          : 'text-[#64748B]'
                      }`}
                    />
                    <span className="whitespace-nowrap">{t.label}</span>
                    {hasAlert && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                          isActive
                            ? 'bg-white/25 text-white border border-white/40'
                            : t.alertType === 'danger'
                            ? 'bg-rose-500/15 text-rose-600 border border-rose-300/60'
                            : 'bg-amber-500/15 text-amber-700 border border-amber-300/60'
                        }`}
                      >
                        {t.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Column: Telemetry & Actions */}
          <div className="flex items-center justify-end space-x-2 shrink-0">
            {/* Live Clock Telemetry */}
            <div className="hidden 2xl:flex flex-col text-right mr-1">
              <span className="text-[10.5px] font-mono text-[#0F172A] font-extrabold">{timeStr}</span>
              <span className="text-[8.5px] text-[#64748B] uppercase tracking-widest font-mono font-bold">IST (UTC+5:30)</span>
            </div>

            {onOpenCustomModal && (
              <button
                onClick={onOpenCustomModal}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#6366F1] to-[#22D3EE] hover:brightness-110 text-white shadow-md shadow-indigo-600/25 transition duration-200 hover:-translate-y-0.5"
                title="Create and inject a custom disruption"
              >
                <PlusCircle className="w-3.5 h-3.5 text-white shrink-0" />
                <span className="hidden sm:inline">Inject</span>
              </button>
            )}

            <button
              onClick={onResetSimulation}
              className="flex items-center space-x-1 px-2.5 py-2 rounded-xl text-xs font-extrabold bg-white/60 hover:bg-white/90 text-[#475569] hover:text-[#0F172A] border border-white/80 shadow-sm transition duration-200 hover:-translate-y-0.5 backdrop-blur-md"
              title="Reset Simulation Sandbox & Data"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Scroll Navigation Bar */}
        <div className="flex lg:hidden space-x-1 overflow-x-auto py-2 border-t border-white/60 scrollbar-none">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            const hasAlert = t.badge !== undefined && t.badge > 0;

            let tabletIdle = 'text-[#475569] hover:text-[#0F172A] hover:bg-white/50';
            if (!isActive && hasAlert) {
              tabletIdle = t.alertType === 'danger' ? 'bg-rose-500/10 text-rose-700' : 'bg-amber-500/10 text-amber-700';
            }

            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-gradient-to-r from-[#6366F1] to-[#22D3EE] text-white shadow'
                    : tabletIdle
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
                {hasAlert && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-rose-500/20 text-rose-700'
                    }`}
                  >
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
