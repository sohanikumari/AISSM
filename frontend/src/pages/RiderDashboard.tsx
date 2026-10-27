import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { DeliveryTask } from '../api/types';
import { StatusBadge } from '../components/common/StatusBadge';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { Truck, ShieldCheck, Award, ArrowRight, Check, MapPin, Navigation } from 'lucide-react';

export const RiderDashboard: React.FC = () => {
  const [activeTask, setActiveTask] = useState<DeliveryTask | null>(null);
  const [capacity, setCapacity] = useState(40);
  const [hasColdBag, setHasColdBag] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [radiusKm, setRadiusKm] = useState(15);
  const [savedTime, setSavedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([api.availableTasks(), api.getAvailability()]).then(([tasks, avail]) => {
      // Find task claimed by current user (rider1 in demo)
      const myTask = tasks.find((t) => t.claimedBy === 'rider1' || ['CLAIMED', 'ACKNOWLEDGED', 'PICKED_UP', 'IN_TRANSIT'].includes(t.status));
      if (myTask) setActiveTask(myTask);
      if (avail) {
        setCapacity(avail.capacityQty || 40);
        setHasColdBag(!!avail.hasColdBag);
        setIsAvailable(avail.isAvailable !== false);
        setRadiusKm(avail.radiusKm || 15);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveAvailability = async () => {
    await api.setAvailability({
      isAvailable,
      capacityQty: capacity,
      capacityUnit: 'meals',
      hasColdBag,
      radiusKm,
    });
    setSavedTime(new Date().toLocaleTimeString());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Volunteer Rider Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">
          Rahul (Rider 1) — Manage transport capacity, active assignments, and verified delivery proofs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Task & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {activeTask ? (
            <div className="bg-white dark:bg-[#161C23] border border-teal-500/50 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2.5 py-1 rounded">
                  Current Assigned Delivery
                </span>
                <StatusBadge status={activeTask.status} />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Deliver {activeTask.quantity} {activeTask.unit} to {activeTask.siteName}
              </h3>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 my-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>Pickup: {activeTask.pickupLocation.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-indigo-600" />
                  <span>Destination: {activeTask.destinationLocation.address}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Safe Window:</span>
                  <CountdownTimer expiryUtc={activeTask.expiryDeadlineUtc} />
                </div>
                <Link
                  to={`/tasks/${activeTask.id}`}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  Action Step →
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl">
              <Truck className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="font-semibold text-base text-slate-900 dark:text-white">No active task claimed</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Explore open aid requests in your radius. Single-winner claim locks ensure you are protected from race conditions.
              </p>
              <Link
                to="/tasks"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Browse Available Tasks <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Impact Snapshot */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" /> Volunteer Credits
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">90 pts</div>
              <div className="text-xs text-emerald-600 font-medium mt-0.5">Rank #1 on Local Leaderboard</div>
            </div>

            <div className="p-4 bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" /> Verified Deliveries
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">6 drops</div>
              <div className="text-xs text-slate-500 mt-0.5">100% on-time receipt proofs</div>
            </div>
          </div>
        </div>

        {/* Right Column: Availability & Transport Capacity Settings */}
        <div>
          <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 pb-2 border-b">
              <Truck className="w-4 h-4 text-teal-600" /> Carrier Profile &amp; Capacity
            </h3>

            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 cursor-pointer">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Available for New Dispatches
              </span>
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Max Carrying Capacity (Meals / Units)
              </label>
              <input
                type="number"
                min="10"
                max="200"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                PRD Invariant: Tasks exceeding this limit cannot be claimed.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dispatch Radius: {radiusKm} km
              </label>
              <input
                type="range"
                min="1"
                max="25"
                value={radiusKm}
                onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>

            <label className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Insulated Cold Bag Equipped
                </span>
                <span className="text-[11px] text-slate-400">Enables cold-chain perishable tasks</span>
              </div>
              <input
                type="checkbox"
                checked={hasColdBag}
                onChange={(e) => setHasColdBag(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
            </label>

            <button
              onClick={handleSaveAvailability}
              className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              Save Carrier Settings
            </button>

            {savedTime && (
              <div className="text-[11px] text-emerald-600 text-center font-medium">
                ✓ Saved at {savedTime}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
