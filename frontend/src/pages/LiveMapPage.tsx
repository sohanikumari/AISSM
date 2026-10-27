import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Donation, ReceivingSite, DeliveryTask } from '../api/types';
import { LiveMap } from '../components/map/LiveMap';
import { MapPin } from 'lucide-react';

export const LiveMapPage: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [sites, setSites] = useState<ReceivingSite[]>([]);
  const [tasks, setTasks] = useState<DeliveryTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.listDonations(), api.listSites(), api.availableTasks()]).then(
      ([dons, sList, tList]) => {
        setDonations(dons);
        setSites(sList);
        setTasks(tList);
        setLoading(false);
      }
    );
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-6 h-6 text-teal-700 dark:text-teal-400" />
          Live Platform Dispatch Map
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time spatial visualization of donor pickups, certified intake shelters, and active transit paths.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading spatial map data...</div>
      ) : (
        <LiveMap donations={donations} sites={sites} tasks={tasks} />
      )}
    </div>
  );
};
