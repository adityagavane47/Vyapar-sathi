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
  Building2
} from 'lucide-react';
import { InventoryItem, Supplier, PurchaseOrder, ProductionOrder } from '../types';

interface SupplyChainExplorerProps {
  inventory: InventoryItem[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  productionOrders: ProductionOrder[];
}

export const SupplyChainExplorer: React.FC<SupplyChainExplorerProps> = ({
  inventory,
  suppliers,
  purchaseOrders,
  productionOrders,
}) => {
  const [subTab, setSubTab] = useState<'inventory' | 'suppliers' | 'pos' | 'production'>('inventory');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const getSupplierName = (supplierId?: number) =>
    suppliers.find((s) => s.id === supplierId)?.name || 'Supplier';

  const getComponentName = (componentId?: number) =>
    inventory.find((i) => i.component_id === componentId)?.component_name || 'Component';

  // Search filter
  const filteredInventory = inventory.filter(
    (i) =>
      i.component_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.component_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contact_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPos = purchaseOrders.filter(
    (po) =>
      po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getComponentName(po.component_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getSupplierName(po.supplier_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProduction = productionOrders.filter(
    (p) =>
      p.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* 1. Subnav Navigation Pills & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 backdrop-blur-xl">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSubTab('inventory')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              subTab === 'inventory'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Inventory Twin ({inventory.length})</span>
          </button>

          <button
            onClick={() => setSubTab('suppliers')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              subTab === 'suppliers'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Tier-1 Suppliers ({suppliers.length})</span>
          </button>

          <button
            onClick={() => setSubTab('pos')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              subTab === 'pos'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Purchase Orders ({purchaseOrders.length})</span>
          </button>

          <button
            onClick={() => setSubTab('production')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              subTab === 'production'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Factory className="w-4 h-4" />
            <span>Production Orders ({productionOrders.length})</span>
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Twin by name, SKU, PO..."
            className="bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-72 shadow-inner"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
        </div>
      </div>

      {/* 2. Main Data Visuals */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        {/* 1. Inventory View */}
        {subTab === 'inventory' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-slate-400 uppercase bg-slate-800/50 border-b border-slate-800 text-[10px] tracking-wider font-mono">
                <tr>
                  <th className="py-4 px-4">Component SKU & Name</th>
                  <th className="py-4 px-4">Warehouse Facility</th>
                  <th className="py-4 px-4">Total Stock</th>
                  <th className="py-4 px-4">Allocated</th>
                  <th className="py-4 px-4">Safety Threshold</th>
                  <th className="py-4 px-4">Inventory Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredInventory.map((item) => (
                  <tr key={item.inventory_id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-4 font-semibold text-white">
                      <div className="font-bold text-sm">{item.component_name}</div>
                      <span className="text-[10px] text-indigo-400 font-mono">({item.component_code})</span>
                    </td>
                    <td className="py-4 px-4 text-slate-300 font-medium">{item.warehouse_name}</td>
                    <td className="py-4 px-4 font-bold text-white font-mono">
                      {item.quantity} <span className="text-[10px] text-slate-400 font-normal">units</span>
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-mono">{item.allocated_quantity} units</td>
                    <td className="py-4 px-4 text-slate-400 font-mono">{item.safety_stock_level} units</td>
                    <td className="py-4 px-4">
                      {item.is_below_safety_stock ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center w-fit space-x-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>BELOW SAFETY BUFFER</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center w-fit space-x-1.5">
                          <Check className="w-3.5 h-3.5" />
                          <span>OPTIMAL HEALTH</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Supplier Directory */}
        {subTab === 'suppliers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((s) => (
              <div
                key={s.id}
                className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800/90 space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className="font-black text-white text-base">{s.name}</span>
                    <span className="px-2.5 py-1 rounded-xl text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-bold">
                      {s.reliability_score}% Rel.
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{s.contact_email}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Standard Lead</span>
                    <p className="font-bold text-white mt-0.5">{s.lead_time_days} Days</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Weekly Capacity</span>
                    <p className="font-bold text-white mt-0.5">{s.max_capacity?.toLocaleString()} Units</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 pt-2">
                  {s.certifications?.map((c) => (
                    <span
                      key={c}
                      className="text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. Purchase Orders */}
        {subTab === 'pos' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-slate-400 uppercase bg-slate-800/50 border-b border-slate-800 text-[10px] tracking-wider font-mono">
                <tr>
                  <th className="py-4 px-4">PO Number</th>
                  <th className="py-4 px-4">Component & Vendor</th>
                  <th className="py-4 px-4">Order Quantity</th>
                  <th className="py-4 px-4">Total Value (INR)</th>
                  <th className="py-4 px-4">Expected Delivery</th>
                  <th className="py-4 px-4">ERP Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredPos.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-4 font-mono font-bold text-indigo-400">{po.po_number}</td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-white text-sm">{getComponentName(po.component_id)}</div>
                      <div className="text-xs text-slate-400">{getSupplierName(po.supplier_id)}</div>
                    </td>
                    <td className="py-4 px-4 text-white font-bold font-mono">{po.quantity?.toLocaleString()} units</td>
                    <td className="py-4 px-4 text-white font-black font-mono">
                      ₹{po.total_amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-mono">
                      {new Date(po.expected_delivery_date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          po.status === 'Delayed'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : po.status === 'Quality_Failed'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Production Schedules */}
        {subTab === 'production' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-slate-400 uppercase bg-slate-800/50 border-b border-slate-800 text-[10px] tracking-wider font-mono">
                <tr>
                  <th className="py-4 px-4">Production Order</th>
                  <th className="py-4 px-4">Finished Product</th>
                  <th className="py-4 px-4">Customer Account</th>
                  <th className="py-4 px-4">Priority Class</th>
                  <th className="py-4 px-4">Volume</th>
                  <th className="py-4 px-4">Assembly Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredProduction.map((prd) => (
                  <tr key={prd.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-4 font-mono font-bold text-indigo-400">{prd.order_number}</td>
                    <td className="py-4 px-4 font-bold text-white text-sm">{prd.product_name}</td>
                    <td className="py-4 px-4 text-slate-300 font-medium">{prd.customer_name}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-full font-extrabold text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30">
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
