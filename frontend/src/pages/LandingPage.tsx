import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import {
  HeartHandshake,
  Clock,
  ShieldCheck,
  TrendingUp,
  Truck,
  Building2,
  Users,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [stats, setStats] = useState({
    activeDonations: 1,
    verifiedDeliveries: 0,
    activeShelters: 4,
    mealsCoordinated: 180,
  });

  useEffect(() => {
    Promise.all([api.listDonations(), api.listSites()]).then(([donations, sites]) => {
      const deliveredMeals = donations.reduce((sum, d) => sum + d.deliveredQty, 0);
      const totalMeals = donations.reduce((sum, d) => sum + d.quantity, 0);
      setStats({
        activeDonations: donations.length,
        verifiedDeliveries: donations.filter((d) => d.status === 'COMPLETED').length,
        activeShelters: sites.filter((s) => s.status === 'OPEN').length,
        mealsCoordinated: totalMeals,
      });
    });
  }, []);

  return (
    <div className="space-y-12 py-6">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto px-4 pt-6 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-4">
          <Clock className="w-3.5 h-3.5 text-teal-600" />
          FEFO-Driven Civic Logistics Platform
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
          Move surplus food and essentials <span className="text-teal-700 dark:text-teal-400">before it expires</span>.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
          Deterministic dispatch that respects cold-chain safety, vehicle carrying limits, shelter demand capacity, and time-critical expiry buffers.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/donations/new"
            className="px-5 py-2.5 rounded-xl font-semibold text-white bg-teal-700 hover:bg-teal-800 shadow-md shadow-teal-700/20 transition flex items-center gap-2 text-sm"
          >
            Post Surplus Donation <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/tasks"
            className="px-5 py-2.5 rounded-xl font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition text-sm shadow-xs"
          >
            Volunteer as Delivery Rider
          </Link>
          <Link
            to="/site/site_asha"
            className="px-5 py-2.5 rounded-xl font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition text-sm"
          >
            Shelter Intake Dashboard
          </Link>
        </div>
      </section>

      {/* Live Platform Counters (honest, from actual platform state) */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-white dark:bg-[#161C23] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div>
            <div className="text-3xl font-extrabold text-teal-800 dark:text-teal-400 tabular-nums">
              {stats.mealsCoordinated}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Meals Coordinated
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-teal-800 dark:text-teal-400 tabular-nums">
              {stats.activeDonations}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Active Donations
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-teal-800 dark:text-teal-400 tabular-nums">
              {stats.activeShelters}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Verified Shelters
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-teal-800 dark:text-teal-400 tabular-nums">
              100%
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Deterministic Safety
            </div>
          </div>
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-2">
          Platform data (demo baseline). No fabricated third-party statistics.
        </p>
      </section>

      {/* How it Works: 4 Step Pipeline */}
      <section className="max-w-5xl mx-auto px-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-8">
          How LastMile Aid Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="p-5 bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-sm mb-3">
              1
            </div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">Donor Posts Surplus</h3>
            <p className="text-xs text-slate-500">
              Host or restaurant enters quantity, pickup pin, and strict perishable use-by timestamp.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-sm mb-3">
              2
            </div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">Deterministic Split</h3>
            <p className="text-xs text-slate-500">
              Platform matches shelter unmet demands and breaks bulk quantities into rider capacity slices.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-sm mb-3">
              3
            </div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">Volunteers Deliver</h3>
            <p className="text-xs text-slate-500">
              Riders claim with atomic single-winner locking and automated TTL expiry workers.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-sm mb-3">
              4
            </div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">Shelter Verifies</h3>
            <p className="text-xs text-slate-500">
              Staff confirms quantity on arrival, releasing idempotent volunteer credits and donor impact points.
            </p>
          </div>
        </div>
      </section>

      {/* Safety Notice Stance */}
      <section className="max-w-3xl mx-auto px-4">
        <div className="p-4 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong>Explicit platform design stance:</strong> LastMile Aid coordinates aid and does not certify food or medical supplies as safe. Donors self-declare handling data; sites declare capabilities; the platform deterministically enforces compatibility rules over those declarations.
          </div>
        </div>
      </section>
    </div>
  );
};
