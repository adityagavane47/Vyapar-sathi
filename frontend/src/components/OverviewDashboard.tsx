import React from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  Package,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  IndianRupee,
  Sparkles,
  PlusCircle,
  Truck,
  Factory,
  Globe,
  Building2,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
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
  const activeDisruptions = disruptions.filter((d) => d.status !== 'RESOLVED' && d.status !== 'COMPLETE');
  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');
  const lowStockItems = inventory.filter((i) => i.is_below_safety_stock);
  const avgSupplierReliability =
    suppliers.length > 0
      ? (suppliers.reduce((acc, s) => acc + s.reliability_score, 0) / suppliers.length).toFixed(1)
      : '90.0';

  return (
    <div className="space-y-8">
      {/* 1. Executive Disruption Alert Banner or Optimal Health Hero */}
      {activeDisruptions.length > 0 ? (
        <div className="bg-gradient-to-r from-rose-950/90 via-slate-900 to-amber-950/70 border-2 border-rose-600/50 rounded-3xl p-7 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start space-x-5">
              <div className="p-4 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/40 animate-pulse shrink-0 shadow-lg shadow-rose-500/20">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center space-x-3 flex-wrap gap-2">
                  <span className="text-xs uppercase tracking-wider font-black px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Active Disruption Incident ({activeDisruptions[0].severity})
                  </span>
                  <span className="text-xs text-slate-400 font-mono bg-slate-950/80 px-2.5 py-0.5 rounded-lg border border-slate-800">
                    {activeDisruptions[0].event_code}
                  </span>
                  <span className="text-xs text-amber-400 font-mono">
                    Agent State: <strong className="font-bold">{activeDisruptions[0].status}</strong>
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                  {activeDisruptions[0].description}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
                  Autonomous triage pipeline has engaged. Multi-objective Pareto decision engine is generating alternative procurement RFQs and constraint validation.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 self-end lg:self-center shrink-0">
              <button
                onClick={() => {
                  onSelectDisruption(activeDisruptions[0].id);
                  onNavigateToTab('disruptions');
                }}
                className="flex items-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 hover:from-rose-500 hover:to-rose-400 text-white font-black text-xs sm:text-sm shadow-xl shadow-rose-600/30 hover:shadow-rose-600/50 transition-all duration-200"
              >
                <span>Launch Disruption Controller</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-indigo-950/50 border border-emerald-500/30 rounded-3xl p-7 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-white">Supply Chain Operational Twin: Optimal</h3>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  HEALTH 100%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Zero active operational bottlenecks. Production buffers, PO schedules, and freight lanes are fully synchronized.
              </p>
            </div>
          </div>

          {onOpenCustomModal && (
            <button
              onClick={onOpenCustomModal}
              className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Simulate Disruption Event</span>
            </button>
          )}
        </div>
      )}

      {/* 2. Spacious 5-Column KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* KPI 1 */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-xl backdrop-blur-md hover:border-slate-700 transition duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>On-Time Delivery</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-3 font-mono">96.4%</div>
          <p className="text-xs text-emerald-400 mt-1.5 font-semibold flex items-center space-x-1">
            <span>+1.2%</span>
            <span className="text-slate-500 font-normal">vs SLA baseline</span>
          </p>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-xl backdrop-blur-md hover:border-slate-700 transition duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Active Disruptions</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-3 font-mono">{activeDisruptions.length}</div>
          <p className="text-xs text-rose-400 mt-1.5 font-semibold">
            {activeDisruptions.length > 0 ? 'Autonomous Mitigation Active' : 'All systems clear'}
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-xl backdrop-blur-md hover:border-slate-700 transition duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Pending Approvals</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-3 font-mono">{pendingApprovals.length}</div>
          <p className="text-xs text-amber-400 mt-1.5 font-semibold">
            {pendingApprovals.length > 0 ? 'Spend > ₹50k Escalate' : '0 Escalated Actions'}
          </p>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-xl backdrop-blur-md hover:border-slate-700 transition duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Supplier Index</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-3 font-mono">{avgSupplierReliability}%</div>
          <p className="text-xs text-indigo-300 mt-1.5 font-semibold">Across 5 Tier-1 Vendors</p>
        </div>

        {/* KPI 5 */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-xl backdrop-blur-md hover:border-slate-700 transition duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Safety Stock Breaches</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-3 font-mono">{lowStockItems.length}</div>
          <p className="text-xs text-amber-400 mt-1.5 font-semibold">
            {lowStockItems.length > 0 ? 'Requires Replenishment' : 'Buffers in Safe Zone'}
          </p>
        </div>
      </div>

      {/* 3. Interactive Supply Chain Network Flow Graphic */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-7 shadow-xl backdrop-blur-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center space-x-2.5">
              <Globe className="w-5 h-5 text-indigo-400" />
              <span>End-to-End Operational Pipeline & Logistics Architecture</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time telemetry and component handoffs across global sourcing, transit corridors, warehouses, and assembly hubs.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-bold self-start sm:self-auto">
            Live Pipeline Sync
          </span>
        </div>

        {/* 5-Stage Network Nodes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
          {/* Node 1 */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2.5 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Origin Phase</span>
              <Building2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="font-bold text-white text-sm">Tier-1 Suppliers</div>
            <p className="text-[11px] text-slate-400">5 Global Vendors (TechComponents, Apex, ElectroParts)</p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Status</span>
              <span className="text-emerald-400 font-bold">Active SLA</span>
            </div>
          </div>

          {/* Node 2 */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2.5 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Logistics Lane</span>
              <Truck className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="font-bold text-white text-sm">Inbound Transit</div>
            <p className="text-[11px] text-slate-400">LogiCorp Freight Corridors & Port Clearance</p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Avg Lead</span>
              <span className="text-white font-mono font-bold">4.2 Days</span>
            </div>
          </div>

          {/* Node 3 */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2.5 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Central Distribution</span>
              <Package className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="font-bold text-white text-sm">Bengaluru Hub</div>
            <p className="text-[11px] text-slate-400">Safety Buffer Allocation & Inbound QA Inspection</p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Capacity</span>
              <span className="text-indigo-300 font-mono font-bold">15,000 Units</span>
            </div>
          </div>

          {/* Node 4 */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2.5 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Manufacturing</span>
              <Factory className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="font-bold text-white text-sm">Pune Assembly Plant</div>
            <p className="text-[11px] text-slate-400">High-Tech Medical & Industrial Hardware SMT Lines</p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Continuity</span>
              <span className="text-emerald-400 font-bold">100% Uptime</span>
            </div>
          </div>

          {/* Node 5 */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2.5 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Fulfillment</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-bold text-white text-sm">Tier-1 Customers</div>
            <p className="text-[11px] text-slate-400">Healthcare Systems Ltd, National Power Corp</p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Satisfaction</span>
              <span className="text-emerald-400 font-mono font-bold">99.2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Main Grid: Inventory Twin & Supplier Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inventory Stock Gauge Table */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/90 rounded-3xl p-7 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">Component Inventory & Buffer Coverage</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time stock levels, allocations, and safety thresholds</p>
            </div>
            <button
              onClick={() => onNavigateToTab('explorer')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1"
            >
              <span>Explore Digital Twin</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-slate-400 uppercase bg-slate-800/50 border-b border-slate-800 text-[10px] tracking-wider font-mono">
                <tr>
                  <th className="py-3.5 px-4">Component Code & Name</th>
                  <th className="py-3.5 px-4">Facility</th>
                  <th className="py-3.5 px-4">Stock Level</th>
                  <th className="py-3.5 px-4">Safety Buffer</th>
                  <th className="py-3.5 px-4">Health Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {inventory.map((item) => (
                  <tr key={item.inventory_id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-4 font-semibold text-white">
                      <div className="font-bold">{item.component_name}</div>
                      <span className="text-[10px] text-indigo-400 font-mono">({item.component_code})</span>
                    </td>
                    <td className="py-4 px-4 text-slate-300">{item.warehouse_name}</td>
                    <td className="py-4 px-4 font-bold text-white font-mono">
                      {item.quantity} <span className="text-slate-400 text-[10px] font-normal">units</span>
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-mono">{item.safety_stock_level} units</td>
                    <td className="py-4 px-4">
                      {item.is_below_safety_stock ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center w-fit space-x-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>LOW STOCK</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center w-fit space-x-1.5">
                          <Check className="w-3.5 h-3.5" />
                          <span>OPTIMAL</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Supplier Reliability & Compliance Card */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-7 shadow-xl space-y-5 backdrop-blur-xl">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">Supplier Health & Certifications</h3>
            <p className="text-xs text-slate-400 mt-0.5">Reliability score ratings & ISO compliance</p>
          </div>

          <div className="space-y-3.5">
            {suppliers.map((s) => (
              <div key={s.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{s.name}</span>
                  <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {s.reliability_score}% Rel.
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      s.reliability_score >= 90
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : s.reliability_score >= 80
                        ? 'bg-gradient-to-r from-indigo-500 to-blue-400'
                        : 'bg-gradient-to-r from-amber-500 to-rose-400'
                    }`}
                    style={{ width: `${s.reliability_score}%` }}
                  />
                </div>

                <div className="flex items-center space-x-1.5 pt-1">
                  {s.certifications?.map((c) => (
                    <span
                      key={c}
                      className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
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
