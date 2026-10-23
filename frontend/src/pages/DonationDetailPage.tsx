import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { Donation, DeliveryTask, DeliveryEvent } from '../api/types';
import { StatusBadge } from '../components/common/StatusBadge';
import { UrgencyBadge } from '../components/common/UrgencyBadge';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { AllocationTable } from '../components/donation/AllocationTable';
import {
  Package,
  MapPin,
  Clock,
  DoorOpen,
  ArrowLeft,
  AlertTriangle,
  History,
  CheckCircle2,
} from 'lucide-react';
import { formatLocal } from '../lib/format';

export const DonationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{ donation: Donation; tasks: DeliveryTask[]; events: DeliveryEvent[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  const loadData = () => {
    if (!id) return;
    setLoading(true);
    api.getDonation(id).then((res) => {
      setData(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleOpenGateFallback = async () => {
    if (!data) return;
    setSwitching(true);
    const now = new Date();
    await api.switchToOpenGate(data.donation.id, {
      opensAtUtc: now.toISOString(),
      closesAtUtc: data.donation.expiryUtc,
      instructions: 'Walk in directly to Main Banquet Hall counter for immediate hot meal collection.',
    });
    setSwitching(false);
    loadData();
  };

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-400">Loading donation details...</div>;
  }

  if (!data) {
    return <div className="p-12 text-center text-sm text-slate-500">Donation not found.</div>;
  }

  const { donation, tasks, events } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/donor" className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {donation.category.replace(/_/g, ' ')}
              </span>
              <StatusBadge status={donation.status} />
              <UrgencyBadge expiryUtc={donation.expiryUtc} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {donation.description}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Posted by {donation.donorName} • Created {formatLocal(donation.createdAtUtc)}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <CountdownTimer expiryUtc={donation.expiryUtc} className="text-sm px-3 py-1" />
            <span className="text-xs text-slate-400 font-mono">
              Expiry: {formatLocal(donation.expiryUtc, 'p, MMM d')}
            </span>
          </div>
        </div>

        {/* Exception Box if in EXCEPTION or NEEDS_ASSISTANCE */}
        {(donation.status === 'EXCEPTION' || donation.status === 'NEEDS_ASSISTANCE') && (
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-xl">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                  Operational Warning: {donation.status}
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                  {donation.exceptionReason || 'Candidate destination shelters or riders could not fulfill the remaining quantity before safe expiry.'}
                </p>
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={handleOpenGateFallback}
                    disabled={switching}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 flex items-center gap-1.5 shadow-xs"
                  >
                    <DoorOpen className="w-3.5 h-3.5" />
                    {switching ? 'Switching...' : 'Fallback: Switch to Open Gate (Walk-in)'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Total Quantity:</span>
            <span className="font-bold text-slate-900 dark:text-white text-base">
              {donation.quantity} {donation.unit}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Allocated via Tasks:</span>
            <span className="font-bold text-teal-700 dark:text-teal-400 text-base">
              {donation.allocatedQty} {donation.unit}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Verified Delivered:</span>
            <span className="font-bold text-emerald-600 text-base">
              {donation.deliveredQty} {donation.unit}
            </span>
          </div>
        </div>
      </div>

      {/* Allocation Tasks Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Delivery Tasks Split ({tasks.length})
          </h2>
          <span className="text-xs text-slate-500">
            Capacity-sliced dispatch tasks
          </span>
        </div>
        <AllocationTable tasks={tasks} />
      </div>

      {/* Delivery Event Timeline */}
      <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <History className="w-4 h-4 text-teal-600" />
          Event Audit Trail
        </h3>
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="text-xs text-slate-400">No events logged yet.</div>
          ) : (
            events.map((ev) => (
              <div key={ev.id} className="flex items-start gap-3 text-xs border-l-2 border-teal-600 pl-3 py-1">
                <div className="font-mono text-slate-400 whitespace-nowrap">
                  {formatLocal(ev.createdAtUtc, 'HH:mm:ss')}
                </div>
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded mr-2">
                    {ev.type}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    Actor: {ev.actor || 'system'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
