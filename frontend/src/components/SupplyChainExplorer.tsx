import React, { useState } from 'react';
import {
  Package,
  Truck,
  Factory,
  Users,
  AlertTriangle,
  Search,
  Check,
  Plus,
  ArrowUp,
  Sparkles,
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

  // Dynamic Delta Calculations
  const getInventoryDelta = (item: InventoryItem) => {
    const baseline = initialInventory.find((b) => b.inventory_id === item.inventory_id);
    if (!baseline) return null;
    const allocatedDiff = item.allocated_quantity - baseline.allocated_quantity;
    const qtyDiff = item.quantity - baseline.quantity;
    const isChanged = allocatedDiff !== 0 || qtyDiff !== 0 || item.is_below_safety_stock !== baseline.is_below_safety_stock;
    return { allocatedDiff, qtyDiff, isChanged, baseline };
  };

  const getPoDelta = (po: PurchaseOrder) => {
    const baseline = initialPurchaseOrders.find((b) => b.id === po.id || b.po_number === po.po_number);
    const isNew = !baseline;
    const statusChanged = baseline ? baseline.status !== po.status : false;
    const isChanged = isNew || statusChanged;
    return { isNew, statusChanged, baseline, isChanged };
  };

  const getSupplierDelta = (s: Supplier) => {
    const isNew = !initialSuppliers.some((b) => b.id === s.id || b.code === s.code);
    return { isNew, isChanged: isNew };
  };

  const changedInventoryCount = inventory.filter((i) => getInventoryDelta(i)?.isChanged).length;
  const changedPosCount = purchaseOrders.filter((p) => getPoDelta(p)?.isChanged).length;
  const changedSuppliersCount = suppliers.filter((s) => getSupplierDelta(s)?.isChanged).length;
  const totalModifications = changedInventoryCount + changedPosCount + changedSuppliersCount;

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
        <div className="glass-card-elevated p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden border-2 border-indigo-200">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-indigo-50 text-[#6366F1] border border-indigo-200 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-1">
                <span className="font-extrabold text-sm text-[#0F172A]">
                  Real-Time Twin Modifications Detected ({totalModifications})
                </span>
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 text-[#6366F1] font-bold border border-indigo-200">
                  Live Delta Tracking
                </span>
              </div>
              <p className="text-xs text-[#475569] mt-0.5">
                Highlights show dynamic allocations, status updates, or new POs generated during disruption mitigation compared to baseline.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setShowChangedOnly(!showChangedOnly)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                showChangedOnly
                  ? 'bg-[#6366F1] text-white border-[#6366F1] shadow-md shadow-indigo-600/30'
                  : 'bg-white text-[#0F172A] border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showChangedOnly ? 'Showing Changes Only' : 'Filter Changed Only'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Subnav Navigation Pills & Action Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSubTab('inventory')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'inventory'
                ? 'bg-gradient-to-r from-[#6366F1] to-[#22D3EE] text-white shadow-md shadow-indigo-500/25'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Inventory ({inventory.length})</span>
            {changedInventoryCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#FEF3C7] text-[#D97706] font-extrabold">
                {changedInventoryCount}Δ
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('suppliers')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'suppliers'
                ? 'bg-gradient-to-r from-[#6366F1] to-[#22D3EE] text-white shadow-md shadow-indigo-500/25'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Tier-1 Suppliers ({suppliers.length})</span>
            {changedSuppliersCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#D1FAE5] text-[#059669] font-extrabold">
                +{changedSuppliersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('pos')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'pos'
                ? 'bg-gradient-to-r from-[#6366F1] to-[#22D3EE] text-white shadow-md shadow-indigo-500/25'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Purchase Orders ({purchaseOrders.length})</span>
            {changedPosCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#FEF3C7] text-[#D97706] font-extrabold">
                {changedPosCount}Δ
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('production')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'production'
                ? 'bg-gradient-to-r from-[#6366F1] to-[#22D3EE] text-white shadow-md shadow-indigo-500/25'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-100'
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
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#6366F1] to-[#22D3EE] hover:brightness-110 text-white shadow-md shadow-indigo-600/25 transition hover:-translate-y-0.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Supplier</span>
            </button>
          )}

          {subTab === 'pos' && onOpenCreatePoModal && (
            <button
              onClick={onOpenCreatePoModal}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#6366F1] to-[#22D3EE] hover:brightness-110 text-white shadow-md shadow-indigo-600/25 transition hover:-translate-y-0.5 shrink-0"
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
              className="bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#6366F1] w-full sm:w-60 shadow-2xs"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" />
          </div>
        </div>
      </div>

      {/* 3. Main Data Tables with Delta Indicators */}
      <div className="glass-card-elevated p-7">
        {/* 1. Inventory View */}
        {subTab === 'inventory' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#475569]">
              <thead className="text-[#64748B] uppercase bg-slate-50 border-b border-slate-200 text-[10px] tracking-wider font-mono">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Component SKU & Name</th>
                  <th className="py-3.5 px-4 font-bold">Warehouse Facility</th>
                  <th className="py-3.5 px-4 font-bold">Physical Stock</th>
                  <th className="py-3.5 px-4 font-bold">Allocated (Live Delta)</th>
                  <th className="py-3.5 px-4 font-bold">Safety Buffer</th>
                  <th className="py-3.5 px-4 font-bold">Inventory Health Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#64748B]">
                      No inventory records found matching current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => {
                    const delta = getInventoryDelta(item);
                    return (
                      <tr
                        key={item.inventory_id}
                        className={`hover:bg-slate-50 transition ${
                          delta?.isChanged ? 'bg-indigo-50/50' : ''
                        }`}
                      >
                        <td className="py-4 px-4 font-bold text-[#0F172A]">
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-sm">{item.component_name}</span>
                            {delta?.isChanged && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                                MODIFIED
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#6366F1] font-mono">({item.component_code})</span>
                        </td>
                        <td className="py-4 px-4 text-[#475569] font-medium">{item.warehouse_name}</td>
                        <td className="py-4 px-4 font-extrabold text-[#0F172A] font-mono">
                          {item.quantity} <span className="text-[#64748B] text-[10px] font-normal">units</span>
                        </td>
                        <td className="py-4 px-4 font-mono">
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-[#0F172A]">{item.allocated_quantity} units</span>
                            {delta && delta.allocatedDiff > 0 && (
                              <span className="text-[10px] text-[#D97706] font-extrabold bg-[#FEF3C7] px-2 py-0.5 rounded-full border border-[#FDE68A] flex items-center space-x-0.5">
                                <ArrowUp className="w-3 h-3" />
                                <span>+{delta.allocatedDiff}</span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-[#475569] font-mono font-medium">{item.safety_stock_level} units</td>
                        <td className="py-4 px-4">
                          {item.is_below_safety_stock ? (
                            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] flex items-center w-fit space-x-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>BELOW BUFFER</span>
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0] flex items-center w-fit space-x-1.5">
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
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs text-[#475569] font-bold">
                Registered Tier-1 Supplier Catalog ({filteredSuppliers.length} Vendors)
              </span>
              {onOpenAddSupplierModal && (
                <button
                  onClick={onOpenAddSupplierModal}
                  className="text-xs text-[#6366F1] hover:text-[#4F46E5] font-extrabold flex items-center space-x-1"
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
                    className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 shadow-sm hover:-translate-y-0.5 ${
                      delta.isNew
                        ? 'bg-indigo-50/70 border-[#6366F1] shadow-md ring-1 ring-[#6366F1]/30'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-[#0F172A] text-base">{s.name}</span>
                            {delta.isNew && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0]">
                                NEW
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#64748B] font-mono">{s.code}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl text-xs font-mono text-[#059669] bg-[#D1FAE5] border border-[#A7F3D0] font-extrabold">
                          {s.reliability_score}% Rel.
                        </span>
                      </div>
                      <p className="text-xs text-[#475569]">{s.contact_email}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">Lead Time</span>
                        <p className="font-extrabold text-[#0F172A] mt-0.5">{s.lead_time_days} Days</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">Weekly Output</span>
                        <p className="font-extrabold text-[#0F172A] mt-0.5">{s.max_capacity?.toLocaleString()} Units</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 pt-1 flex-wrap gap-1">
                      {s.certifications?.map((c) => (
                        <span
                          key={c}
                          className="text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-indigo-50 text-[#6366F1] border border-indigo-200"
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
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs text-[#475569] font-bold">
                ERP Purchase Order Ledger ({filteredPos.length} Active Orders)
              </span>
              {onOpenCreatePoModal && (
                <button
                  onClick={onOpenCreatePoModal}
                  className="text-xs text-[#6366F1] hover:text-[#4F46E5] font-extrabold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Create Purchase Order</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#475569]">
                <thead className="text-[#64748B] uppercase bg-slate-50 border-b border-slate-200 text-[10px] tracking-wider font-mono">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">PO Code</th>
                    <th className="py-3.5 px-4 font-bold">Component SKU & Supplier</th>
                    <th className="py-3.5 px-4 font-bold">Order Quantity</th>
                    <th className="py-3.5 px-4 font-bold">Total Amount (INR)</th>
                    <th className="py-3.5 px-4 font-bold">Expected Delivery</th>
                    <th className="py-3.5 px-4 font-bold">ERP Order Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredPos.map((po) => {
                    const delta = getPoDelta(po);
                    return (
                      <tr
                        key={po.id}
                        className={`hover:bg-slate-50 transition ${
                          delta.isChanged ? 'bg-indigo-50/50' : ''
                        }`}
                      >
                        <td className="py-4 px-4 font-mono font-bold text-[#6366F1]">
                          <div className="flex items-center space-x-2">
                            <span>{po.po_number}</span>
                            {delta.isNew && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0]">
                                NEW (Added)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-[#0F172A] text-sm">{getComponentName(po.component_id)}</div>
                          <div className="text-xs text-[#64748B]">{getSupplierName(po.supplier_id)}</div>
                        </td>
                        <td className="py-4 px-4 text-[#0F172A] font-extrabold font-mono">{po.quantity?.toLocaleString()} units</td>
                        <td className="py-4 px-4 text-[#0F172A] font-extrabold font-mono">
                          ₹{po.total_amount?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-4 text-[#475569] font-mono">
                          {new Date(po.expected_delivery_date).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                po.status === 'Delayed'
                                  ? 'bg-[#FEE2E2] text-[#EF4444] border border-[#FECACA]'
                                  : po.status === 'Quality_Failed'
                                  ? 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]'
                                  : 'bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0]'
                              }`}
                            >
                              {po.status}
                            </span>
                            {delta.statusChanged && delta.baseline && (
                              <span className="text-[10px] text-[#EF4444] font-mono">
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
            <table className="w-full text-left text-xs text-[#475569]">
              <thead className="text-[#64748B] uppercase bg-slate-50 border-b border-slate-200 text-[10px] tracking-wider font-mono">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Production Order</th>
                  <th className="py-3.5 px-4 font-bold">Finished Product</th>
                  <th className="py-3.5 px-4 font-bold">Customer Account</th>
                  <th className="py-3.5 px-4 font-bold">Priority Class</th>
                  <th className="py-3.5 px-4 font-bold">Volume</th>
                  <th className="py-3.5 px-4 font-bold">Assembly Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredProduction.map((prd) => (
                  <tr key={prd.id} className="hover:bg-slate-50 transition">
                    <td className="py-4 px-4 font-mono font-bold text-[#6366F1]">{prd.order_number}</td>
                    <td className="py-4 px-4 font-extrabold text-[#0F172A] text-sm">{prd.product_name}</td>
                    <td className="py-4 px-4 text-[#475569] font-medium">{prd.customer_name}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-full font-extrabold text-[10px] bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                        {prd.customer_priority}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-extrabold text-[#0F172A] font-mono">{prd.quantity} units</td>
                    <td className="py-4 px-4 text-[#475569] font-mono">
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
