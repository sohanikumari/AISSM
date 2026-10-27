import React, { useState } from 'react';
import { api } from '../../api';
import { Play, RotateCcw, AlertTriangle, Users, Clock, ShieldCheck, Zap } from 'lucide-react';

export const SimulationPanel: React.FC<{ onActionComplete?: () => void }> = ({ onActionComplete }) => {
  const [running, setRunning] = useState<string | null>(null);
  const [zeroVolunteers, setZeroVolunteers] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const execute = async (name: string, fn: () => Promise<any>) => {
    setRunning(name);
    setMessage(null);
    try {
      const res = await fn();
      setMessage(`✓ ${name} succeeded.`);
      if (onActionComplete) onActionComplete();
    } catch (err: any) {
      setMessage(`✕ Error: ${err.message}`);
    } finally {
      setRunning(null);
    }
  };

  const handleToggleZeroVolunteers = async () => {
    const nextVal = !zeroVolunteers;
    setZeroVolunteers(nextVal);
    await execute(`Toggle Zero Volunteers (${nextVal ? 'ON' : 'OFF'})`, () =>
      api.sim.setZeroVolunteers(nextVal)
    );
  };

  return (
    <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-5 h-5 text-amber-500" />
        <h3 className="font-bold text-base text-slate-900 dark:text-white">Admin Simulation Console</h3>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Executes real domain logic against backend invariants for demonstrations and judges.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          onClick={() => execute('Seed Demo Baseline', () => api.sim.seedDemo())}
          disabled={!!running}
          className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
        >
          <RotateCcw className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Reset to 180-Meal Seed Data</span>
        </button>

        <button
          onClick={() => execute('Run Matching Engine', () => api.sim.runMatching('don_sharma_180'))}
          disabled={!!running}
          className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
        >
          <Play className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Run FEFO Matching Engine</span>
        </button>

        <button
          onClick={() => execute('Run Claim Expiry Worker', () => api.sim.runClaimExpiry())}
          disabled={!!running}
          className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
        >
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Trigger Claim TTL Worker</span>
        </button>

        <button
          onClick={() => execute('Set Asha Shelter FULL (Reroute Trigger)', () => api.setSiteStatus('site_asha', 'FULL', true))}
          disabled={!!running}
          className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
        >
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Simulate Shelter FULL (Reroute)</span>
        </button>

        <button
          onClick={handleToggleZeroVolunteers}
          disabled={!!running}
          className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs font-semibold transition ${
            zeroVolunteers
              ? 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              : 'border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>Zero Volunteers: {zeroVolunteers ? 'ACTIVE' : 'OFF'}</span>
        </button>

        <button
          onClick={() => execute('Run Expiry Sweeper', () => api.sim.runExpirySweeper())}
          disabled={!!running}
          className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
        >
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Run Food Expiry Sweeper</span>
        </button>
      </div>

      {running && (
        <div className="mt-3 p-2 text-xs font-semibold text-teal-700 bg-teal-50 dark:bg-teal-950/40 rounded flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
          Executing {running}...
        </div>
      )}

      {message && (
        <div className="mt-3 p-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded">
          {message}
        </div>
      )}
    </div>
  );
};
