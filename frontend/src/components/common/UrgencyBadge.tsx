import React from 'react';
import { Clock, AlertTriangle, Flame, XCircle } from 'lucide-react';
import { getUrgency, Urgency } from '../../lib/urgency';
import { useServerClock } from '../../hooks/useServerClock';
import { cn } from '../../lib/cn';

interface UrgencyBadgeProps {
  expiryUtc: string;
  className?: string;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ expiryUtc, className }) => {
  const { now } = useServerClock();
  const urgency: Urgency = getUrgency(expiryUtc, now.toISOString());

  switch (urgency) {
    case 'CRITICAL':
      return (
        <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-700 animate-pulse', className)}>
          <Flame className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> Critical (&lt;30m)
        </span>
      );
    case 'URGENT':
      return (
        <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700', className)}>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Urgent
        </span>
      );
    case 'EXPIRED':
      return (
        <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400', className)}>
          <XCircle className="w-3.5 h-3.5 text-slate-500" /> Expired
        </span>
      );
    case 'NORMAL':
    default:
      return (
        <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700', className)}>
          <Clock className="w-3.5 h-3.5 text-slate-500" /> Normal (&gt;2h)
        </span>
      );
  }
};
