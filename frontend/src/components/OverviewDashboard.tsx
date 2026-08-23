import React from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  Package,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  PlusCircle,
  Truck,
  Factory,
  Globe,
  Building2,
  ChevronRight,
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
      {/* 1. Subtle Executive Disruption Alert Banner (Translucent Liquid Glass) */}
      {activeDisruptions.length > 0 ? (
        <div className="glass-hero p-8 relative overflow-hidden border border-rose-200/70 shadow-[0_12px_36px_rgba(244,63,94,0.06)] bg-gradient-to-r from-rose-500/8 via-white/40 to-indigo-500/5">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start space-x-5">
              <div className="p-3.5 bg-rose-500/10 text-[#EF4444] rounded-2xl border border-rose-300/40 shrink-0 shadow-2xs backdrop-blur-md">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center space-x-3 flex-wrap gap-2">
                  <span className="text-xs uppercase tracking-wider font-extrabold px-3 py-0.5 rounded-full bg-rose-500/10 text-[#EF4444] border border-rose-300/40 backdrop-blur-md">
                    Active Disruption ({activeDisruptions[0].severity})
                  </span>
                  <span className="text-xs text-[#6366F1] font-mono bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-300/40 font-bold backdrop-blur-md">
                    {activeDisruptions[0].event_code}
                  </span>
                  <span className="text-xs text-[#D97706] font-mono bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-300/40 font-bold backdrop-blur-md">
                    Agent State: {activeDisruptions[0].status}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] leading-snug">
                  {activeDisruptions[0].description}
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] max-w-4xl leading-relaxed">
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
                className="flex items-center space-x-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-rose-500/20 transition-all duration-200 hover:-translate-y-0.5"
              >
                <span>Launch Disruption Controller</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-hero p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-emerald-300/50 shadow-[0_12px_36px_rgba(16,185,129,0.06)] bg-gradient-to-r from-emerald-500/8 via-white/40 to-cyan-500/5">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-[#059669] border border-emerald-300/40 shadow-2xs backdrop-blur-md">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-[#0F172A]">Supply Chain Operational Twin: Optimal</h3>
                <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-[#059669] border border-emerald-300/40 backdrop-blur-md">
                  HEALTH 100%
                </span>
              </div>
              <p className="text-xs text-[#475569] mt-1">
                Zero active operational bottlenecks. Production buffers, PO schedules, and freight lanes are fully synchronized.
              </p>
            </div>
          </div>

          {onOpenCustomModal && (
            <button
              onClick={onOpenCustomModal}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#22D3EE] hover:brightness-110 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition hover:-translate-y-0.5 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Simulate Disruption Event</span>
            </button>
          )}
        </div>
      )}

      {/* 2. 5-Column KPI Metric Cards (See-Through Glass) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* KPI 1 */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between text-[#475569] text-xs font-extrabold uppercase tracking-wider">
            <span>On-Time Delivery</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-[#059669] border border-emerald-300/60">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#0F172A] mt-3 font-mono">96.4%</div>
          <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-extrabold bg-emerald-500/15 text-[#059669] border border-emerald-300/50">
            <span>+1.2% vs SLA</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between text-[#475569] text-xs font-extrabold uppercase tracking-wider">
            <span>Active Disruptions</span>
            <div className={`p-2 rounded-xl border ${activeDisruptions.length > 0 ? 'bg-rose-500/15 text-[#EF4444] border-rose-300/60' : 'bg-emerald-500/15 text-[#059669] border-emerald-300/60'}`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#0F172A] mt-3 font-mono">{activeDisruptions.length}</div>
          <div
            className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-extrabold border ${
              activeDisruptions.length > 0 ? 'bg-rose-500/15 text-[#EF4444] border-rose-300/50' : 'bg-emerald-500/15 text-[#059669] border-emerald-300/50'
            }`}
          >
            <span>{activeDisruptions.length > 0 ? 'Mitigation Active' : 'All Clear'}</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between text-[#475569] text-xs font-extrabold uppercase tracking-wider">
            <span>Pending Approvals</span>
            <div className={`p-2 rounded-xl border ${pendingApprovals.length > 0 ? 'bg-amber-500/15 text-[#D97706] border-amber-300/60' : 'bg-emerald-500/15 text-[#059669] border-emerald-300/60'}`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#0F172A] mt-3 font-mono">{pendingApprovals.length}</div>
          <div
            className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-extrabold border ${
              pendingApprovals.length > 0 ? 'bg-amber-500/15 text-[#D97706] border-amber-300/50' : 'bg-emerald-500/15 text-[#059669] border-emerald-300/50'
            }`}
          >
            <span>{pendingApprovals.length > 0 ? 'Spend > ₹50k' : '0 Escalated'}</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between text-[#475569] text-xs font-extrabold uppercase tracking-wider">
            <span>Supplier Index</span>
            <div className="p-2 rounded-xl bg-cyan-500/15 text-[#0891B2] border border-cyan-300/60">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#0F172A] mt-3 font-mono">{avgSupplierReliability}%</div>
          <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-extrabold bg-cyan-500/15 text-[#0891B2] border border-cyan-300/50">
            <span>Across 5 Tier-1</span>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between text-[#475569] text-xs font-extrabold uppercase tracking-wider">
            <span>Safety Stock Breaches</span>
            <div className={`p-2 rounded-xl border ${lowStockItems.length > 0 ? 'bg-amber-500/15 text-[#D97706] border-amber-300/60' : 'bg-emerald-500/15 text-[#059669] border-emerald-300/60'}`}>
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#0F172A] mt-3 font-mono">{lowStockItems.length}</div>
          <div
            className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-extrabold border ${
              lowStockItems.length > 0 ? 'bg-amber-500/15 text-[#D97706] border-amber-300/50' : 'bg-emerald-500/15 text-[#059669] border-emerald-300/50'
            }`}
          >
            <span>{lowStockItems.length > 0 ? 'Replenish Required' : 'Buffers Safe'}</span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Supply Chain Network Flow Graphic (See-Through Glass) */}
      <div className="glass-card-elevated p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/60 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#0F172A] flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-[#6366F1] border border-indigo-300/60 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <span>End-to-End Operational Pipeline & Logistics Architecture</span>
            </h3>
            <p className="text-xs text-[#475569] mt-0.5">
              Real-time telemetry and component handoffs across global sourcing, transit corridors, warehouses, and assembly hubs.
            </p>
          </div>
          <span className="text-xs font-mono text-[#059669] bg-emerald-500/15 border border-emerald-300/70 px-3 py-1 rounded-full font-extrabold self-start sm:self-auto backdrop-blur-md">
            Live Pipeline Sync
          </span>
        </div>

        {/* 5-Stage Network Nodes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
          {/* Node 1 */}
          <div className="glass-inner-item p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold text-[#64748B] tracking-wider">Origin Phase</span>
              <Building2 className="w-4 h-4 text-[#6366F1]" />
            </div>
            <div className="font-extrabold text-[#0F172A] text-sm">Tier-1 Suppliers</div>
            <p className="text-[11px] text-[#475569]">5 Global Vendors (TechComponents, Apex, ElectroParts)</p>
            <div className="pt-2 border-t border-white/60 flex items-center justify-between text-[11px]">
              <span className="text-[#64748B]">Status</span>
              <span className="text-[#059669] font-extrabold">Active SLA</span>
            </div>
          </div>

          {/* Node 2 */}
          <div className="glass-inner-item p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold text-[#64748B] tracking-wider">Logistics Lane</span>
              <Truck className="w-4 h-4 text-[#0891B2]" />
            </div>
            <div className="font-extrabold text-[#0F172A] text-sm">Inbound Transit</div>
            <p className="text-[11px] text-[#475569]">LogiCorp Freight Corridors & Port Clearance</p>
            <div className="pt-2 border-t border-white/60 flex items-center justify-between text-[11px]">
              <span className="text-[#64748B]">Avg Lead</span>
              <span className="text-[#0F172A] font-mono font-extrabold">4.2 Days</span>
            </div>
          </div>

          {/* Node 3 */}
          <div className="glass-inner-item p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold text-[#64748B] tracking-wider">Central Distribution</span>
              <Package className="w-4 h-4 text-[#6366F1]" />
            </div>
            <div className="font-extrabold text-[#0F172A] text-sm">Bengaluru Hub</div>
            <p className="text-[11px] text-[#475569]">Safety Buffer Allocation & Inbound QA Inspection</p>
            <div className="pt-2 border-t border-white/60 flex items-center justify-between text-[11px]">
              <span className="text-[#64748B]">Capacity</span>
              <span className="text-[#6366F1] font-mono font-extrabold">15,000 Units</span>
            </div>
          </div>

          {/* Node 4 */}
          <div className="glass-inner-item p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold text-[#64748B] tracking-wider">Manufacturing</span>
              <Factory className="w-4 h-4 text-[#6366F1]" />
            </div>
            <div className="font-extrabold text-[#0F172A] text-sm">Pune Assembly Plant</div>
            <p className="text-[11px] text-[#475569]">High-Tech Medical & Industrial Hardware SMT Lines</p>
            <div className="pt-2 border-t border-white/60 flex items-center justify-between text-[11px]">
              <span className="text-[#64748B]">Continuity</span>
              <span className="text-[#059669] font-extrabold">100% Uptime</span>
            </div>
          </div>

          {/* Node 5 */}
          <div className="glass-inner-item p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold text-[#64748B] tracking-wider">Fulfillment</span>
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
            </div>
            <div className="font-extrabold text-[#0F172A] text-sm">Tier-1 Customers</div>
            <p className="text-[11px] text-[#475569]">Healthcare Systems Ltd, National Power Corp</p>
            <div className="pt-2 border-t border-white/60 flex items-center justify-between text-[11px]">
              <span className="text-[#64748B]">Satisfaction</span>
              <span className="text-[#059669] font-mono font-extrabold">99.2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Main Grid: Inventory Twin & Supplier Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inventory Stock Gauge Table */}
        <div className="lg:col-span-2 glass-card-elevated p-7">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/60">
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#0F172A]">Component Inventory & Buffer Coverage</h3>
              <p className="text-xs text-[#475569] mt-0.5">Real-time stock levels, allocations, and safety thresholds</p>
            </div>
            <button
              onClick={() => onNavigateToTab('explorer')}
              className="text-xs text-[#6366F1] hover:text-[#4F46E5] font-extrabold flex items-center space-x-1"
            >
              <span>Explore Twin</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#475569]">
              <thead className="text-[#64748B] uppercase bg-white/40 border-b border-white/70 text-[10px] tracking-wider font-mono">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Component Code & Name</th>
                  <th className="py-3.5 px-4 font-bold">Facility</th>
                  <th className="py-3.5 px-4 font-bold">Stock Level</th>
                  <th className="py-3.5 px-4 font-bold">Safety Buffer</th>
                  <th className="py-3.5 px-4 font-bold">Health Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40 font-sans">
                {inventory.map((item) => (
                  <tr key={item.inventory_id} className="hover:bg-white/50 transition">
                    <td className="py-4 px-4 font-bold text-[#0F172A]">
                      <div>{item.component_name}</div>
                      <span className="text-[10px] text-[#6366F1] font-mono font-bold">({item.component_code})</span>
                    </td>
                    <td className="py-4 px-4 text-[#475569] font-medium">{item.warehouse_name}</td>
                    <td className="py-4 px-4 font-extrabold text-[#0F172A] font-mono">
                      {item.quantity} <span className="text-[#64748B] text-[10px] font-normal">units</span>
                    </td>
                    <td className="py-4 px-4 text-[#475569] font-mono font-medium">{item.safety_stock_level} units</td>
                    <td className="py-4 px-4">
                      {item.is_below_safety_stock ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-[#D97706] border border-amber-300/80 flex items-center w-fit space-x-1.5 backdrop-blur-md">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>LOW STOCK</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-[#059669] border border-emerald-300/80 flex items-center w-fit space-x-1.5 backdrop-blur-md">
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
        <div className="glass-card-elevated p-7 space-y-5">
          <div className="pb-3 border-b border-white/60">
            <h3 className="text-base sm:text-lg font-black text-[#0F172A]">Supplier Health & Certifications</h3>
            <p className="text-xs text-[#475569] mt-0.5">Reliability score ratings & ISO compliance</p>
          </div>

          <div className="space-y-3.5">
            {suppliers.map((s) => (
              <div key={s.id} className="glass-inner-item p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-[#0F172A] text-sm">{s.name}</span>
                  <span className="font-mono text-[#059669] font-extrabold bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-300/80 backdrop-blur-md">
                    {s.reliability_score}% Rel.
                  </span>
                </div>

                <div className="w-full bg-slate-200/50 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      s.reliability_score >= 90
                        ? 'bg-gradient-to-r from-[#10B981] to-[#22D3EE]'
                        : s.reliability_score >= 80
                        ? 'bg-gradient-to-r from-[#6366F1] to-[#22D3EE]'
                        : 'bg-gradient-to-r from-[#F59E0B] to-[#EF4444]'
                    }`}
                    style={{ width: `${s.reliability_score}%` }}
                  />
                </div>

                <div className="flex items-center space-x-1.5 pt-1">
                  {s.certifications?.map((c) => (
                    <span
                      key={c}
                      className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/15 text-[#6366F1] border border-indigo-300/60 backdrop-blur-md"
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
