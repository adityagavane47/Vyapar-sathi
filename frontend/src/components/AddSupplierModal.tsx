import React, { useState } from 'react';
import {
  Building2,
  X,
  Plus,
  ShieldCheck,
  Award,
  Clock,
  Package,
  Mail,
  Sliders,
  Check,
  Sparkles,
  CheckCircle2
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-8 py-5 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Add New Supplier to Twin</h3>
              <p className="text-xs text-slate-400">
                Register a new vendor partner in the supply chain twin catalog
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
        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Supplier Name & Code Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-bold uppercase tracking-wider mb-2 text-[11px]">
                Supplier Company Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bharat Micro Circuits Pvt Ltd"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans shadow-inner"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider mb-2 text-[11px]">
                Supplier Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-indigo-300 font-mono font-bold focus:outline-none focus:border-indigo-500 shadow-inner"
              />
            </div>
          </div>

          {/* Contact Email & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider mb-2 text-[11px]">
                Business Contact Email
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="orders@bharatmicro.in"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans shadow-inner"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider mb-2 text-[11px]">
                Vendor Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans shadow-inner"
              >
                <option value="Active">Active Tier-1 Partner</option>
                <option value="Preferred Partner">Preferred Strategic Partner</option>
                <option value="Onboarding">Onboarding / Evaluation</option>
              </select>
            </div>
          </div>

          {/* Metrics Sliders / Inputs */}
          <div className="p-5 bg-slate-950/80 border border-slate-800/90 rounded-2xl space-y-4">
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
              Operational Reliability & Capacity Benchmarks
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Reliability Score */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span>Reliability Score SLA:</span>
                  <span className="font-mono font-bold text-emerald-400">{reliabilityScore}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="99"
                  step="0.5"
                  value={reliabilityScore}
                  onChange={(e) => setReliabilityScore(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Quality Rating */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span>Quality Rating (Max 5.0):</span>
                  <span className="font-mono font-bold text-indigo-400">{qualityRating} / 5.0</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="5.0"
                  step="0.1"
                  value={qualityRating}
                  onChange={(e) => setQualityRating(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Standard Lead Time */}
              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                  Standard Delivery Lead Time (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="45"
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Weekly Capacity */}
              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                  Weekly Capacity (Units)
                </label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Quality Certifications Tags */}
          <div>
            <label className="block text-slate-300 font-bold uppercase tracking-wider mb-2.5 text-[11px]">
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
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    <span>{cert}</span>
                  </button>
                );
              })}
            </div>
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
              <Plus className="w-4 h-4" />
              <span>Register Supplier</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
