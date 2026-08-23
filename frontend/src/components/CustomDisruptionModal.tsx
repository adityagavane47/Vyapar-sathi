import React, { useState } from 'react';
import {
  ShieldAlert,
  X,
  Sparkles,
  AlertTriangle,
  Clock,
  Layers,
  IndianRupee,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-8 py-5 bg-gradient-to-r from-indigo-50/70 via-white to-cyan-50/70 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#6366F1] border border-indigo-200 flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h3 className="text-lg font-black text-[#0F172A]">Inject Custom Disruption Scenario</h3>
                <span className="text-[10px] uppercase font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#6366F1] border border-indigo-200">
                  Custom Event Builder
                </span>
              </div>
              <p className="text-xs text-[#475569] mt-0.5">
                Parameterize supply chain disruption signals and observe real-time autonomous triage.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 text-xs">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] text-[#EF4444] flex items-center space-x-2 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Disruption Category Selector */}
          <div>
            <label className="block text-[#0F172A] font-extrabold uppercase tracking-wider mb-2.5 text-[11px]">
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
                        ? 'bg-indigo-50/90 border-2 border-[#6366F1] text-[#0F172A] shadow-md ring-1 ring-[#6366F1]/30'
                        : 'bg-white border-slate-200 text-[#475569] hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[#6366F1]' : 'text-slate-400'}`} />
                      <span className="font-bold text-xs text-[#0F172A]">{t.label}</span>
                    </div>
                    <span className="text-[10px] text-[#475569] mt-2 line-clamp-2 leading-relaxed">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Severity & Target Entity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Severity Pill Selector */}
            <div>
              <label className="block text-[#0F172A] font-extrabold uppercase tracking-wider mb-2.5 text-[11px]">
                Severity Classification
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'Critical', color: 'bg-[#FEE2E2] text-[#EF4444] border-[#FECACA]' },
                  { id: 'High', color: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]' },
                  { id: 'Medium', color: 'bg-[#CFFAFE] text-[#0891B2] border-[#A5F3FC]' },
                  { id: 'Low', color: 'bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSeverity(s.id as any)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                      severity === s.id
                        ? `${s.color} ring-2 ring-[#6366F1]/50 shadow-sm`
                        : 'bg-white border-slate-200 text-[#475569] hover:bg-slate-50'
                    }`}
                  >
                    {s.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Affected Purchase Order / Component */}
            <div>
              <label className="block text-[#0F172A] font-extrabold uppercase tracking-wider mb-2.5 text-[11px]">
                Target Purchase Order & Component
              </label>
              <select
                value={selectedPoId}
                onChange={(e) => setSelectedPoId(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#6366F1] font-sans"
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
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <span className="text-[11px] font-extrabold text-[#6366F1] uppercase tracking-wider block">
              Disruption Impact Parameters
            </span>

            {(eventType === 'supplier_delay' || eventType === 'logistics_delay') && (
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#0F172A] text-xs">Reported Delivery Delay</span>
                  <p className="text-[10px] text-[#475569]">Additional lead time before delivery arrival</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={delayDays}
                    onChange={(e) => setDelayDays(Number(e.target.value))}
                    className="w-24 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-[#0F172A] text-right focus:outline-none focus:border-[#6366F1] font-mono font-bold"
                  />
                  <span className="text-[#475569] font-semibold text-xs">days</span>
                </div>
              </div>
            )}

            {eventType === 'quality_defect' && (
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#0F172A] text-xs">Quarantined Defect Rate</span>
                  <p className="text-[10px] text-[#475569]">Percentage of batch non-compliant with specs</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={defectRate}
                    onChange={(e) => setDefectRate(Number(e.target.value))}
                    className="w-24 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-[#0F172A] text-right focus:outline-none focus:border-[#6366F1] font-mono font-bold"
                  />
                  <span className="text-[#475569] font-semibold text-xs">%</span>
                </div>
              </div>
            )}

            {eventType === 'high_cost_escalation' && (
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#0F172A] text-xs">Estimated Recovery Spend (INR)</span>
                  <p className="text-[10px] text-[#475569]">Amounts above ₹50,000 trigger Human Authorization</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[#D97706] font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={costImpact}
                    onChange={(e) => setCostImpact(Number(e.target.value))}
                    className="w-32 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-[#0F172A] text-right focus:outline-none focus:border-[#6366F1] font-mono font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Natural Language Narrative Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[#0F172A] font-extrabold uppercase tracking-wider text-[11px]">
                Event Narrative / Telemetry Description
              </label>
              <button
                type="button"
                onClick={() => setCustomDescription(getSuggestedDescription())}
                className="text-[11px] text-[#6366F1] hover:text-[#4F46E5] font-semibold flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Regenerate Default</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={customDescription || getSuggestedDescription()}
              onChange={(e) => setCustomDescription(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-2xl p-3.5 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#6366F1] font-sans leading-relaxed shadow-2xs"
            />
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
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#6366F1] to-[#22D3EE] hover:brightness-110 text-white shadow-md shadow-indigo-600/25 flex items-center space-x-2 transition disabled:opacity-50 hover:-translate-y-0.5"
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
