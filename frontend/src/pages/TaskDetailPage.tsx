import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { DeliveryTask, DeliveryEvent } from '../api/types';
import { StatusBadge } from '../components/common/StatusBadge';
import { UrgencyBadge } from '../components/common/UrgencyBadge';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { EtaBadge } from '../components/common/EtaBadge';
import { TaskTimeline } from '../components/task/TaskTimeline';
import { RerouteProposalCard } from '../components/task/RerouteProposalCard';
import {
  ArrowLeft,
  Package,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
} from 'lucide-react';
import { formatLocal } from '../lib/format';

export const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{ task: DeliveryTask; events: DeliveryEvent[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState(false);
  const [pickupQty, setPickupQty] = useState<number>(0);

  const loadData = () => {
    if (!id) return;
    setLoading(true);
    api.getTask(id).then((res) => {
      setData(res);
      setPickupQty(res.task.quantity);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-400">Loading delivery task...</div>;
  }

  if (!data) {
    return <div className="p-12 text-center text-sm text-slate-500">Task not found.</div>;
  }

  const { task, events } = data;

  const handleAcknowledge = async () => {
    setActionPending(true);
    await api.acknowledgeTask(task.id);
    setActionPending(false);
    loadData();
  };

  const handleConfirmPickup = async () => {
    setActionPending(true);
    await api.confirmPickup(task.id, pickupQty);
    setActionPending(false);
    loadData();
  };

  const handleConfirmDelivery = async () => {
    setActionPending(true);
    await api.confirmDelivery(task.id, task.pickedUpQty || task.quantity);
    setActionPending(false);
    loadData();
  };

  const handleAcceptReroute = async (proposalId: string) => {
    setActionPending(true);
    await api.acceptReroute(task.id, proposalId);
    setActionPending(false);
    loadData();
  };

  const handleDeclineReroute = async (reason: string) => {
    setActionPending(true);
    await api.declineReroute(task.id, reason);
    setActionPending(false);
    loadData();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/tasks" className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Available Tasks
        </Link>
      </div>

      {/* Main Task Header Card */}
      <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {task.category.replace(/_/g, ' ')}
              </span>
              <StatusBadge status={task.status} />
              <UrgencyBadge expiryUtc={task.expiryDeadlineUtc} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Deliver {task.quantity} {task.unit} to {task.siteName}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Task ID: {task.id} • Assigned: {task.claimedByAlias || 'Unclaimed'}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <CountdownTimer expiryUtc={task.expiryDeadlineUtc} className="text-sm px-3 py-1" />
            <EtaBadge minutes={task.etaMinutes} source={task.etaSource} />
          </div>
        </div>

        {/* Stepper Timeline */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <TaskTimeline status={task.status} />
        </div>
      </div>

      {/* Reroute Proposal Banner if Destination Shelter Changed */}
      {task.status === 'REROUTE_PROPOSED' && task.reroute && (
        <RerouteProposalCard
          proposal={task.reroute}
          originalSiteName={task.siteName}
          onAccept={handleAcceptReroute}
          onDecline={handleDeclineReroute}
        />
      )}

      {/* Action Execution Card */}
      <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
          Rider Operational Action
        </h3>

        {task.status === 'CLAIMED' && (
          <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
            <div>
              <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Step 1: Acknowledge Assignment
              </div>
              <div className="text-xs text-amber-800 dark:text-amber-300">
                Please acknowledge before claim TTL expires to unlock donor pickup contact details.
              </div>
            </div>
            <button
              onClick={handleAcknowledge}
              disabled={actionPending}
              className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 shadow-sm transition"
            >
              {actionPending ? 'Acknowledging...' : 'Acknowledge Delivery'}
            </button>
          </div>
        )}

        {task.status === 'ACKNOWLEDGED' && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
            <div>
              <div className="text-xs font-bold text-blue-900 dark:text-blue-200">
                Step 2: Arrive at Venue &amp; Confirm Pickup
              </div>
              <div className="text-xs text-blue-800 dark:text-blue-300">
                Verify parcel seals, tray count, and load safely into vehicle or cold bag.
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={pickupQty}
                onChange={(e) => setPickupQty(parseInt(e.target.value) || 0)}
                className="w-24 px-3 py-1.5 text-xs border rounded-lg bg-white dark:bg-slate-800"
              />
              <button
                onClick={handleConfirmPickup}
                disabled={actionPending}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 shadow-sm transition"
              >
                {actionPending ? 'Confirming...' : 'Confirm Loaded & Depart'}
              </button>
            </div>
          </div>
        )}

        {task.status === 'IN_TRANSIT' && (
          <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <div>
              <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                Step 3: Arrived at Destination Shelter
              </div>
              <div className="text-xs text-indigo-800 dark:text-indigo-300">
                Hand over goods to intake staff at {task.siteName}.
              </div>
            </div>
            <button
              onClick={handleConfirmDelivery}
              disabled={actionPending}
              className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 shadow-sm transition"
            >
              {actionPending ? 'Confirming...' : 'Confirm Handover at Shelter'}
            </button>
          </div>
        )}

        {task.status === 'DELIVERED' && (
          <div className="p-4 bg-teal-50 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-900 dark:text-teal-200">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              Delivery recorded. Awaiting verified receipt confirmation from {task.siteName} intake staff.
            </div>
            <Link
              to="/site/site_asha"
              className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline"
            >
              Simulate Shelter Verification →
            </Link>
          </div>
        )}

        {task.status === 'DELIVERED_VERIFIED' && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Verified Complete. Idempotent credits awarded to volunteer rider and donor impact tally.
          </div>
        )}
      </div>

      {/* Location Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h4 className="font-bold text-xs uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1.5 mb-2">
            <MapPin className="w-4 h-4" /> Pickup Location
          </h4>
          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            {task.pickupLocation.address}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Instructions: {task.handlingInstructions || 'Standard packaging. Keep containers upright.'}
          </div>
        </div>

        <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5 mb-2">
            <MapPin className="w-4 h-4" /> Destination Shelter
          </h4>
          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            {task.siteName}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {task.destinationLocation.address}
          </div>
        </div>
      </div>
    </div>
  );
};
