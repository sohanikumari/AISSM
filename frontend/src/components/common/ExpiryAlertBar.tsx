import React, { useState, useCallback } from 'react';
import { AlertTriangle, Siren, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRealtimeEvent } from '../../hooks/useRealtimeEvent';
import { useCountdown } from '../../hooks/useCountdown';

interface ExpiringItem {
  id: string;         // taskId or donationId
  kind: 'task' | 'donation';
  siteName?: string;
  donorName?: string;
  quantity: number;
  unit: string;
  category: string;
  expiryUtc: string;  // we reconstruct from secondsLeft at event time
  level: 'WARNING' | 'CRITICAL';
  arrivedAt: number;  // Date.now() when we received the event
}

interface AlertRowProps {
  item: ExpiringItem;
  onDismiss: (id: string) => void;
}

/** Single row showing live countdown for one expiring item */
const AlertRow: React.FC<AlertRowProps> = ({ item, onDismiss }) => {
  const { formatted, secondsLeft, isExpired } = useCountdown(item.expiryUtc);
  const isCrit = item.level === 'CRITICAL' || secondsLeft < 300;

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0 text-xs
      ${isCrit
        ? 'bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-900'
        : 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900'
      }`}
    >
      {isCrit
        ? <Siren className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 animate-pulse" />
        : <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
      }

      <div className="flex-1 min-w-0">
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {item.quantity} {item.unit} · {item.category.replace(/_/g, ' ')}
        </span>
        {item.siteName && (
          <span className="text-slate-500 dark:text-slate-400"> → {item.siteName}</span>
        )}
        {item.donorName && (
          <span className="text-slate-500 dark:text-slate-400"> by {item.donorName}</span>
        )}
      </div>

      {/* Live countdown */}
      <span className={`font-mono font-bold tabular-nums shrink-0 px-2 py-0.5 rounded
        ${isCrit
          ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
          : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300'
        } ${isCrit && !isExpired ? 'animate-pulse' : ''}`}
      >
        {isExpired ? 'EXPIRED' : `⏱ ${formatted}`}
      </span>

      {/* Go to tasks */}
      {item.kind === 'task' && (
        <Link
          to="/tasks"
          className="shrink-0 flex items-center gap-1 font-semibold text-teal-700 dark:text-teal-400 hover:underline"
        >
          Claim <ArrowRight className="w-3 h-3" />
        </Link>
      )}

      <button
        onClick={() => onDismiss(item.id)}
        className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

/**
 * Sticky alert bar that appears at the top of the page when tasks/donations
 * are approaching expiry. Subscribes to 'task.expiring_soon' and
 * 'donation.expiring_soon' realtime events.
 */
export const ExpiryAlertBar: React.FC = () => {
  const [items, setItems] = useState<ExpiringItem[]>([]);

  const addItem = useCallback((id: string, kind: 'task' | 'donation', data: any) => {
    // Reconstruct expiryUtc from secondsLeft at event arrival time
    const expiryUtc = new Date(Date.now() + data.secondsLeft * 1000).toISOString();
    setItems((prev) => {
      // Update if already exists (level upgrade), otherwise add
      const exists = prev.find((i) => i.id === id);
      if (exists) {
        return prev.map((i) =>
          i.id === id ? { ...i, level: data.level, expiryUtc } : i
        );
      }
      return [
        { id, kind, siteName: data.siteName, donorName: data.donorName,
          quantity: data.quantity, unit: data.unit, category: data.category,
          expiryUtc, level: data.level, arrivedAt: Date.now() },
        ...prev,
      ].slice(0, 8); // max 8 alerts at once
    });
  }, []);

  const handleTaskExpiring = useCallback(
    (data: any) => addItem(data.taskId, 'task', data),
    [addItem],
  );

  const handleDonationExpiring = useCallback(
    (data: any) => addItem(data.donationId, 'donation', data),
    [addItem],
  );

  useRealtimeEvent('task.expiring_soon', handleTaskExpiring);
  useRealtimeEvent('donation.expiring_soon', handleDonationExpiring);

  const dismiss = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const dismissAll = () => setItems([]);

  if (items.length === 0) return null;

  const hasCritical = items.some((i) => i.level === 'CRITICAL');

  return (
    <div className={`rounded-xl overflow-hidden border shadow-md mb-4
      ${hasCritical
        ? 'border-red-300 dark:border-red-800'
        : 'border-amber-300 dark:border-amber-800'
      }`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2
        ${hasCritical
          ? 'bg-red-600 dark:bg-red-900 text-white'
          : 'bg-amber-500 dark:bg-amber-800 text-white'
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          {hasCritical
            ? <Siren className="w-4 h-4 animate-pulse" />
            : <AlertTriangle className="w-4 h-4" />
          }
          {hasCritical ? '🔴 CRITICAL — Items expiring within 5 minutes!' : '⚠️ Items expiring soon'}
          <span className="ml-1 px-1.5 py-0.5 rounded bg-white/20 font-mono">{items.length}</span>
        </div>
        <button
          onClick={dismissAll}
          className="text-white/70 hover:text-white text-xs underline"
        >
          Dismiss all
        </button>
      </div>

      {/* Alert rows */}
      <div>
        {items.map((item) => (
          <AlertRow key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </div>
  );
};
