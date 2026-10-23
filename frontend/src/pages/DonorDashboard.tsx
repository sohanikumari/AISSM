import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Donation } from '../api/types';
import { DonationCard } from '../components/donation/DonationCard';
import { EmptyState } from '../components/common/EmptyState';
import { PlusCircle, AlertTriangle, Package, CheckCircle2, Award, Clock } from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    api.listDonations().then((list) => {
      setDonations(list);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalQuantity = donations.reduce((sum, d) => sum + d.quantity, 0);
  const deliveredQuantity = donations.reduce((sum, d) => sum + d.deliveredQty, 0);
  const exceptions = donations.filter((d) => d.status === 'EXCEPTION' || d.status === 'NEEDS_ASSISTANCE');

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Donor Operations Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Sharma Wedding Hall — Track surplus posts, FEFO expiration times, and verified recipient distribution.
          </p>
        </div>
        <Link
          to="/donations/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" /> Post Surplus Food
        </Link>
      </div>

      {/* Exception Alert Banner */}
      {exceptions.length > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
              Operational Exception Detected ({exceptions.length})
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
              One or more donations require attention due to unmet shelter capacity or tight expiry deadlines.
            </p>
            <div className="mt-2 flex gap-2">
              <Link
                to={`/donations/${exceptions[0].id}`}
                className="text-xs font-bold text-amber-900 dark:text-amber-200 underline"
              >
                Inspect Exception &amp; Fallback to Open Gate →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-teal-600" /> Active Posts
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
            {donations.length}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Delivered (Verified)
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1 tabular-nums">
            {deliveredQuantity} <span className="text-xs font-normal text-slate-500">units</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-500" /> Impact Points
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
            {Math.floor(deliveredQuantity * 1.5)}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-600" /> Coordinated
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
            {totalQuantity}
          </div>
        </div>
      </div>

      {/* Active Donations Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Surplus Listings (FEFO Order)</h2>
          <span className="text-xs text-slate-500">Sorted by earliest expiry deadline</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading donations...</div>
        ) : donations.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No donations posted yet"
            description="Post your first surplus batch from a wedding, restaurant, or cafeteria to coordinate prompt delivery."
            actionText="Create Surplus Donation"
            onAction={() => {}}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {donations.map((d) => (
              <DonationCard key={d.id} donation={d} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
