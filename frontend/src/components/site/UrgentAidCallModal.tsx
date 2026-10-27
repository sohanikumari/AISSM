import React, { useState } from 'react';
import { ReceivingSite } from '../../api/types';
import { api } from '../../api';
import { mockRealtime } from '../../realtime/mockRealtime';
import { ITEM_CATEGORIES } from '../../lib/constants';
import {
  Siren,
  Building2,
  X,
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface UrgentAidCallModalProps {
  site: ReceivingSite;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const UrgentAidCallModal: React.FC<UrgentAidCallModalProps> = ({
  site,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [category, setCategory] = useState('COOKED_MEAL');
  const [quantity, setQuantity] = useState(60);
  const [unit, setUnit] = useState('meals');
  const [urgency, setUrgency] = useState<'CRITICAL' | 'HIGH'>('CRITICAL');
  const [neededWithinHours, setNeededWithinHours] = useState(2);
  const [note, setNote] = useState('Emergency intake for arriving displaced families. Hot meals urgently needed.');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Update site demand
      await api.setSiteDemand(site.id, {
        category,
        unit,
        demandQty: quantity,
      });

      // 2. Broadcast priority notification
      mockRealtime.emit('shelter.urgent_aid_call', {
        siteId: site.id,
        siteName: site.name,
        category,
        quantity,
        unit,
        urgency,
        neededWithinHours,
        note,
      });

      // Also emit a general donation/task alert so riders and donors are alerted
      mockRealtime.emit('task.available', {
        siteName: site.name,
        quantity,
        unit,
        category,
        title: `🚨 URGENT SHELTER CALL: ${site.name}`,
        body: `Needs ${quantity} ${unit} of ${category.replace(/_/g, ' ')} within ${neededWithinHours}h!`,
      });

      setSuccess(true);
      if (onSuccess) onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out]">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-600 via-rose-700 to-amber-700 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1 text-red-200 text-xs font-semibold uppercase tracking-wider">
            <Siren className="w-4 h-4 animate-pulse" /> Emergency Resource Broadcast
          </div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Publish Urgent Aid Request
          </h2>
          <p className="text-xs text-red-100/90 mt-1">
            Broadcast an immediate call for food & provisions to all donors and community helpers.
          </p>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Emergency Call Broadcasted!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Your urgent requirement for <strong>{quantity} {unit}</strong> of {category.replace(/_/g, ' ')} has been broadcast to donors and emergency volunteers across the network.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Required Provision
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                >
                  {ITEM_CATEGORIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Qty Needed
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-mono"
                    required
                  />
                </div>
                <div className="w-20">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Urgency Level
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                >
                  <option value="CRITICAL">🔴 CRITICAL (Immediate Need)</option>
                  <option value="HIGH">🟠 HIGH (Within few hours)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Time Window
                </label>
                <select
                  value={neededWithinHours}
                  onChange={(e) => setNeededWithinHours(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                >
                  <option value={1}>Within 1 Hour</option>
                  <option value={2}>Within 2 Hours</option>
                  <option value={4}>Within 4 Hours</option>
                  <option value={8}>Today Evening</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Situation Note for Donors &amp; Helpers
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                placeholder="Explain the urgency and recipient group"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
              >
                {loading ? 'Broadcasting...' : 'Broadcast Urgent Call Now'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
