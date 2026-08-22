import React, { useState } from 'react';
import { Layers, Package, Truck, Factory, Users } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      {/* Subnav tabs */}
      <div className="flex space-x-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 w-fit">
        <button
          onClick={() => setSubTab('inventory')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            subTab === 'inventory' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Inventory Twin</span>
        </button>
        <button
          onClick={() => setSubTab('suppliers')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            subTab === 'suppliers' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Supplier Directory</span>
        </button>
        <button
          onClick={() => setSubTab('pos')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            subTab === 'pos' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Purchase Orders ({purchaseOrders.length})</span>
        </button>
        <button
          onClick={() => setSubTab('production')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            subTab === 'production' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Factory className="w-4 h-4" />
          <span>Production Orders ({productionOrders.length})</span>
        </button>
      </div>

      {/* Subtab Content */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        {subTab === 'inventory' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-slate-400 uppercase bg-slate-800/50 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Component Code</th>
                  <th className="py-3 px-3">Component Name</th>
                  <th className="py-3 px-3">Warehouse Location</th>
                  <th className="py-3 px-3">Available Qty</th>
                  <th className="py-3 px-3">Safety Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {inventory.map((item) => (
                  <tr key={item.inventory_id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-400">{item.component_code}</td>
                    <td className="py-3 px-3 font-semibold text-white">{item.component_name}</td>
                    <td className="py-3 px-3">{item.warehouse_name}</td>
                    <td className="py-3 px-3 font-bold text-white">{item.available_quantity} units</td>
                    <td className="py-3 px-3 text-slate-400">{item.safety_stock_level} units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {subTab === 'suppliers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((s) => (
              <div key={s.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">{s.name}</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{s.reliability_score}% Rel.</span>
                </div>
                <p className="text-xs text-slate-400">{s.contact_email}</p>
                <div className="text-xs text-slate-300 pt-1">
                  Lead Time: <span className="font-bold text-white">{s.lead_time_days} days</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {subTab === 'pos' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-slate-400 uppercase bg-slate-800/50 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">PO Number</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Total Cost</th>
                  <th className="py-3 px-3">Expected Delivery</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-400">{po.po_number}</td>
                    <td className="py-3 px-3 text-white font-bold">{po.quantity} units</td>
                    <td className="py-3 px-3 text-white font-bold">${po.total_amount?.toLocaleString()}</td>
                    <td className="py-3 px-3 text-slate-400">{new Date(po.expected_delivery_date).toLocaleDateString()}</td>
                    <td className="py-3 px-3 font-semibold text-emerald-400">{po.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {subTab === 'production' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-slate-400 uppercase bg-slate-800/50 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Order Number</th>
                  <th className="py-3 px-3">Product Name</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {productionOrders.map((prd) => (
                  <tr key={prd.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-400">{prd.order_number}</td>
                    <td className="py-3 px-3 font-semibold text-white">{prd.product_name}</td>
                    <td className="py-3 px-3">{prd.customer_name}</td>
                    <td className="py-3 px-3 font-bold text-amber-400">{prd.customer_priority}</td>
                    <td className="py-3 px-3 text-slate-400">{new Date(prd.due_date).toLocaleDateString()}</td>
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
