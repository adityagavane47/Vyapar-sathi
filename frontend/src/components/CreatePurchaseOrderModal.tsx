import React, { useState, useMemo } from 'react';
import {
  Truck,
  X,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  IndianRupee,
  ShieldCheck,
  Building2,
  Package,
  Layers,
  ArrowRight,
  Plus,
  Sliders,
  Check
} from 'lucide-react';
import { Supplier, InventoryItem, PurchaseOrder, ProductionOrder } from '../types';

interface CreatePurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePo: (po: PurchaseOrder) => void;
  suppliers: Supplier[];
  inventory: InventoryItem[];
  productionOrders: ProductionOrder[];
  existingPoCount: number;
}

export const CreatePurchaseOrderModal: React.FC<CreatePurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  onCreatePo,
  suppliers,
  inventory,
  productionOrders,
  existingPoCount,
}) => {
  if (!isOpen) return null;

  // Component options derived from inventory
  const uniqueComponents = useMemo(() => {
    const map = new Map<number, { id: number; name: string; code: string; defaultCost: number }>();
    inventory.forEach((i) => {
      if (!map.has(i.component_id)) {
        // default cost heuristic
        const cost =
          i.component_code === 'MCU-32'
            ? 700
            : i.component_code === 'POS-5'
            ? 1200
            : i.component_code === 'MEM-64'
            ? 950
            : 3500;
        map.set(i.component_id, {
          id: i.component_id,
          name: i.component_name,
          code: i.component_code,
          defaultCost: cost,
        });
      }
    });
    return Array.from(map.values());
  }, [inventory]);

  const defaultComponent = uniqueComponents[0] || {
    id: 1,
    name: 'Microcontroller Unit MCU-32',
    code: 'MCU-32',
    defaultCost: 700,
  };

  const [selectedComponentId, setSelectedComponentId] = useState<number>(defaultComponent.id);
  const [quantity, setQuantity] = useState<number>(500);
  const [unitPrice, setUnitPrice] = useState<number>(defaultComponent.defaultCost);
  const [linkedPrdOrder, setLinkedPrdOrder] = useState<string>('Buffer Allocation');
  const [isExpedited, setIsExpedited] = useState<boolean>(false);
  const [allocationMode, setAllocationMode] = useState<'AUTO_AI' | 'MANUAL'>('AUTO_AI');
  const [manualSupplierId, setManualSupplierId] = useState<number>(suppliers[0]?.id || 1);
  const [error, setError] = useState<string | null>(null);

  const activeComponent =
    uniqueComponents.find((c) => c.id === selectedComponentId) || defaultComponent;

  // --- AI Multi-Criteria Supplier Performance Ranking Engine ---
  const rankedSuppliers = useMemo(() => {
    return suppliers
      .map((s) => {
        // 1. Reliability Score (35% weight)
        const relScore = (s.reliability_score / 100) * 35;
        // 2. Quality Rating (25% weight)
        const qualScore = ((s.quality_rating || 4.5) / 5.0) * 25;
        // 3. Lead Time Speed (20% weight - faster is higher)
        const leadScore = Math.max(0, (1 - s.lead_time_days / 20) * 20);
        // 4. Capacity Adequacy (10% weight)
        const capScore = s.max_capacity >= quantity ? 10 : (s.max_capacity / (quantity || 1)) * 10;
        // 5. Certifications (10% weight)
        const certScore = Math.min(10, (s.certifications?.length || 1) * 2.5);

        const totalScore = Number((relScore + qualScore + leadScore + capScore + certScore).toFixed(1));

        return {
          supplier: s,
          score: totalScore,
          breakdown: {
            reliability: Number(relScore.toFixed(1)),
            quality: Number(qualScore.toFixed(1)),
            leadTime: Number(leadScore.toFixed(1)),
            capacity: Number(capScore.toFixed(1)),
            compliance: Number(certScore.toFixed(1)),
          },
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [suppliers, quantity]);

  const bestMatch = rankedSuppliers[0];
  const selectedSupplier =
    allocationMode === 'AUTO_AI'
      ? bestMatch?.supplier
      : suppliers.find((s) => s.id === manualSupplierId) || suppliers[0];

  const totalAmount = quantity * unitPrice;
  const deliveryLeadDays = (selectedSupplier?.lead_time_days || 5) - (isExpedited ? 2 : 0);
  const effectiveLeadDays = Math.max(1, deliveryLeadDays);

  const calculatedDeliveryDate = new Date();
  calculatedDeliveryDate.setDate(calculatedDeliveryDate.getDate() + effectiveLeadDays);

  const handleComponentChange = (id: number) => {
    setSelectedComponentId(id);
    const comp = uniqueComponents.find((c) => c.id === id);
    if (comp) {
      setUnitPrice(comp.defaultCost);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) {
      setError('No eligible supplier selected. Please register a supplier first.');
      return;
    }
    if (quantity <= 0) {
      setError('Order quantity must be greater than 0.');
      return;
    }

    const nextPoNum = `PO-${7000 + existingPoCount + 1}`;

    const newPo: PurchaseOrder = {
      id: Date.now(),
      po_number: nextPoNum,
      supplier_id: selectedSupplier.id,
      component_id: activeComponent.id,
      supplier_name: selectedSupplier.name,
      component_name: activeComponent.name,
      quantity,
      unit_price: unitPrice,
      total_amount: totalAmount,
      status: 'Sent',
      expected_delivery_date: calculatedDeliveryDate.toISOString(),
      expedited: isExpedited,
    };

    onCreatePo(newPo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-8 py-5 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Create Purchase Order & AI Supplier Match</h3>
              <p className="text-xs text-slate-400">
                Formulate ERP purchase order and dynamically assign to top-performing vendor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* 1. Component & Quantity Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider mb-2 text-[11px]">
                Target Component / SKU
              </label>
              <select
                value={selectedComponentId}
                onChange={(e) => handleComponentChange(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans shadow-inner"
              >
                {uniqueComponents.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code}) - ₹{c.defaultCost}/unit
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider mb-2 text-[11px]">
                Order Quantity (Units)
              </label>
              <input
                type="number"
                min="10"
                step="10"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-indigo-500 shadow-inner"
              />
            </div>
          </div>

          {/* 2. Unit Price (INR) & Production Demand Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider mb-2 text-[11px]">
                Estimated Unit Price (INR ₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold text-xs">₹</span>
                <input
                  type="number"
                  min="1"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-indigo-500 shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider mb-2 text-[11px]">
                Linked Assembly / Production Need
              </label>
              <select
                value={linkedPrdOrder}
                onChange={(e) => setLinkedPrdOrder(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans shadow-inner"
              >
                <option value="Buffer Allocation">Central Warehouse Buffer Replenishment</option>
                {productionOrders.map((p) => (
                  <option key={p.id} value={p.order_number}>
                    {p.order_number} ({p.product_name} - {p.customer_name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Supplier Assignment Mode Selector */}
          <div>
            <label className="block text-slate-300 font-bold uppercase tracking-wider mb-2.5 text-[11px]">
              Supplier Allocation Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAllocationMode('AUTO_AI')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  allocationMode === 'AUTO_AI'
                    ? 'bg-gradient-to-br from-indigo-600/25 to-blue-600/10 border-indigo-500 text-white shadow-xl shadow-indigo-500/15 ring-1 ring-indigo-500/50'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-xs text-white">AI Best-Match Assignment (Recommended)</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  Automatically ranks suppliers on Reliability (35%), Quality (25%), Lead Speed (20%), and ISO compliance.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAllocationMode('MANUAL')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  allocationMode === 'MANUAL'
                    ? 'bg-gradient-to-br from-indigo-600/25 to-blue-600/10 border-indigo-500 text-white shadow-xl shadow-indigo-500/15 ring-1 ring-indigo-500/50'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-xs text-white">Manual Supplier Override</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  Select a specific vendor manually from the registered supplier catalog.
                </p>
              </button>
            </div>
          </div>

          {/* 4. AI Best Match Highlight Card OR Manual Selector */}
          {allocationMode === 'AUTO_AI' && bestMatch && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/40 space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    <span>Top-Ranked Supplier Match</span>
                  </span>
                  <span className="text-xs text-indigo-300 font-mono font-bold">
                    Composite Score: {bestMatch.score}/100
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-white bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
                  {bestMatch.supplier.code}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <h4 className="text-base font-black text-white">{bestMatch.supplier.name}</h4>
                  <p className="text-xs text-slate-400">{bestMatch.supplier.contact_email}</p>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Reliability</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {bestMatch.supplier.reliability_score}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Lead Time</span>
                    <span className="font-mono font-bold text-indigo-300">
                      {bestMatch.supplier.lead_time_days} Days
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Quality</span>
                    <span className="font-mono font-bold text-amber-300">
                      {bestMatch.supplier.quality_rating} ★
                    </span>
                  </div>
                </div>
              </div>

              {/* Rationale Breakdown */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed">
                <span className="font-bold text-indigo-300">Optimization Rationale: </span>
                Selected for optimal composite score ({bestMatch.score}/100) combining {bestMatch.supplier.reliability_score}% SLA reliability, {bestMatch.supplier.lead_time_days}-day delivery speed, and certified compliance ({bestMatch.supplier.certifications?.join(', ')}).
              </div>
            </div>
          )}

          {allocationMode === 'MANUAL' && (
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider mb-2 text-[11px]">
                Choose Supplier from Ranked Ledger
              </label>
              <select
                value={manualSupplierId}
                onChange={(e) => setManualSupplierId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans shadow-inner"
              >
                {rankedSuppliers.map((r) => (
                  <option key={r.supplier.id} value={r.supplier.id}>
                    {r.supplier.name} ({r.supplier.code}) - Score: {r.score}/100 | {r.supplier.reliability_score}% Rel. | {r.supplier.lead_time_days} Days
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 5. PO Summary Preview */}
          <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                Total Purchase Order Value (INR)
              </span>
              <div className="text-xl font-black text-white font-mono">
                ₹{totalAmount.toLocaleString('en-IN')}{' '}
                <span className="text-xs text-slate-400 font-normal">
                  ({quantity} units @ ₹{unitPrice}/unit)
                </span>
              </div>
            </div>

            <div className="space-y-1 text-left sm:text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                Expected Fulfillment Date
              </span>
              <div className="text-xs font-mono font-bold text-emerald-400">
                {calculatedDeliveryDate.toLocaleDateString('en-IN', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                ({effectiveLeadDays} days)
              </div>
            </div>
          </div>

          {/* Expedite Delivery Checkbox */}
          <div className="flex items-center space-x-2.5 pt-1">
            <input
              type="checkbox"
              id="expedite-po"
              checked={isExpedited}
              onChange={(e) => setIsExpedited(e.target.checked)}
              className="w-4 h-4 accent-indigo-500 rounded bg-slate-950 border-slate-800 cursor-pointer"
            />
            <label htmlFor="expedite-po" className="text-xs text-slate-300 font-semibold cursor-pointer">
              Expedite Inbound Logistics (+Priority Freight Lane, -2 Days Lead Time)
            </label>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-xl shadow-indigo-600/30 flex items-center space-x-2 transition"
            >
              <Truck className="w-4 h-4" />
              <span>Issue & Dispatch Purchase Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
