import React from 'react';
import { ShieldAlert, CheckCircle2, Clock, Package, AlertTriangle, ArrowUpRight, TrendingUp, IndianRupee, Sparkles, PlusCircle } from 'lucide-react';
import { DisruptionEvent, InventoryItem, Supplier, HumanApproval } from '../types';

interface OverviewProps {
  disruptions: DisruptionEvent[];
  inventory: InventoryItem[];
  suppliers: Supplier[];
  approvals: HumanApproval[];
  onSelectDisruption: (id: number) => void;
  onNavigateToTab: (tab: string) => void;
  onOpenCustomModal?: () => void;
}

export const OverviewDashboard: React.FC<OverviewProps> = ({
  disruptions,
  inventory,
  suppliers,
  approvals,
  onSelectDisruption,
  onNavigateToTab,
  onOpenCustomModal,
}) => {
  const activeDisruptions = disruptions.filter((d) => d.status !== 'RESOLVED');
  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');
  const lowStockItems = inventory.filter((i) => i.is_below_safety_stock);
  const avgSupplierReliability =
    suppliers.length > 0
      ? (suppliers.reduce((acc, s) => acc + s.reliability_score, 0) / suppliers.length).toFixed(1)
      : '90.0';

  return (
    <div className="space-y-6">
      {/* Top Banner for Active Disruption if Present */}
      {activeDisruptions.length > 0 ? (
        <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/70 border border-rose-800/50 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30 animate-pulse shrink-0">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-3 flex-wrap gap-1">
                  <span className="text-xs uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Active Disruption Detected ({activeDisruptions[0].severity})
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{activeDisruptions[0].event_code}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">{activeDisruptions[0].description}</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                  Agent State:{' '}
                  <span className="font-semibold text-amber-300 font-mono">{activeDisruptions[0].status}</span> — Autonomous
                  triage & recovery planning active.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 self-end md:self-center">
              <button
                onClick={() => {
                  onSelectDisruption(activeDisruptions[0].id);
                  onNavigateToTab('disruptions');
                }}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-xs shadow-lg shadow-rose-600/30 transition"
              >
                <span>Launch Controller</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-800/40 rounded-2xl p-5 shadow-xl backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Supply Chain Operating at Optimal Health</h3>
              <p className="text-xs text-slate-400">All inbound shipments and factory production schedules on track.</p>
            </div>
          </div>
          {onOpenCustomModal && (
            <button
              onClick={onOpenCustomModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Simulate Disruption</span>
            </button>
          )}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>On-Time Delivery</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">96.4%</div>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center">
            <span>+1.2% vs baseline</span>
          </p>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Disruptions</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{activeDisruptions.length}</div>
          <p className="text-[11px] text-rose-400 mt-1">
            {activeDisruptions.length > 0 ? 'Requires Mitigation' : 'All systems clear'}
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{pendingApprovals.length}</div>
          <p className="text-[11px] text-amber-400 mt-1">
            {pendingApprovals.length > 0 ? 'Human Manager Review Req.' : '0 Pending Escalations'}
          </p>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Supplier Index</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{avgSupplierReliability}%</div>
          <p className="text-[11px] text-indigo-300 mt-1">Across 5 Tier-1 Vendors</p>
        </div>

        {/* KPI 5 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Critical Shortages</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{lowStockItems.length}</div>
          <p className="text-[11px] text-amber-300 mt-1">Below Safety Threshold</p>
        </div>
      </div>

      {/* Main Grid: Inventory Twin & Supplier Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Stock Gauge Table */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Component Inventory & Safety Stock Coverage</h3>
              <p className="text-xs text-slate-400">Real-time stock levels across central distribution hubs</p>
            </div>
            <button
              onClick={() => onNavigateToTab('explorer')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              View Full Twin →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-slate-400 uppercase bg-slate-800/50 border-b border-slate-800 text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">Component</th>
                  <th className="py-3 px-3">Warehouse</th>
                  <th className="py-3 px-3">Stock Level</th>
                  <th className="py-3 px-3">Safety Buffer</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {inventory.map((item) => (
                  <tr key={item.inventory_id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-semibold text-white">
                      {item.component_name}{' '}
                      <span className="text-[10px] text-indigo-400 font-mono">({item.component_code})</span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{item.warehouse_name}</td>
                    <td className="py-3 px-3 font-bold text-white">
                      {item.quantity} <span className="text-slate-400 text-[10px]">units</span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{item.safety_stock_level} units</td>
                    <td className="py-3 px-3">
                      {item.is_below_safety_stock ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center w-fit space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>LOW STOCK</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          OPTIMAL
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Supplier Reliability Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-md">
          <div>
            <h3 className="text-base font-bold text-white">Supplier Health & Certifications</h3>
            <p className="text-xs text-slate-400">Reliability scores & compliance benchmarks</p>
          </div>
          <div className="space-y-3">
            {suppliers.map((s) => (
              <div key={s.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{s.name}</span>
                  <span className="font-mono text-emerald-400 font-bold">{s.reliability_score}% Rel.</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      s.reliability_score >= 90
                        ? 'bg-emerald-500'
                        : s.reliability_score >= 80
                        ? 'bg-indigo-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${s.reliability_score}%` }}
                  />
                </div>
                <div className="flex items-center space-x-1.5 mt-2">
                  {s.certifications?.map((c) => (
                    <span
                      key={c}
                      className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
