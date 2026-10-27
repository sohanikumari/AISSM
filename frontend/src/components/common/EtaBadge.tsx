import React from 'react';
import { Navigation } from 'lucide-react';
import { cn } from '../../lib/cn';

interface EtaBadgeProps {
  minutes?: number;
  source?: 'provider' | 'mock' | 'mock_fallback';
  className?: string;
}

export const EtaBadge: React.FC<EtaBadgeProps> = ({ minutes, source = 'mock', className }) => {
  if (minutes === undefined) return null;

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300', className)}>
      <Navigation className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
      <span className="font-semibold text-slate-900 dark:text-white">{minutes} min ETA</span>
      {source !== 'provider' && (
        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 rounded border border-teal-200 dark:border-teal-800">
          Estimated (mock)
        </span>
      )}
    </span>
  );
};
