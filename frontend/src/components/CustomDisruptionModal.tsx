import React, { useState } from 'react';
import { ShieldAlert, X, Sparkles, AlertTriangle, Clock, Layers, IndianRupee } from 'lucide-react';
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
    } catch (err) {
      console.error('Error creating custom disruption:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Inject Custom Disruption</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Custom Event Builder
                </span>
              </h3>
              <p className="text-xs text-slate-400">Configure parameters to test autonomous triage and Pareto resolution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Disruption Type Selector */}
          <div>
            <label className="block text-slate-300 font-bold uppercase tracking-wider mb-2 text-[11px]">
              Disruption Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'supplier_delay', label: 'Supplier Delay', icon: Clock, desc: 'Production delay at vendor facility' },
                { id: 'quality_defect', label: 'Quality Defect', icon: AlertTriangle, desc: 'Batch inspection failure & quarantine' },
                { id: 'high_cost_escalation', label: 'High Cost (HITL)', icon: IndianRupee, desc: 'Cost > ₹50,000 requiring approval' },
                { id: 'inventory_shortage', label: 'Stock Shortage', icon: Layers, desc: 'Buffer stock depletion below safety level' },
                { id: 'logistics_delay', label: 'Freight Delay', icon: Clock, desc: 'In-transit carrier & customs holdup' },
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
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <span className="font-bold text-xs">{t.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 line-clamp-2">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Severity & Target Entity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Severity Pill Selector */}
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider mb-2 text-[11px]">
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
                    className={`py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      severity === s.id
                        ? `${s.color} ring-2 ring-indigo-500/50 shadow-md`
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {s.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Affected Purchase Order / Component */}
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider mb-2 text-[11px]">
                Target Purchase Order & Component
              </label>
              <select
                value={selectedPoId}
                onChange={(e) => setSelectedPoId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
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
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
              Disruption Impact Parameters
            </span>

            {(eventType === 'supplier_delay' || eventType === 'logistics_delay') && (
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white">Reported Delay Duration</span>
                  <p className="text-[10px] text-slate-400">Additional lead time before delivery arrival</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={delayDays}
                    onChange={(e) => setDelayDays(Number(e.target.value))}
                    className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white text-right focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <span className="text-slate-400 font-semibold">days</span>
                </div>
              </div>
            )}

            {eventType === 'quality_defect' && (
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white">Quarantined Defect Rate</span>
                  <p className="text-[10px] text-slate-400">Percentage of batch non-compliant with specs</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={defectRate}
                    onChange={(e) => setDefectRate(Number(e.target.value))}
                    className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white text-right focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <span className="text-slate-400 font-semibold">%</span>
                </div>
              </div>
            )}

            {eventType === 'high_cost_escalation' && (
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white">Estimated Recovery Cost (INR)</span>
                  <p className="text-[10px] text-slate-400">Amounts above ₹50,000 trigger Human Approval</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-amber-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={costImpact}
                    onChange={(e) => setCostImpact(Number(e.target.value))}
                    className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white text-right focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Natural Language Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                Event Narrative / Description
              </label>
              <button
                type="button"
                onClick={() => setCustomDescription(getSuggestedDescription())}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Regenerate Default</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={customDescription || getSuggestedDescription()}
              onChange={(e) => setCustomDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg shadow-indigo-500/25 flex items-center space-x-2 transition disabled:opacity-50"
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
