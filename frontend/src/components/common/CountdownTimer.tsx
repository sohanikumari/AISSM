import React from 'react';
import { useCountdown } from '../../hooks/useCountdown';
import { cn } from '../../lib/cn';

interface CountdownTimerProps {
  expiryUtc?: string;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ expiryUtc, className }) => {
  const { formatted, isExpired, secondsLeft } = useCountdown(expiryUtc);

  return (
    <span
      className={cn(
        'font-mono tabular-nums text-xs font-semibold px-2 py-0.5 rounded',
        isExpired
          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
          : secondsLeft < 1800
          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
          : secondsLeft < 7200
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        className
      )}
      aria-live="polite"
    >
      ⏱ {formatted}
    </span>
  );
};
