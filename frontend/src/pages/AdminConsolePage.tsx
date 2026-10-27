import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Donation, ReceivingSite, DeliveryTask, DeliveryEvent } from '../api/types';
import { SimulationPanel } from '../components/admin/SimulationPanel';
import { StatusBadge } from '../components/common/StatusBadge';
import { UrgencyBadge } from '../components/common/UrgencyBadge';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { Terminal, Activity, History, Server } from 'lucide-react';
import { formatLocal } from '../lib/format';

export const AdminConsolePage: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [sites, setSites] = useState<ReceivingSite[]>([]);
  const [tasks, setTasks] = useState<DeliveryTask[]>([]);
  const [events, setEvents] = useState<DeliveryEvent[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadAll = () => {
    Promise.all([api.listDonations(), api.listSites(), api.availableTasks(), api.events()]).then(
      ([dons, sList, tList, evList]) => {
        setDonations(dons);
        setSites(sList);
        setTasks(tList);
        setEvents(evList);
      }
    );
  };

  useEffect(() => {
    loadAll();
  }, [refreshKey]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Terminal className="w-6 h-6 text-teal-700 dark:text-teal-400" />
            Admin Simulation Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulate operational failure modes, dispatch workers, and evaluate invariant compliance live.
          </p>
        </div>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          Refresh Board
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Controls */}
        <div className="space-y-4">
          <SimulationPanel onActionComplete={() => setRefreshKey((k) => k + 1)} />

          <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-teal-600" /> Platform Architecture Status
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Dispatch Algorithm:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">FEFO Deterministic Slicing</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Atomic Locking:</span>
                <span className="font-semibold text-emerald-600">Active (Single-winner)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Routing Estimator:</span>
                <span className="font-semibold text-teal-700">Haversine + Detour (Mock)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Safety Buffer:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">20 minutes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Live State Board */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b">
              <Activity className="w-4 h-4 text-emerald-600" /> Live Donations &amp; Expiries
            </h3>
            <div className="space-y-2.5">
              {donations.map((d) => (
                <div key={d.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{d.donorName}</span>
                    <StatusBadge status={d.status} />
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>{d.quantity} {d.unit}</span>
                    <CountdownTimer expiryUtc={d.expiryUtc} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b">
              <Activity className="w-4 h-4 text-teal-600" /> Shelter Statuses
            </h3>
            <div className="space-y-2">
              {sites.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{s.name}</span>
                  <StatusBadge status={s.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Event Log Feed */}
        <div>
          <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b">
              <History className="w-4 h-4 text-teal-600" /> Realtime Event Feed
            </h3>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {events.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-6">No events captured yet.</div>
              ) : (
                events.map((e) => (
                  <div key={e.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                      <span>{formatLocal(e.createdAtUtc, 'HH:mm:ss')}</span>
                      <span className="uppercase text-teal-700 dark:text-teal-400 font-bold">{e.type}</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-300">
                      Actor: {e.actor || 'system'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
