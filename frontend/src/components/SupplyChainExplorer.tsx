import React, { useState } from 'react';
import {
  Package,
  Truck,
  Factory,
  Users,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Check,
  Building2,
  Plus,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Layers,
  SlidersHorizontal,
  Eye,
  FilePlus2
} from 'lucide-react';
import { InventoryItem, Supplier, PurchaseOrder, ProductionOrder } from '../types';

interface SupplyChainExplorerProps {
  inventory: InventoryItem[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  productionOrders: ProductionOrder[];
  initialInventory?: InventoryItem[];
  initialPurchaseOrders?: PurchaseOrder[];
  initialSuppliers?: Supplier[];
  onOpenAddSupplierModal?: () => void;
  onOpenCreatePoModal?: () => void;
}

export const SupplyChainExplorer: React.FC<SupplyChainExplorerProps> = ({
  inventory,
  suppliers,
  purchaseOrders,
  productionOrders,
  initialInventory = [],
  initialPurchaseOrders = [],
  initialSuppliers = [],
  onOpenAddSupplierModal,
  onOpenCreatePoModal,
}) => {
  const [subTab, setSubTab] = useState<'inventory' | 'suppliers' | 'pos' | 'production'>('inventory');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showChangedOnly, setShowChangedOnly] = useState<boolean>(false);

  const getSupplierName = (supplierId?: number) =>
    suppliers.find((s) => s.id === supplierId)?.name || 'Supplier';

  const getComponentName = (componentId?: number) =>
    inventory.find((i) => i.component_id === componentId)?.component_name || 'Component';

  // --- Dynamic Delta Calculations ---
  // Inventory Deltas
  const getInventoryDelta = (item: InventoryItem) => {
    const baseline = initialInventory.find((b) => b.inventory_id === item.inventory_id);
    if (!baseline) return null;
    const allocatedDiff = item.allocated_quantity - baseline.allocated_quantity;
    const qtyDiff = item.quantity - baseline.quantity;
    const isChanged = allocatedDiff !== 0 || qtyDiff !== 0 || item.is_below_safety_stock !== baseline.is_below_safety_stock;
    return { allocatedDiff, qtyDiff, isChanged, baseline };
  };

  // PO Deltas
  const getPoDelta = (po: PurchaseOrder) => {
    const baseline = initialPurchaseOrders.find((b) => b.id === po.id || b.po_number === po.po_number);
    const isNew = !baseline;
    const statusChanged = baseline ? baseline.status !== po.status : false;
    const isChanged = isNew || statusChanged;
    return { isNew, statusChanged, baseline, isChanged };
  };

  // Supplier Deltas
  const getSupplierDelta = (s: Supplier) => {
    const isNew = !initialSuppliers.some((b) => b.id === s.id || b.code === s.code);
    return { isNew, isChanged: isNew };
  };

  // Count total dynamic modifications
  const changedInventoryCount = inventory.filter((i) => getInventoryDelta(i)?.isChanged).length;
  const changedPosCount = purchaseOrders.filter((p) => getPoDelta(p)?.isChanged).length;
  const changedSuppliersCount = suppliers.filter((s) => getSupplierDelta(s)?.isChanged).length;
  const totalModifications = changedInventoryCount + changedPosCount + changedSuppliersCount;

  // Filtered lists
  const filteredInventory = inventory.filter((i) => {
    const matchesSearch =
      i.component_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.component_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (showChangedOnly) return Boolean(getInventoryDelta(i)?.isChanged);
    return true;
  });

  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contact_email.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (showChangedOnly) return Boolean(getSupplierDelta(s)?.isChanged);
    return true;
  });

  const filteredPos = purchaseOrders.filter((po) => {
    const matchesSearch =
      po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getComponentName(po.component_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getSupplierName(po.supplier_id).toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (showChangedOnly) return Boolean(getPoDelta(po)?.isChanged);
    return true;
  });

  const filteredProduction = productionOrders.filter(
    (p) =>
      p.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. Dynamic Twin Changes & Delta Telemetry Banner */}
      {totalModifications > 0 && (
        <div className="bg-slate-900/90 border border-indigo-500/40 rounded-3xl p-6 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-1">
                <span className="font-black text-sm text-white">
                  Real-Time Twin Modifications Detected ({totalModifications})
                </span>
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Live Delta Tracking
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Highlights show dynamic allocations, status updates, or new POs generated during disruption mitigation compared to baseline.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setShowChangedOnly(!showChangedOnly)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                showChangedOnly
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                  : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showChangedOnly ? 'Showing Changes Only' : 'Filter Changed Only'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Subnav Navigation Pills & Action Bar */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-xl">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSubTab('inventory')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'inventory'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Inventory ({inventory.length})</span>
            {changedInventoryCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-extrabold">
                {changedInventoryCount}Δ
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('suppliers')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'suppliers'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Tier-1 Suppliers ({suppliers.length})</span>
            {changedSuppliersCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-extrabold">
                +{changedSuppliersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('pos')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'pos'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Purchase Orders ({purchaseOrders.length})</span>
            {changedPosCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-extrabold">
                {changedPosCount}Δ
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('production')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'production'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Factory className="w-3.5 h-3.5" />
            <span>Production Orders ({productionOrders.length})</span>
          </button>
        </div>

        {/* Action Controls & Search */}
        <div className="flex items-center space-x-3">
          {subTab === 'suppliers' && onOpenAddSupplierModal && (
            <button
              onClick={onOpenAddSupplierModal}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-md shadow-indigo-600/30 transition shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Supplier</span>
            </button>
          )}

          {subTab === 'pos' && onOpenCreatePoModal && (
            <button
              onClick={onOpenCreatePoModal}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-md shadow-indigo-600/30 transition shrink-0"
            >
              <FilePlus2 className="w-3.5 h-3.5" />
              <span>+ Create PO</span>
            </button>
          )}

          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Twin records..."
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-60 shadow-inner"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2" />
          </div>
        </div>
      </div>

      {/* 3. Main Data Tables with Delta Indicators */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-7 shadow-2xl backdrop-blur-xl">
        {/* 1. Inventory View */}
        {subTab === 'inventory' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-slate-400 uppercase bg-slate-800/40 border-b border-slate-800 text-[10px] tracking-wider font-mono">
                <tr>
                  <th className="py-3.5 px-4">Component SKU & Name</th>
                  <th className="py-3.5 px-4">Warehouse Facility</th>
                  <th className="py-3.5 px-4">Physical Stock</th>
                  <th className="py-3.5 px-4">Allocated (Live Delta)</th>
                  <th className="py-3.5 px-4">Safety Buffer</th>
                  <th className="py-3.5 px-4">Inventory Health Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No inventory records found matching current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => {
                    const delta = getInventoryDelta(item);
                    return (
                      <tr
                        key={item.inventory_id}
                        className={`hover:bg-slate-800/30 transition ${
                          delta?.isChanged ? 'bg-indigo-950/20' : ''
                        }`}
                      >
                        <td className="py-4 px-4 font-semibold text-white">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm">{item.component_name}</span>
                            {delta?.isChanged && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                MODIFIED
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-indigo-400 font-mono">({item.component_code})</span>
                        </td>
                        <td className="py-4 px-4 text-slate-300">{item.warehouse_name}</td>
                        <td className="py-4 px-4 font-bold text-white font-mono">
                          {item.quantity} <span className="text-[10px] text-slate-400 font-normal">units</span>
                        </td>
                        <td className="py-4 px-4 font-mono">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white">{item.allocated_quantity} units</span>
                            {delta && delta.allocatedDiff > 0 && (
                              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center space-x-0.5">
                                <ArrowUp className="w-3 h-3" />
                                <span>+{delta.allocatedDiff}</span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-400 font-mono">{item.safety_stock_level} units</td>
                        <td className="py-4 px-4">
                          {item.is_below_safety_stock ? (
                            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center w-fit space-x-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>BELOW BUFFER</span>
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center w-fit space-x-1.5">
                              <Check className="w-3.5 h-3.5" />
                              <span>OPTIMAL</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Suppliers Directory */}
        {subTab === 'suppliers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Registered Tier-1 Supplier Catalog ({filteredSuppliers.length} Vendors)
              </span>
              {onOpenAddSupplierModal && (
                <button
                  onClick={onOpenAddSupplierModal}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Supplier</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSuppliers.map((s) => {
                const delta = getSupplierDelta(s);
                return (
                  <div
                    key={s.id}
                    className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 shadow-xl ${
                      delta.isNew
                        ? 'bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-900 border-indigo-500 shadow-indigo-500/15 ring-1 ring-indigo-500/40'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-base">{s.name}</span>
                            {delta.isNew && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                NEW
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{s.code}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-bold">
                          {s.reliability_score}% Rel.
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{s.contact_email}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Lead Time</span>
                        <p className="font-bold text-white mt-0.5">{s.lead_time_days} Days</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Weekly Output</span>
                        <p className="font-bold text-white mt-0.5">{s.max_capacity?.toLocaleString()} Units</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 pt-1 flex-wrap gap-1">
                      {s.certifications?.map((c) => (
                        <span
                          key={c}
                          className="text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Purchase Orders */}
        {subTab === 'pos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                ERP Purchase Order Ledger ({filteredPos.length} Active Orders)
              </span>
              {onOpenCreatePoModal && (
                <button
                  onClick={onOpenCreatePoModal}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Create Purchase Order</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-slate-400 uppercase bg-slate-800/40 border-b border-slate-800 text-[10px] tracking-wider font-mono">
                  <tr>
                    <th className="py-3.5 px-4">PO Code</th>
                    <th className="py-3.5 px-4">Component SKU & Supplier</th>
                    <th className="py-3.5 px-4">Order Quantity</th>
                    <th className="py-3.5 px-4">Total Amount (INR)</th>
                    <th className="py-3.5 px-4">Expected Delivery</th>
                    <th className="py-3.5 px-4">ERP Order Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredPos.map((po) => {
                    const delta = getPoDelta(po);
                    return (
                      <tr
                        key={po.id}
                        className={`hover:bg-slate-800/30 transition ${
                          delta.isChanged ? 'bg-indigo-950/20' : ''
                        }`}
                      >
                        <td className="py-4 px-4 font-mono font-bold text-indigo-400">
                          <div className="flex items-center space-x-2">
                            <span>{po.po_number}</span>
                            {delta.isNew && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                NEW (Added)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-white text-sm">{getComponentName(po.component_id)}</div>
                          <div className="text-xs text-slate-400">{getSupplierName(po.supplier_id)}</div>
                        </td>
                        <td className="py-4 px-4 text-white font-bold font-mono">{po.quantity?.toLocaleString()} units</td>
                        <td className="py-4 px-4 text-white font-bold font-mono">
                          ₹{po.total_amount?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-4 text-slate-400 font-mono">
                          {new Date(po.expected_delivery_date).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                po.status === 'Delayed'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                                  : po.status === 'Quality_Failed'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {po.status}
                            </span>
                            {delta.statusChanged && delta.baseline && (
                              <span className="text-[10px] text-rose-400 font-mono">
                                (was {delta.baseline.status})
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Production Orders */}
        {subTab === 'production' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-slate-400 uppercase bg-slate-800/40 border-b border-slate-800 text-[10px] tracking-wider font-mono">
                <tr>
                  <th className="py-3.5 px-4">Production Order</th>
                  <th className="py-3.5 px-4">Finished Product</th>
                  <th className="py-3.5 px-4">Customer Account</th>
                  <th className="py-3.5 px-4">Priority Class</th>
                  <th className="py-3.5 px-4">Volume</th>
                  <th className="py-3.5 px-4">Assembly Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredProduction.map((prd) => (
                  <tr key={prd.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-4 font-mono font-bold text-indigo-400">{prd.order_number}</td>
                    <td className="py-4 px-4 font-bold text-white text-sm">{prd.product_name}</td>
                    <td className="py-4 px-4 text-slate-300">{prd.customer_name}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {prd.customer_priority}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-white font-mono">{prd.quantity} units</td>
                    <td className="py-4 px-4 text-slate-400 font-mono">
                      {new Date(prd.due_date).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
