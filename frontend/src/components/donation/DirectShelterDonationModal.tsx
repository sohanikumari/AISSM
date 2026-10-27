import React, { useState } from 'react';
import { ReceivingSite } from '../../api/types';
import { api } from '../../api';
import { ITEM_CATEGORIES, CAPABILITIES_LABELS } from '../../lib/constants';
import {
  HeartHandshake,
  Building2,
  Package,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  X,
  Truck,
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DirectShelterDonationModalProps {
  site: ReceivingSite;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DirectShelterDonationModal: React.FC<DirectShelterDonationModalProps> = ({
  site,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [category, setCategory] = useState(site.demand[0]?.category || 'COOKED_MEAL');
  const [quantity, setQuantity] = useState(site.demand[0]?.demandQty || 50);
  const [unit, setUnit] = useState(site.demand[0]?.unit || 'meals');
  const [description, setDescription] = useState(`Fresh meal donation for ${site.name}`);
  const [address, setAddress] = useState('Central Community Kitchen, Sector 4');
  const [minutesToExpiry, setMinutesToExpiry] = useState(180);
  const [deliveryMode, setDeliveryMode] = useState<'VOLUNTEER' | 'DIRECT'>('VOLUNTEER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successDonationId, setSuccessDonationId] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedCategoryObj = ITEM_CATEGORIES.find((c) => c.code === category);

  // Check if shelter accepts this category
  const acceptsCategory = site.acceptedCategories.includes(category);
  // Check required capabilities
  const missingCaps = (selectedCategoryObj?.requiredCapabilities || []).filter(
    (cap) => !site.capabilities[cap]
  );
  const isCompatible = acceptsCategory && missingCaps.length === 0;

  const handleSelectPresetNeed = (item: typeof site.demand[0]) => {
    setCategory(item.category);
    setUnit(item.unit);
    const needed = Math.max(10, item.demandQty - item.reservedQty);
    setQuantity(needed);
    setDescription(`Direct provision fulfillment for ${site.name} (${needed} ${item.unit})`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCompatible) {
      setError(`Notice: This shelter does not currently support ${category.replace(/_/g, ' ')} safety requirements.`);
      return;
    }

    setLoading(true);
    setError(null);

    const now = new Date();
    const expiryDate = new Date(now.getTime() + minutesToExpiry * 60 * 1000);

    try {
      const don = await api.createDonation({
        category,
        description,
        quantity: Number(quantity),
        unit,
        pickup: {
          lat: 28.618,
          lng: 77.21,
          address,
        },
        availableFromUtc: now.toISOString(),
        expiryUtc: expiryDate.toISOString(),
        handlingInstructions: `Direct donation for ${site.name}. Please deliver directly to facility staff.`,
        requiredCapabilities: selectedCategoryObj?.requiredCapabilities || [],
        mode: 'VOLUNTEER',
        targetSiteId: site.id,
        targetSiteName: site.name,
      });

      setSuccessDonationId(don.id);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit direct donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out]">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1 text-teal-200 text-xs font-semibold uppercase tracking-wider">
            <HeartHandshake className="w-4 h-4" /> Direct Shelter Aid &amp; Sponsorship
          </div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Donate to {site.name}
            <span className="text-[11px] font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Verified NGO
            </span>
          </h2>
          <p className="text-xs text-teal-100/90 mt-1">
            {site.address} • Managed by {site.orgName}
          </p>
        </div>

        {successDonationId ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Direct Donation Dispatched!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Thank you! <strong>{quantity} {unit}</strong> of {category.replace(/_/g, ' ')} has been allocated directly to <strong>{site.name}</strong>. Delivery riders have been notified.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={() => {
                  onClose();
                  navigate(`/donations/${successDonationId}`);
                }}
                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                Track Live Delivery <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Shelter Active Needs Presets */}
            {site.demand.length > 0 && (
              <div className="bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-teal-900 dark:text-teal-300 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Current Unmet Needs (Click to Fulfill):
                  </span>
                  <span className="text-[10px] text-teal-700 dark:text-teal-400 font-medium">1-Click Fill</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {site.demand.map((item) => {
                    const remaining = Math.max(0, item.demandQty - item.reservedQty);
                    const isSelected = category === item.category;
                    return (
                      <button
                        key={item.category}
                        type="button"
                        onClick={() => handleSelectPresetNeed(item)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium text-left transition flex items-center gap-2 ${
                          isSelected
                            ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                            : 'bg-white dark:bg-slate-800 border-teal-300 dark:border-teal-700 text-slate-700 dark:text-slate-300 hover:border-teal-500'
                        }`}
                      >
                        <span>{item.category.replace(/_/g, ' ')}:</span>
                        <span className={`font-bold font-mono text-[11px] ${isSelected ? 'text-teal-100' : 'text-teal-700 dark:text-teal-400'}`}>
                          {remaining} {item.unit} needed
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Category & Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Item Category
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    const d = site.demand.find((item) => item.category === e.target.value);
                    if (d) setUnit(d.unit);
                  }}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-teal-500"
                >
                  {ITEM_CATEGORIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 font-mono"
                    required
                  />
                </div>
                <div className="w-24">
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

            {/* Compatibility Badge Indicator */}
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              isCompatible
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300'
            }`}>
              {isCompatible ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">
                  {isCompatible
                    ? `✓ Verified Safe: ${site.name} accepts this food and possesses required storage & handling capabilities.`
                    : `⚠️ Notice: ${site.name} ${!acceptsCategory ? 'does not accept this category' : `lacks capabilities: ${missingCaps.join(', ')}`}.`}
                </p>
              </div>
            </div>

            {/* Description & Pickup */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description / Notes
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                placeholder="e.g. 50 warm nutritious packed meals"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pickup Location
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Safe Expiry Window
                </label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={minutesToExpiry}
                    onChange={(e) => setMinutesToExpiry(parseInt(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-mono"
                  >
                    <option value={90}>1.5 Hours (Ultra Fresh)</option>
                    <option value={180}>3.0 Hours (Cooked Standard)</option>
                    <option value={360}>6.0 Hours</option>
                    <option value={1440}>24 Hours (Bakery / Produce)</option>
                    <option value={4320}>3 Days (Packaged Goods)</option>
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 text-xs text-rose-700 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200">
                {error}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !isCompatible}
                className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md"
              >
                {loading ? 'Routing to Shelter...' : 'Confirm & Dispatch to Shelter'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
