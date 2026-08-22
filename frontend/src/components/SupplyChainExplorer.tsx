import React, { useState } from 'react';
import { Package, Truck, Factory, Users, IndianRupee, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
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

  const getSupplierName = (supplierId?: number) =>
    suppliers.find((s) => s.id === supplierId)?.name || 'Supplier';

  const getComponentName = (componentId?: number) =>
    inventory.find((i) => i.component_id === componentId)?.component_name || 'Component';

  return (
    <div className="space-y-6">
      {/* Subnav Navigation Pills */}
      <div className="flex flex-wrap gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 w-fit backdrop-blur-md">
        <button
          onClick={() => setSubTab('inventory')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === 'inventory'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Live Inventory Twin ({inventory.length})</span>
        </button>

        <button
          onClick={() => setSubTab('suppliers')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === 'suppliers'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Tier-1 Suppliers ({suppliers.length})</span>
        </button>

        <button
          onClick={() => setSubTab('pos')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === 'pos'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Purchase Orders ({purchaseOrders.length})</span>
        </button>

        <button
          onClick={() => setSubTab('production')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === 'production'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Factory className="w-4 h-4" />
          <span>Production Schedules ({productionOrders.length})</span>
        </button>
      </div>

      {/* Main Data Tables / Visuals */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        {/* 1. Inventory View */}
        {subTab === 'inventory' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-slate-400 uppercase bg-slate-800/50 border-b border-slate-800 text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Component Code</th>
                  <th className="py-3.5 px-4">Component Name</th>
                  <th className="py-3.5 px-4">Warehouse Facility</th>
                  <th className="py-3.5 px-4">Total Stock</th>
                  <th className="py-3.5 px-4">Safety Buffer</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {inventory.map((item) => (
                  <tr key={item.inventory_id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{item.component_code}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{item.component_name}</td>
                    <td className="py-3.5 px-4 text-slate-300">{item.warehouse_name}</td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {item.quantity} <span className="text-[10px] text-slate-400 font-normal">units</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">{item.safety_stock_level} units</td>
                    <td className="py-3.5 px-4">
                      {item.is_below_safety_stock ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center w-fit space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>BELOW SAFETY STOCK</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center w-fit space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>OPTIMAL</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {suppliers.map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3.5 shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-white text-sm">{s.name}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{s.contact_email}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-bold">
                    {s.reliability_score}% Rel.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Standard Lead Time</span>
                    <p className="font-bold text-white mt-0.5">{s.lead_time_days} Days</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Weekly Capacity</span>
                    <p className="font-bold text-white mt-0.5">{s.max_capacity?.toLocaleString()} Units</p>
                  </div>
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
        )}

        {/* 3. Purchase Orders (in INR ₹) */}
        {subTab === 'pos' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-slate-400 uppercase bg-slate-800/50 border-b border-slate-800 text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">PO Number</th>
                  <th className="py-3.5 px-4">Component & Supplier</th>
                  <th className="py-3.5 px-4">Order Quantity</th>
                  <th className="py-3.5 px-4">Total Amount (INR)</th>
                  <th className="py-3.5 px-4">Expected Delivery</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{po.po_number}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{getComponentName(po.component_id)}</div>
                      <div className="text-[10px] text-slate-400">{getSupplierName(po.supplier_id)}</div>
                    </td>
                    <td className="py-3.5 px-4 text-white font-bold">{po.quantity?.toLocaleString()} units</td>
                    <td className="py-3.5 px-4 text-white font-bold font-mono">
                      ₹{po.total_amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {new Date(po.expected_delivery_date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
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

        {/* 4. Production Orders */}
        {subTab === 'production' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-slate-400 uppercase bg-slate-800/50 border-b border-slate-800 text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order Code</th>
                  <th className="py-3.5 px-4">Finished Product</th>
                  <th className="py-3.5 px-4">Customer Account</th>
                  <th className="py-3.5 px-4">Priority Level</th>
                  <th className="py-3.5 px-4">Order Volume</th>
                  <th className="py-3.5 px-4">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {productionOrders.map((prd) => (
                  <tr key={prd.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{prd.order_number}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{prd.product_name}</td>
                    <td className="py-3.5 px-4 text-slate-300">{prd.customer_name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-extrabold text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {prd.customer_priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">{prd.quantity} units</td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {new Date(prd.due_date).toLocaleDateString()}
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
