import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { ReceivingSite, DeliveryTask, SiteStatus, Capability } from '../api/types';
import { SiteStatusSwitch } from '../components/site/SiteStatusSwitch';
import { DemandEditor } from '../components/site/DemandEditor';
import { CapabilityToggles } from '../components/site/CapabilityToggles';
import { StatusBadge } from '../components/common/StatusBadge';
import { Building2, PackageCheck, Truck, ShieldCheck, Check } from 'lucide-react';

export const ShelterOperationsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const siteId = id || 'site_asha';
  const [site, setSite] = useState<ReceivingSite | null>(null);
  const [tasks, setTasks] = useState<DeliveryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [verifyQty, setVerifyQty] = useState<number>(0);
  const [verifyNote, setVerifyNote] = useState<string>('Delivered in fresh and hygienic condition');

  const loadData = () => {
    setLoading(true);
    Promise.all([api.getSite(siteId), api.availableTasks()]).then(([s, allTasks]) => {
      setSite(s);
      // Find incoming or delivered tasks for this shelter
      api.listDonations().then((donations) => {
        // Collect all tasks for this site
        const siteTasks: DeliveryTask[] = [];
        Promise.all(donations.map((d) => api.getDonation(d.id))).then((results) => {
          results.forEach((r) => {
            r.tasks.forEach((t) => {
              if (t.siteId === siteId) siteTasks.push(t);
            });
          });
          setTasks(siteTasks);
          setLoading(false);
        });
      });
    });
  };

  useEffect(() => {
    loadData();
  }, [siteId]);

  const handleChangeStatus = async (status: SiteStatus) => {
    if (!site) return;
    await api.setSiteStatus(site.id, status, true);
    loadData();
  };

  const handleUpdateDemand = async (category: string, unit: string, demandQty: number) => {
    if (!site) return;
    await api.setSiteDemand(site.id, { category, unit, demandQty });
    loadData();
  };

  const handleToggleCapability = async (cap: Capability, value: boolean) => {
    if (!site) return;
    await api.setSiteCapability(site.id, cap, value);
    loadData();
  };

  const handleConfirmReceipt = async (taskId: string) => {
    await api.verifyReceipt(taskId, verifyQty, verifyNote);
    setVerifyingTaskId(null);
    loadData();
  };

  if (loading || !site) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading shelter operations...</div>;
  }

  const incomingDeliveries = tasks.filter((t) => ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(t.status));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {site.orgName}
              </span>
              <StatusBadge status={site.status} />
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> {site.verification}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{site.name}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{site.address} • Contact: {site.contactPhone || '+91-11-23456789'}</p>
          </div>

          <div>
            <span className="text-xs text-slate-400 block mb-1 font-medium">Facility Intake State:</span>
            <SiteStatusSwitch currentStatus={site.status} onChangeStatus={handleChangeStatus} />
          </div>
        </div>
      </div>

      {/* Incoming Deliveries & Verification */}
      <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <Truck className="w-4 h-4 text-teal-600" /> Incoming &amp; Arrived Deliveries ({incomingDeliveries.length})
        </h3>

        {incomingDeliveries.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-lg">
            No active in-flight or awaiting deliveries for this shelter at this moment.
          </div>
        ) : (
          <div className="space-y-3">
            {incomingDeliveries.map((t) => (
              <div key={t.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {t.quantity} {t.unit} ({t.category.replace(/_/g, ' ')})
                    </span>
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Rider: {t.claimedByAlias || 'Assigned Rider'} • From: {t.pickupLocation.address}
                  </div>
                </div>

                <div>
                  {t.status === 'DELIVERED' ? (
                    verifyingTaskId === t.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={verifyQty}
                          onChange={(e) => setVerifyQty(parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800"
                        />
                        <button
                          onClick={() => handleConfirmReceipt(t.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Confirm Receipt
                        </button>
                        <button
                          onClick={() => setVerifyingTaskId(null)}
                          className="text-xs text-slate-500 hover:text-slate-800"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setVerifyingTaskId(t.id);
                          setVerifyQty(t.deliveredQty || t.quantity);
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
                      >
                        <PackageCheck className="w-4 h-4" /> Verify Intake &amp; Award Credits
                      </button>
                    )
                  ) : (
                    <span className="text-xs font-medium text-slate-500">
                      In Transit • {t.etaMinutes || 15} min ETA
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Demand Editor & Capability Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DemandEditor demand={site.demand} onUpdateDemand={handleUpdateDemand} />
        </div>
        <div>
          <CapabilityToggles capabilities={site.capabilities} onToggle={handleToggleCapability} />
        </div>
      </div>
    </div>
  );
};
