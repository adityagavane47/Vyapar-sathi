import React, { useState } from 'react';
import {
  ShieldAlert,
  X,
  Sparkles,
  AlertTriangle,
  Clock,
  Layers,
  IndianRupee,
  Sliders,
  CheckCircle2,
  Info
} from 'lucide-react';
import { PurchaseOrder, InventoryItem, Supplier } from '../types';

interface CustomDisruptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    event_type: string;
    severity: string;
    affected_entity_type: string;
    affected_entity_id: number;
    description: string;
    evidence: Record<string, any>;
  }) => Promise<void>;
  purchaseOrders: PurchaseOrder[];
  inventory: InventoryItem[];
  suppliers: Supplier[];
}

export const CustomDisruptionModal: React.FC<CustomDisruptionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  purchaseOrders,
  inventory,
  suppliers,
}) => {
  if (!isOpen) return null;

  const [eventType, setEventType] = useState<'supplier_delay' | 'quality_defect' | 'inventory_shortage' | 'high_cost_escalation' | 'logistics_delay'>('supplier_delay');
  const [severity, setSeverity] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [selectedPoId, setSelectedPoId] = useState<number>(purchaseOrders[0]?.id || 1);
  const [delayDays, setDelayDays] = useState<number>(7);
  const [defectRate, setDefectRate] = useState<number>(25);
  const [costImpact, setCostImpact] = useState<number>(65000);
  const [customDescription, setCustomDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedPo = purchaseOrders.find((p) => p.id === selectedPoId) || purchaseOrders[0];

  const getSupplierName = (supplierId?: number) =>
    suppliers.find((s) => s.id === supplierId)?.name || 'Supplier';

  const getComponentName = (componentId?: number) =>
    inventory.find((i) => i.component_id === componentId)?.component_name || 'Component';

  const currentSupplierName = selectedPo ? getSupplierName(selectedPo.supplier_id) : 'Vendor';
  const currentComponentName = selectedPo ? getComponentName(selectedPo.component_id) : 'Component';

  // Auto-generate suggested description based on inputs
  const getSuggestedDescription = () => {
    if (eventType === 'supplier_delay') {
      return `Primary supplier ${currentSupplierName} notified a ${delayDays}-day delivery delay on ${selectedPo?.po_number || 'PO-7001'} (${selectedPo?.quantity || 500} units of ${currentComponentName}).`;
    }
    if (eventType === 'quality_defect') {
      return `Inbound inspection at Central Hub flagged a ${defectRate}% defect rate on batch ${selectedPo?.po_number || 'PO-7002'} from ${currentSupplierName}. Quarantine protocol active.`;
    }
    if (eventType === 'high_cost_escalation') {
      return `Critical breakdown at ${currentSupplierName}. Delivery delayed by ${delayDays} days. Recovery requires emergency expedited procurement with estimated cost of ₹${costImpact.toLocaleString('en-IN')}.`;
    }
    if (eventType === 'inventory_shortage') {
      return `Unexpected production consumption caused buffer depletion for ${currentComponentName}. Stock level below minimum safety threshold.`;
    }
    return `Logistics carrier reported customs transit disruption on ${selectedPo?.po_number || 'PO-7001'}. Estimated delay: ${delayDays} business days.`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const description = customDescription.trim() || getSuggestedDescription();
      const evidence: Record<string, any> = {
        po_number: selectedPo?.po_number || 'PO-7001',
        supplier: currentSupplierName,
        affected_component: currentComponentName,
      };

      if (eventType === 'supplier_delay' || eventType === 'logistics_delay') {
        evidence.delay_days = delayDays;
        evidence.original_due_days = 4;
        evidence.new_due_days = 4 + delayDays;
      } else if (eventType === 'quality_defect') {
        evidence.defect_rate_percent = defectRate;
        evidence.inspected_quantity = selectedPo?.quantity || 500;
        evidence.rejected_quantity = Math.round(((selectedPo?.quantity || 500) * defectRate) / 100);
      } else if (eventType === 'high_cost_escalation') {
        evidence.delay_days = delayDays;
        evidence.estimated_incremental_cost = costImpact;
        evidence.critical_order = 'PRD-9003';
      }

      await onSubmit({
        event_type: eventType,
        severity,
        affected_entity_type: 'PurchaseOrder',
        affected_entity_id: selectedPoId,
        description,
        evidence,
      });
      onClose();
    } catch (err: any) {
      console.error('Error creating custom disruption:', err);
      setErrorMessage(err.message || 'Failed to inject custom disruption. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-8 py-5 bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h3 className="text-lg font-black text-white">Inject Custom Disruption Scenario</h3>
                <span className="text-[10px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Custom Event Builder
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Parameterize supply chain disruption signals and observe real-time autonomous triage.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 text-xs">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 flex items-center space-x-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Disruption Category Selector */}
          <div>
            <label className="block text-slate-300 font-extrabold uppercase tracking-wider mb-2.5 text-[11px]">
              Disruption Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'supplier_delay', label: 'Supplier Delay', icon: Clock, desc: 'Production delay at vendor facility' },
                { id: 'quality_defect', label: 'Quality Defect', icon: AlertTriangle, desc: 'Batch inspection failure & quarantine' },
                { id: 'high_cost_escalation', label: 'High Cost (HITL)', icon: IndianRupee, desc: 'Spend > ₹50k requiring authorization' },
                { id: 'inventory_shortage', label: 'Stock Shortage', icon: Layers, desc: 'Buffer stock depletion below safety level' },
                { id: 'logistics_delay', label: 'Freight Delay', icon: Clock, desc: 'In-transit carrier & port hold' },
              ].map((t) => {
                const isSelected = eventType === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setEventType(t.id as any);
                      if (t.id === 'high_cost_escalation') setSeverity('Critical');
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between duration-150 ${
                      isSelected
                        ? 'bg-gradient-to-br from-indigo-600/25 to-blue-600/10 border-indigo-500 text-white shadow-xl shadow-indigo-500/15 ring-1 ring-indigo-500/50'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <span className="font-bold text-xs">{t.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Severity & Target Entity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Severity Pill Selector */}
            <div>
              <label className="block text-slate-300 font-extrabold uppercase tracking-wider mb-2.5 text-[11px]">
                Severity Classification
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'Critical', color: 'bg-rose-500/20 text-rose-400 border-rose-500/40' },
                  { id: 'High', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
                  { id: 'Medium', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
                  { id: 'Low', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSeverity(s.id as any)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                      severity === s.id
                        ? `${s.color} ring-2 ring-indigo-500/50 shadow-md`
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {s.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Affected Purchase Order / Component */}
            <div>
              <label className="block text-slate-300 font-extrabold uppercase tracking-wider mb-2.5 text-[11px]">
                Target Purchase Order & Component
              </label>
              <select
                value={selectedPoId}
                onChange={(e) => setSelectedPoId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
              >
                {purchaseOrders.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.po_number} - {getComponentName(po.component_id)} ({getSupplierName(po.supplier_id)}) [₹{po.total_amount?.toLocaleString('en-IN')}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Scenario Attributes */}
          <div className="p-5 bg-slate-950/80 border border-slate-800/90 rounded-2xl space-y-4">
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
              Disruption Impact Parameters
            </span>

            {(eventType === 'supplier_delay' || eventType === 'logistics_delay') && (
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-xs">Reported Delivery Delay</span>
                  <p className="text-[10px] text-slate-400">Additional lead time before delivery arrival</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={delayDays}
                    onChange={(e) => setDelayDays(Number(e.target.value))}
                    className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white text-right focus:outline-none focus:border-indigo-500 font-mono font-bold"
                  />
                  <span className="text-slate-400 font-semibold text-xs">days</span>
                </div>
              </div>
            )}

            {eventType === 'quality_defect' && (
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-xs">Quarantined Defect Rate</span>
                  <p className="text-[10px] text-slate-400">Percentage of batch non-compliant with specs</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={defectRate}
                    onChange={(e) => setDefectRate(Number(e.target.value))}
                    className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white text-right focus:outline-none focus:border-indigo-500 font-mono font-bold"
                  />
                  <span className="text-slate-400 font-semibold text-xs">%</span>
                </div>
              </div>
            )}

            {eventType === 'high_cost_escalation' && (
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-xs">Estimated Recovery Spend (INR)</span>
                  <p className="text-[10px] text-slate-400">Amounts above ₹50,000 trigger Human Authorization</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-amber-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={costImpact}
                    onChange={(e) => setCostImpact(Number(e.target.value))}
                    className="w-32 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white text-right focus:outline-none focus:border-indigo-500 font-mono font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Natural Language Narrative Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-slate-300 font-extrabold uppercase tracking-wider text-[11px]">
                Event Narrative / Telemetry Description
              </label>
              <button
                type="button"
                onClick={() => setCustomDescription(getSuggestedDescription())}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Regenerate Default</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={customDescription || getSuggestedDescription()}
              onChange={(e) => setCustomDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed shadow-inner"
            />
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
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-xl shadow-indigo-600/30 flex items-center space-x-2 transition disabled:opacity-50"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{isSubmitting ? 'Injecting Disruption...' : 'Inject & Triage Disruption'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
