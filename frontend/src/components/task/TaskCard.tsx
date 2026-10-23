import React, { useState } from 'react';
import { Package, MapPin, ShieldAlert, ArrowRight } from 'lucide-react';
import { DeliveryTask } from '../../api/types';
import { StatusBadge } from '../common/StatusBadge';
import { UrgencyBadge } from '../common/UrgencyBadge';
import { CountdownTimer } from '../common/CountdownTimer';
import { EtaBadge } from '../common/EtaBadge';

interface TaskCardProps {
  task: DeliveryTask;
  onClaim?: (taskId: string) => Promise<void>;
  riderCapacity?: number;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClaim, riderCapacity = 40 }) => {
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOverCapacity = task.quantity > riderCapacity;

  const handleClaim = async () => {
    if (!onClaim) return;
    setClaiming(true);
    setError(null);
    try {
      await onClaim(task.id);
    } catch (err: any) {
      setError(err.message || 'Someone else just claimed this task.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-teal-500/50 transition">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {task.category.replace(/_/g, ' ')}
          </span>
          <h4 className="font-semibold text-base text-slate-900 dark:text-white mt-1">
            {task.quantity} {task.unit} to {task.siteName}
          </h4>
        </div>
        <div className="flex flex-col items-end gap-1">
          <UrgencyBadge expiryUtc={task.expiryDeadlineUtc} />
          <CountdownTimer expiryUtc={task.expiryDeadlineUtc} />
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-4">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span><strong>Pickup:</strong> {task.pickupLocation.address}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span><strong>Drop:</strong> {task.destinationLocation.address}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <EtaBadge minutes={task.etaMinutes} source={task.etaSource} />
        {task.requiresColdBag && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            Cold Bag Required
          </span>
        )}
      </div>

      {error && (
        <div className="mb-3 p-2 text-xs font-medium text-rose-700 bg-rose-50 dark:bg-rose-950/40 rounded border border-rose-200 dark:border-rose-800 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
        <span className="text-xs text-slate-400">
          ID: {task.id.slice(0, 10)}
        </span>

        {task.status === 'OPEN' ? (
          <button
            onClick={handleClaim}
            disabled={claiming || isOverCapacity}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition ${
              isOverCapacity
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-teal-700 hover:bg-teal-800 text-white'
            }`}
          >
            {claiming ? 'Claiming...' : isOverCapacity ? 'Exceeds Capacity' : 'Claim Delivery'}
          </button>
        ) : (
          <StatusBadge status={task.status} />
        )}
      </div>
    </div>
  );
};
