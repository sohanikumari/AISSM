import React from 'react';
import {
  Clock,
  AlertTriangle,
  Flame,
  XCircle,
  CheckCircle2,
  Ban,
  Lock,
  CircleDot,
  Hourglass,
  ThumbsUp,
  Package,
  Truck,
  Route,
  PackageCheck,
  BadgeCheck,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
} from 'lucide-react';
import { cn } from '../../lib/cn';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  switch (status) {
    // Site statuses
    case 'OPEN':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800', className)}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Open
        </span>
      );
    case 'FULL':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800', className)}>
          <Ban className="w-3.5 h-3.5 text-amber-600" /> Full
        </span>
      );
    case 'CLOSED':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700', className)}>
          <Lock className="w-3.5 h-3.5 text-slate-500" /> Closed
        </span>
      );

    // Task statuses
    case 'AVAILABLE':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-200 dark:border-sky-800', className)}>
          <CircleDot className="w-3.5 h-3.5 text-sky-600" /> Available
        </span>
      );
    case 'CLAIMED':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800', className)}>
          <Hourglass className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Claimed — Awaiting Ack
        </span>
      );
    case 'ACKNOWLEDGED':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800', className)}>
          <ThumbsUp className="w-3.5 h-3.5 text-blue-600" /> Acknowledged
        </span>
      );
    case 'PICKED_UP':
    case 'IN_TRANSIT':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800', className)}>
          <Truck className="w-3.5 h-3.5 text-indigo-600" /> In Transit
        </span>
      );
    case 'REROUTE_PROPOSED':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700', className)}>
          <Route className="w-3.5 h-3.5 text-amber-600 animate-bounce" /> Reroute Proposed
        </span>
      );
    case 'DELIVERED':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-200 dark:border-teal-800', className)}>
          <PackageCheck className="w-3.5 h-3.5 text-teal-600" /> Delivered (Pending Verify)
        </span>
      );
    case 'DELIVERED_VERIFIED':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700', className)}>
          <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
        </span>
      );
    case 'FAILED_NO_DESTINATION':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800', className)}>
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> No Safe Destination
        </span>
      );

    // Donation statuses
    case 'PUBLISHED':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-200 dark:border-sky-800', className)}>
          <CircleDot className="w-3.5 h-3.5 text-sky-600" /> Published
        </span>
      );
    case 'ALLOCATED':
    case 'PARTIALLY_ALLOCATED':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800', className)}>
          <Package className="w-3.5 h-3.5 text-emerald-600" /> {status === 'ALLOCATED' ? 'Allocated' : 'Partially Allocated'}
        </span>
      );
    case 'OPEN_GATE':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800', className)}>
          <Route className="w-3.5 h-3.5 text-purple-600" /> Open Gate Walk-in
        </span>
      );
    case 'EXCEPTION':
    case 'NEEDS_ASSISTANCE':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800', className)}>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> {status === 'EXCEPTION' ? 'Exception' : 'Needs Assistance'}
        </span>
      );
    case 'COMPLETED':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700', className)}>
          <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" /> Completed
        </span>
      );
    case 'EXPIRED':
    case 'EXPIRED_UNDELIVERED':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800', className)}>
          <XCircle className="w-3.5 h-3.5 text-rose-600" /> Expired
        </span>
      );

    default:
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', className)}>
          {status}
        </span>
      );
  }
};
