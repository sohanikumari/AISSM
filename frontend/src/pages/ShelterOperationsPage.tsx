import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { ReceivingSite, DeliveryTask, SiteStatus, Capability } from '../api/types';
import { SiteStatusSwitch } from '../components/site/SiteStatusSwitch';
import { DemandEditor } from '../components/site/DemandEditor';
import { CapabilityToggles } from '../components/site/CapabilityToggles';
import { StatusBadge } from '../components/common/StatusBadge';
import { DirectShelterDonationModal } from '../components/donation/DirectShelterDonationModal';
import { UrgentAidCallModal } from '../components/site/UrgentAidCallModal';
import {
  Building2,
  PackageCheck,
  Truck,
  ShieldCheck,
  Check,
  Siren,
  HeartHandshake,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Phone
} from 'lucide-react';

export const ShelterOperationsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const siteId = id || 'site_asha';
  const [site, setSite] = useState<ReceivingSite | null>(null);
  const [tasks, setTasks] = useState<DeliveryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [verifyQty, setVerifyQty] = useState<number>(0);
  const [verifyNote, setVerifyNote] = useState<string>('Delivered in fresh and hygienic condition');
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showUrgentCallModal, setShowUrgentCallModal] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([api.getSite(siteId), api.availableTasks()]).then(([s, allTasks]) => {
      setSite(s);
      // Find incoming or delivered tasks for this shelter
      api.listDonations().then((donations) => {
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
    return <div className="p-16 text-center text-xs text-slate-400">Loading shelter operations...</div>;
  }

  const incomingDeliveries = tasks.filter((t) => ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(t.status));
  const verifiedCount = tasks.filter((t) => t.status === 'DELIVERED_VERIFIED').length;
  const totalDemand = site.demand.reduce((sum, d) => sum + d.demandQty, 0);
  const totalReserved = site.demand.reduce((sum, d) => sum + d.reservedQty, 0);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/ngos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-700 dark:hover:text-teal-400 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Shelter Directory
        </Link>
        <span className="text-xs font-mono text-slate-400">Facility ID: {site.id}</span>
      </div>

      {/* Top Banner */}
      <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                {site.orgName}
              </span>
              <StatusBadge status={site.status} />
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> {site.verification} Facility
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{site.name}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {site.address} • Phone: {site.contactPhone || '+91-11-23456789'}
            </p>
          </div>

          {/* Quick Actions & Status Control */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              onClick={() => setShowUrgentCallModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Siren className="w-3.5 h-3.5 animate-pulse" /> Urgent Aid Call
            </button>
            <button
              onClick={() => setShowDonateModal(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <HeartHandshake className="w-3.5 h-3.5" /> Donate to Shelter
            </button>
          </div>
        </div>

        {/* Shelter KPI Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Total Registered Demand</span>
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">{totalDemand} units</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Reserved / In Delivery</span>
            <span className="text-lg font-bold font-mono text-teal-600 dark:text-teal-400">{totalReserved} units</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Active In-Flight Deliveries</span>
            <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">{incomingDeliveries.length} tasks</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Verified Completed Intake</span>
            <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">{verifiedCount} deliveries</span>
          </div>
        </div>

        {/* Status Switcher in footer of banner */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500 font-medium">Facility Gate Intake Capacity Status:</span>
          <SiteStatusSwitch currentStatus={site.status} onChangeStatus={handleChangeStatus} />
        </div>
      </div>

      {/* Incoming Deliveries & Verification */}
      <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-teal-600" /> Incoming &amp; Arrived Deliveries ({incomingDeliveries.length})
          </h3>
          <span className="text-xs text-slate-400">Real-time rider tracking</span>
        </div>

        {incomingDeliveries.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            No active in-flight deliveries awaiting receipt for this shelter at this moment.
          </div>
        ) : (
          <div className="space-y-3">
            {incomingDeliveries.map((t) => (
              <div key={t.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 hover:border-teal-500/40 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {t.quantity} {t.unit} ({t.category.replace(/_/g, ' ')})
                    </span>
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Rider: {t.claimedByAlias || 'Volunteer Courier'} • From: {t.pickupLocation.address}
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
                          className="w-20 px-2 py-1 text-xs border rounded-lg bg-white dark:bg-slate-800 font-mono"
                        />
                        <button
                          onClick={() => handleConfirmReceipt(t.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1"
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
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
                      >
                        <PackageCheck className="w-4 h-4" /> Verify Intake &amp; Award Credits
                      </button>
                    )
                  ) : (
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
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

      {/* Modals */}
      <DirectShelterDonationModal
        site={site}
        isOpen={showDonateModal}
        onClose={() => setShowDonateModal(false)}
        onSuccess={loadData}
      />

      <UrgentAidCallModal
        site={site}
        isOpen={showUrgentCallModal}
        onClose={() => setShowUrgentCallModal(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
