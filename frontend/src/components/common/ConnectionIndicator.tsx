import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionIndicatorProps {
  status?: 'live' | 'reconnecting' | 'offline';
}

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({ status = 'live' }) => {
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      {status === 'live' ? (
        <>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <Wifi className="w-3 h-3" /> Live
          </span>
        </>
      ) : status === 'reconnecting' ? (
        <>
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-amber-700 dark:text-amber-400">Reconnecting...</span>
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="text-rose-700 dark:text-rose-400 flex items-center gap-1">
            <WifiOff className="w-3 h-3" /> Offline
          </span>
        </>
      )}
    </div>
  );
};
