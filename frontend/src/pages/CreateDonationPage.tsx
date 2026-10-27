import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { ReceivingSite } from '../api/types';
import { ITEM_CATEGORIES, CAPABILITIES_LABELS } from '../lib/constants';
import { ModeRecommendation } from '../components/donation/ModeRecommendation';
import { Package, MapPin, Clock, ShieldCheck, ArrowRight, Building2, Sparkles, CheckCircle2 } from 'lucide-react';

export const CreateDonationPage: React.FC = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('COOKED_MEAL');
  const [description, setDescription] = useState('180 fresh cooked vegetarian buffet meals');
  const [quantity, setQuantity] = useState(180);
  const [unit, setUnit] = useState('meals');
  const [address, setAddress] = useState('Sharma Wedding Hall, Main Banquet Road');
  const [handlingInstructions, setHandlingInstructions] = useState('Packed in clean catering trays of 20. Keep upright.');
  const [mode, setMode] = useState<'VOLUNTEER' | 'OPEN_GATE'>('VOLUNTEER');
  const [destinationType, setDestinationType] = useState<'AUTO' | 'DIRECT'>('AUTO');
  const [targetSiteId, setTargetSiteId] = useState<string>('');
  const [sites, setSites] = useState<ReceivingSite[]>([]);
  const [minutesToExpiry, setMinutesToExpiry] = useState(180); // default 3 hours
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listSites({ status: 'OPEN' }).then((list) => {
      setSites(list);
      if (list.length > 0) setTargetSiteId(list[0].id);
    });
  }, []);

  const selectedCategoryObj = ITEM_CATEGORIES.find((c) => c.code === category);
  const selectedSite = sites.find((s) => s.id === targetSiteId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const now = new Date();
    const expiryDate = new Date(now.getTime() + minutesToExpiry * 60 * 1000);

    try {
      const donation = await api.createDonation({
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
        handlingInstructions,
        requiredCapabilities: selectedCategoryObj?.requiredCapabilities || [],
        mode,
        targetSiteId: destinationType === 'DIRECT' ? targetSiteId : undefined,
        targetSiteName: destinationType === 'DIRECT' ? selectedSite?.name : undefined,
      });

      navigate(`/donations/${donation.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create donation');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Post Surplus Food or Aid</h1>
        <p className="text-xs text-slate-500 mt-1">
          Coordinate high-priority distribution before expiry. Invariants guarantee capacity and capability matching.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
        {/* Category & Item Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-800 dark:text-teal-400 flex items-center gap-1.5 border-b pb-2">
            <Package className="w-4 h-4" /> 1. Category &amp; Handling Declarations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Aid Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-teal-500"
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Contents
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              placeholder="e.g. Vegetarian cooked meal buffet from banquet hall"
              required
            />
          </div>

          {/* Live Capability Requirements Preview */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Required Destination Capabilities:</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {selectedCategoryObj?.requiredCapabilities.length === 0 ? (
                <span className="text-slate-500">None required (ready for immediate consumption)</span>
              ) : (
                selectedCategoryObj?.requiredCapabilities.map((cap) => (
                  <span key={cap} className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-medium">
                    ✓ {CAPABILITIES_LABELS[cap]}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Destination Target: Automatic vs Specific Shelter */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-800 dark:text-teal-400 flex items-center gap-1.5 border-b pb-2">
            <Building2 className="w-4 h-4" /> 2. Destination Shelter Strategy
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                destinationType === 'AUTO'
                  ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/40'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="destType"
                checked={destinationType === 'AUTO'}
                onChange={() => setDestinationType('AUTO')}
                className="mt-1 text-teal-600"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Automatic Algorithmic Matching (Recommended)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block leading-relaxed">
                  System matches closest verified shelter with unmet demand and verifies arrival safety buffer before expiry.
                </span>
              </div>
            </label>

            <label
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                destinationType === 'DIRECT'
                  ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/40'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="destType"
                checked={destinationType === 'DIRECT'}
                onChange={() => setDestinationType('DIRECT')}
                className="mt-1 text-teal-600"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Direct Shelter / NGO Donation
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block leading-relaxed">
                  Lock destination to a specific verified relief facility or food bank of your choice.
                </span>
              </div>
            </label>
          </div>

          {destinationType === 'DIRECT' && (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Choose Recipient Shelter
                </label>
                <select
                  value={targetSiteId}
                  onChange={(e) => setTargetSiteId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-medium"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.orgName}) — {s.address}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSite && (
                <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span>
                    Current Shelter Demand:{' '}
                    <strong>
                      {selectedSite.demand.find((d) => d.category === category)?.demandQty || 0}{' '}
                      {unit}
                    </strong>
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Destination Pre-Locked for Volunteer Riders
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pickup & Expiry */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-800 dark:text-teal-400 flex items-center gap-1.5 border-b pb-2">
            <MapPin className="w-4 h-4" /> 3. Pickup &amp; Safe Consumption Deadline
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pickup Address / Landmark
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Expiry / Safe Consumption Window (Minutes from now)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="45"
                value={minutesToExpiry}
                onChange={(e) => setMinutesToExpiry(parseInt(e.target.value) || 45)}
                className="w-32 px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
              <span className="text-xs text-slate-500">
                (Approx. {Math.round((minutesToExpiry / 60) * 10) / 10} hours)
              </span>
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
              ⚠️ Invariant Rule: Declared expiry or use-by date cannot be extended after posting.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Handling &amp; Packaging Notes
            </label>
            <textarea
              rows={2}
              value={handlingInstructions}
              onChange={(e) => setHandlingInstructions(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            />
          </div>
        </div>

        {/* Mode Recommendation */}
        <div className="pt-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-800 dark:text-teal-400 flex items-center gap-1.5 border-b pb-2 mb-2">
            <Clock className="w-4 h-4" /> 4. Distribution Strategy Recommendation
          </h3>
          <ModeRecommendation
            quantity={quantity}
            minutesRemaining={minutesToExpiry}
            hasColdChain={!!selectedCategoryObj?.requiresColdChain}
            selectedMode={mode}
            onSelectMode={setMode}
          />
        </div>

        {error && (
          <div className="p-3 text-xs text-rose-700 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => navigate('/donor')}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-sm font-semibold shadow-md transition flex items-center gap-2"
          >
            {loading ? 'Executing Dispatch Matching...' : 'Publish & Match Tasks'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
