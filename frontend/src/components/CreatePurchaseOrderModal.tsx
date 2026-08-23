import React, { useState, useMemo } from 'react';
import {
  Truck,
  X,
  Sparkles,
  Award,
  Sliders,
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

  // AI Multi-Criteria Supplier Performance Ranking Engine
  const rankedSuppliers = useMemo(() => {
    return suppliers
      .map((s) => {
        const relScore = (s.reliability_score / 100) * 35;
        const qualScore = ((s.quality_rating || 4.5) / 5.0) * 25;
        const leadScore = Math.max(0, (1 - s.lead_time_days / 20) * 20);
        const capScore = s.max_capacity >= quantity ? 10 : (s.max_capacity / (quantity || 1)) * 10;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-8 py-5 bg-gradient-to-r from-indigo-50/70 via-white to-cyan-50/70 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-[#6366F1] border border-indigo-200 flex items-center justify-center shadow-sm">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#0F172A]">Create Purchase Order & AI Supplier Match</h3>
              <p className="text-xs text-[#475569]">
                Formulate ERP purchase order and dynamically assign to top-performing vendor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3.5 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] text-[#EF4444] text-xs font-medium">
              {error}
            </div>
          )}

          {/* 1. Component & Quantity Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#0F172A] font-extrabold uppercase tracking-wider mb-2 text-[11px]">
                Target Component / SKU
              </label>
              <select
                value={selectedComponentId}
                onChange={(e) => handleComponentChange(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#6366F1] font-sans shadow-2xs"
              >
                {uniqueComponents.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code}) - ₹{c.defaultCost}/unit
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#0F172A] font-extrabold uppercase tracking-wider mb-2 text-[11px]">
                Order Quantity (Units)
              </label>
              <input
                type="number"
                min="10"
                step="10"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] font-mono font-bold focus:outline-none focus:border-[#6366F1] shadow-2xs"
              />
            </div>
          </div>

          {/* 2. Unit Price (INR) & Production Demand Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#0F172A] font-extrabold uppercase tracking-wider mb-2 text-[11px]">
                Estimated Unit Price (INR ₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-[#64748B] font-bold text-xs">₹</span>
                <input
                  type="number"
                  min="1"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-[#0F172A] font-mono font-bold focus:outline-none focus:border-[#6366F1] shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#0F172A] font-extrabold uppercase tracking-wider mb-2 text-[11px]">
                Linked Assembly / Production Need
              </label>
              <select
                value={linkedPrdOrder}
                onChange={(e) => setLinkedPrdOrder(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#6366F1] font-sans shadow-2xs"
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
            <label className="block text-[#0F172A] font-extrabold uppercase tracking-wider mb-2.5 text-[11px]">
              Supplier Allocation Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAllocationMode('AUTO_AI')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  allocationMode === 'AUTO_AI'
                    ? 'bg-indigo-50/90 border-2 border-[#6366F1] text-[#0F172A] shadow-md ring-1 ring-[#6366F1]/30'
                    : 'bg-white border-slate-200 text-[#475569] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#6366F1]" />
                  <span className="font-extrabold text-xs text-[#0F172A]">AI Best-Match Assignment (Recommended)</span>
                </div>
                <p className="text-[10px] text-[#475569] mt-2 leading-relaxed">
                  Automatically ranks suppliers on Reliability (35%), Quality (25%), Lead Speed (20%), and ISO compliance.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAllocationMode('MANUAL')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  allocationMode === 'MANUAL'
                    ? 'bg-indigo-50/90 border-2 border-[#6366F1] text-[#0F172A] shadow-md ring-1 ring-[#6366F1]/30'
                    : 'bg-white border-slate-200 text-[#475569] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-slate-400" />
                  <span className="font-extrabold text-xs text-[#0F172A]">Manual Supplier Override</span>
                </div>
                <p className="text-[10px] text-[#475569] mt-2 leading-relaxed">
                  Select a specific vendor manually from the registered supplier catalog.
                </p>
              </button>
            </div>
          </div>

          {/* 4. AI Best Match Highlight Card */}
          {allocationMode === 'AUTO_AI' && bestMatch && (
            <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0] flex items-center space-x-1">
                    <Award className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Top-Ranked Supplier Match</span>
                  </span>
                  <span className="text-xs text-[#6366F1] font-mono font-extrabold">
                    Composite Score: {bestMatch.score}/100
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-[#0F172A] bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                  {bestMatch.supplier.code}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <h4 className="text-base font-black text-[#0F172A]">{bestMatch.supplier.name}</h4>
                  <p className="text-xs text-[#475569]">{bestMatch.supplier.contact_email}</p>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <div className="text-right">
                    <span className="text-[10px] text-[#64748B] block font-medium">Reliability</span>
                    <span className="font-mono font-extrabold text-[#059669]">
                      {bestMatch.supplier.reliability_score}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#64748B] block font-medium">Lead Time</span>
                    <span className="font-mono font-extrabold text-[#6366F1]">
                      {bestMatch.supplier.lead_time_days} Days
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#64748B] block font-medium">Quality</span>
                    <span className="font-mono font-extrabold text-[#D97706]">
                      {bestMatch.supplier.quality_rating} ★
                    </span>
                  </div>
                </div>
              </div>

              {/* Rationale Breakdown */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-[#334155] leading-relaxed">
                <span className="font-bold text-[#6366F1]">Optimization Rationale: </span>
                Selected for optimal composite score ({bestMatch.score}/100) combining {bestMatch.supplier.reliability_score}% SLA reliability, {bestMatch.supplier.lead_time_days}-day delivery speed, and certified compliance ({bestMatch.supplier.certifications?.join(', ')}).
              </div>
            </div>
          )}

          {allocationMode === 'MANUAL' && (
            <div>
              <label className="block text-[#0F172A] font-extrabold uppercase tracking-wider mb-2 text-[11px]">
                Choose Supplier from Ranked Ledger
              </label>
              <select
                value={manualSupplierId}
                onChange={(e) => setManualSupplierId(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#6366F1] font-sans shadow-2xs"
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
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">
                Total Purchase Order Value (INR)
              </span>
              <div className="text-xl font-black text-[#0F172A] font-mono">
                ₹{totalAmount.toLocaleString('en-IN')}{' '}
                <span className="text-xs text-[#64748B] font-normal">
                  ({quantity} units @ ₹{unitPrice}/unit)
                </span>
              </div>
            </div>

            <div className="space-y-1 text-left sm:text-right">
              <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">
                Expected Fulfillment Date
              </span>
              <div className="text-xs font-mono font-extrabold text-[#059669]">
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
              className="w-4 h-4 accent-[#6366F1] rounded border-slate-300 cursor-pointer"
            />
            <label htmlFor="expedite-po" className="text-xs text-[#334155] font-semibold cursor-pointer">
              Expedite Inbound Logistics (+Priority Freight Lane, -2 Days Lead Time)
            </label>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-[#475569] border border-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#6366F1] to-[#22D3EE] hover:brightness-110 text-white shadow-md shadow-indigo-600/25 flex items-center space-x-2 transition hover:-translate-y-0.5"
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
