import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { ReceivingSite } from '../api/types';
import { DirectShelterDonationModal } from '../components/donation/DirectShelterDonationModal';
import { useRoleStore } from '../hooks/useRole';
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
  Sparkles,
  Flame,
  UserCheck,
  Package,
  MapPin,
  ChevronRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveRole } = useRoleStore();
  const [sites, setSites] = useState<ReceivingSite[]>([]);
  const [selectedSiteForDonation, setSelectedSiteForDonation] = useState<ReceivingSite | null>(null);
  const [stats, setStats] = useState({
    activeDonations: 1,
    verifiedDeliveries: 0,
    activeShelters: 4,
    mealsCoordinated: 180,
  });

  useEffect(() => {
    Promise.all([api.listDonations(), api.listSites()]).then(([donations, siteList]) => {
      const deliveredMeals = donations.reduce((sum, d) => sum + d.deliveredQty, 0);
      const totalMeals = donations.reduce((sum, d) => sum + d.quantity, 0);
      setSites(siteList);
      setStats({
        activeDonations: donations.length,
        verifiedDeliveries: donations.filter((d) => d.status === 'COMPLETED').length,
        activeShelters: siteList.filter((s) => s.status === 'OPEN').length,
        mealsCoordinated: totalMeals,
      });
    });
  }, []);

  const handleRoleJump = (role: 'DONOR' | 'RIDER' | 'HELPER' | 'NGO_OPERATOR', path: string) => {
    setActiveRole(role);
    navigate(path);
  };

  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-teal-900 via-emerald-950 to-slate-950 text-white px-6 sm:px-12 py-12 sm:py-16 shadow-xl border border-teal-800/40">
        {/* Decorative background glow circles */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold backdrop-blur-sm">
            <Clock className="w-3.5 h-3.5 text-teal-300" />
            FEFO-Driven Autonomous Civic Logistics
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Deliver surplus food <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-100 bg-clip-text text-transparent">
              before it expires.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-teal-100/90 max-w-2xl mx-auto leading-relaxed font-normal">
            Smart routing platform matching wedding buffets, restaurants, and grocers to verified shelters. Guarantees cold-chain safety, vehicle capacity limits, and real-time expiration buffers.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/donations/new"
              className="px-6 py-3 rounded-xl font-bold text-sm text-teal-950 bg-gradient-to-r from-teal-300 to-emerald-300 hover:from-teal-200 hover:to-emerald-200 shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2"
            >
              Post Food Donation <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/ngos"
              className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-teal-300" /> Direct Shelter Aid Hub
            </Link>

            <Link
              to="/tasks"
              className="px-6 py-3 rounded-xl font-bold text-sm text-teal-200 hover:text-white bg-black/30 hover:bg-black/50 border border-teal-500/30 transition-all flex items-center gap-2"
            >
              <Truck className="w-4 h-4" /> Claim Delivery Tasks
            </Link>
          </div>
        </div>

        {/* Floating Quick Role Strip */}
        <div className="relative z-10 mt-10 pt-8 border-t border-teal-700/40">
          <p className="text-center text-[11px] font-bold uppercase tracking-wider text-teal-300/80 mb-3">
            Explore As Live Persona (1-Click Switch):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto">
            <button
              onClick={() => handleRoleJump('DONOR', '/donor')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition flex items-center gap-2.5"
            >
              <span className="text-xl">🥘</span>
              <div className="min-w-0 text-left">
                <div className="text-xs font-bold text-white">Food Donor</div>
                <div className="text-[10px] text-teal-300/80">Sharma Banquet</div>
              </div>
            </button>

            <button
              onClick={() => handleRoleJump('RIDER', '/rider')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition flex items-center gap-2.5"
            >
              <span className="text-xl">🚴</span>
              <div className="min-w-0 text-left">
                <div className="text-xs font-bold text-white">Volunteer Rider</div>
                <div className="text-[10px] text-teal-300/80">Rahul (40 meals)</div>
              </div>
            </button>

            <button
              onClick={() => handleRoleJump('HELPER', '/helper')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition flex items-center gap-2.5"
            >
              <span className="text-xl">🤝</span>
              <div className="min-w-0 text-left">
                <div className="text-xs font-bold text-white">Emergency Helper</div>
                <div className="text-[10px] text-teal-300/80">Nearby Alerts</div>
              </div>
            </button>

            <button
              onClick={() => handleRoleJump('NGO_OPERATOR', '/site/site_asha')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition flex items-center gap-2.5"
            >
              <span className="text-xl">🏠</span>
              <div className="min-w-0 text-left">
                <div className="text-xs font-bold text-white">Shelter Operator</div>
                <div className="text-[10px] text-teal-300/80">Asha Shelter</div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Live Platform Counters */}
      <section className="max-w-5xl mx-auto px-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-white dark:bg-[#161C23] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="space-y-1">
            <div className="text-3xl font-black text-teal-800 dark:text-teal-400 tabular-nums">
              {stats.mealsCoordinated}
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Meals Coordinated
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-teal-800 dark:text-teal-400 tabular-nums">
              {stats.activeDonations}
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Donations
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-teal-800 dark:text-teal-400 tabular-nums">
              {stats.activeShelters}
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Verified Shelters
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              100%
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Safety Verified
            </div>
          </div>
        </div>
      </section>

      {/* Spotlight: Verified Shelters in Need */}
      <section className="max-w-5xl mx-auto space-y-4 px-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              <Sparkles className="w-3.5 h-3.5" /> Direct Shelter Aid Hub
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              Verified Shelters Needing Urgent Food &amp; Aid
            </h2>
          </div>
          <Link
            to="/ngos"
            className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            View all {sites.length} shelters <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sites.slice(0, 4).map((site) => {
            const unmetMeals = site.demand.reduce((sum, d) => sum + (d.demandQty - d.reservedQty), 0);
            return (
              <div
                key={site.id}
                className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-teal-500/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                      {site.orgName.split(' ')[0]}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                      Verified
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">
                    {site.name}
                  </h3>

                  <p className="text-[11px] text-slate-500 truncate">
                    {site.address}
                  </p>

                  <div className="p-2.5 rounded-lg bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40">
                    <div className="text-[10px] text-slate-500 font-medium">Unmet Demand:</div>
                    <div className="text-sm font-extrabold font-mono text-teal-800 dark:text-teal-300">
                      {unmetMeals > 0 ? `${unmetMeals} units needed` : 'Capacity Satisfied'}
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Link
                    to={`/site/${site.id}`}
                    className="text-[11px] font-semibold text-slate-500 hover:text-teal-700"
                  >
                    Details
                  </Link>
                  <button
                    onClick={() => setSelectedSiteForDonation(site)}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                  >
                    <HeartHandshake className="w-3.5 h-3.5" /> Donate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it Works: 4 Step Pipeline */}
      <section className="max-w-5xl mx-auto px-2 space-y-6">
        <div className="text-center space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
            Automated Coordination Pipeline
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            How LastMile Aid Works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center font-black text-sm">
              1
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Donor Posts Surplus</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Host or restaurant enters quantity, pickup pin, and strict perishable use-by timestamp.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center font-black text-sm">
              2
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Deterministic Slicing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              System checks shelter demand and slices bulk donations into manageable 40-meal courier slices.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center font-black text-sm">
              3
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Volunteer Courier Pickup</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Riders claim with single-winner atomic locking and real-time TTL claim expiration sweeper.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center font-black text-sm">
              4
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Shelter Intake Verification</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Staff confirms verified quantity on arrival, releasing idempotent credits and donor audit logs.
            </p>
          </div>
        </div>
      </section>

      {/* Safety Stance Notice */}
      <section className="max-w-4xl mx-auto px-2">
        <div className="p-4 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong>Platform Safety Stance:</strong> LastMile Aid coordinates logistics and enforces capability matching rules over declarations. Donors declare handling data; shelters declare verified equipment (refrigeration, fuel, water).
          </div>
        </div>
      </section>

      {/* Direct Shelter Donation Modal */}
      {selectedSiteForDonation && (
        <DirectShelterDonationModal
          site={selectedSiteForDonation}
          isOpen={!!selectedSiteForDonation}
          onClose={() => setSelectedSiteForDonation(null)}
          onSuccess={() => {
            // refresh
            api.listSites().then(setSites);
          }}
        />
      )}
    </div>
  );
};
