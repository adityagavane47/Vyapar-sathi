import React, { useState } from 'react';
import {
  Building2,
  X,
  Plus,
  Check,
} from 'lucide-react';
import { Supplier } from '../types';

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSupplier: (supplier: Supplier) => void;
  existingCount: number;
}

export const AddSupplierModal: React.FC<AddSupplierModalProps> = ({
  isOpen,
  onClose,
  onAddSupplier,
  existingCount,
}) => {
  if (!isOpen) return null;

  const defaultCode = `SUP-${String(existingCount + 1).padStart(3, '0')}`;

  const [code, setCode] = useState<string>(defaultCode);
  const [name, setName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [reliabilityScore, setReliabilityScore] = useState<number>(92.0);
  const [qualityRating, setQualityRating] = useState<number>(4.7);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(5);
  const [maxCapacity, setMaxCapacity] = useState<number>(5000);
  const [status, setStatus] = useState<string>('Active');
  const [selectedCerts, setSelectedCerts] = useState<string[]>(['ISO9001']);
  const [error, setError] = useState<string | null>(null);

  const availableCerts = ['ISO9001', 'AS9100', 'IATF16949', 'ISO14001', 'RoHS', 'AEC-Q100'];

  const toggleCert = (cert: string) => {
    setSelectedCerts((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a valid supplier company name.');
      return;
    }
    if (!contactEmail.trim() || !contactEmail.includes('@')) {
      setError('Please provide a valid business email address.');
      return;
    }

    const newSupplier: Supplier = {
      id: Date.now(),
      code: code.trim() || defaultCode,
      name: name.trim(),
      contact_email: contactEmail.trim(),
      reliability_score: Number(reliabilityScore),
      quality_rating: Number(qualityRating),
      certifications: selectedCerts.length > 0 ? selectedCerts : ['ISO9001'],
      max_capacity: Number(maxCapacity),
      lead_time_days: Number(leadTimeDays),
      status: status || 'Active',
    };

    onAddSupplier(newSupplier);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-8 py-5 bg-gradient-to-r from-indigo-50/70 via-white to-cyan-50/70 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-[#6366F1] border border-indigo-200 flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#0F172A]">Add New Supplier to Twin</h3>
              <p className="text-xs text-[#475569]">
                Register a new vendor partner in the supply chain twin catalog
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
        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3.5 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] text-[#EF4444] text-xs font-medium">
              {error}
            </div>
          )}

          {/* Supplier Name & Code Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[#0F172A] font-extrabold uppercase tracking-wider mb-2 text-[11px]">
                Supplier Company Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bharat Micro Circuits Pvt Ltd"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#6366F1] font-sans shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-[#0F172A] font-extrabold uppercase tracking-wider mb-2 text-[11px]">
                Supplier Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-[#6366F1] font-mono font-bold focus:outline-none focus:border-[#6366F1] shadow-2xs"
              />
            </div>
          </div>

          {/* Contact Email & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#0F172A] font-extrabold uppercase tracking-wider mb-2 text-[11px]">
                Business Contact Email
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="orders@bharatmicro.in"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#6366F1] font-sans shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-[#0F172A] font-extrabold uppercase tracking-wider mb-2 text-[11px]">
                Vendor Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#6366F1] font-sans shadow-2xs"
              >
                <option value="Active">Active Tier-1 Partner</option>
                <option value="Preferred Partner">Preferred Strategic Partner</option>
                <option value="Onboarding">Onboarding / Evaluation</option>
              </select>
            </div>
          </div>

          {/* Metrics Sliders / Inputs */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <span className="text-[11px] font-extrabold text-[#6366F1] uppercase tracking-wider block">
              Operational Reliability & Capacity Benchmarks
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Reliability Score */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[#475569] font-medium">
                  <span>Reliability Score SLA:</span>
                  <span className="font-mono font-bold text-[#059669]">{reliabilityScore}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="99"
                  step="0.5"
                  value={reliabilityScore}
                  onChange={(e) => setReliabilityScore(Number(e.target.value))}
                  className="w-full accent-[#6366F1] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Quality Rating */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[#475569] font-medium">
                  <span>Quality Rating (Max 5.0):</span>
                  <span className="font-mono font-bold text-[#6366F1]">{qualityRating} / 5.0</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="5.0"
                  step="0.1"
                  value={qualityRating}
                  onChange={(e) => setQualityRating(Number(e.target.value))}
                  className="w-full accent-[#6366F1] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Standard Lead Time */}
              <div>
                <label className="block text-[#475569] text-[11px] font-bold mb-1">
                  Standard Delivery Lead Time (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="45"
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-[#0F172A] font-mono focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              {/* Weekly Capacity */}
              <div>
                <label className="block text-[#475569] text-[11px] font-bold mb-1">
                  Weekly Capacity (Units)
                </label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-[#0F172A] font-mono focus:outline-none focus:border-[#6366F1]"
                />
              </div>
            </div>
          </div>

          {/* Quality Certifications Tags */}
          <div>
            <label className="block text-[#0F172A] font-extrabold uppercase tracking-wider mb-2.5 text-[11px]">
              Compliance & Quality Certifications
            </label>
            <div className="flex flex-wrap gap-2">
              {availableCerts.map((cert) => {
                const isSelected = selectedCerts.includes(cert);
                return (
                  <button
                    key={cert}
                    type="button"
                    onClick={() => toggleCert(cert)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-indigo-50 text-[#6366F1] border border-indigo-200 shadow-2xs font-extrabold'
                        : 'bg-white border border-slate-200 text-[#475569] hover:bg-slate-50'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#6366F1]" />}
                    <span>{cert}</span>
                  </button>
                );
              })}
            </div>
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
              <Plus className="w-4 h-4" />
              <span>Register Supplier</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
