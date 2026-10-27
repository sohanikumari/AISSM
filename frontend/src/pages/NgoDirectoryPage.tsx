import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { ReceivingSite } from '../api/types';
import { StatusBadge } from '../components/common/StatusBadge';
import { DirectShelterDonationModal } from '../components/donation/DirectShelterDonationModal';
import {
  Building2,
  ShieldCheck,
  MapPin,
  ArrowRight,
  HeartHandshake,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  Phone,
  Flame,
  Snowflake,
  Droplets,
  PackageCheck
} from 'lucide-react';
import { CAPABILITIES_LABELS } from '../lib/constants';

export const NgoDirectoryPage: React.FC = () => {
  const [sites, setSites] = useState<ReceivingSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSiteForDonation, setSelectedSiteForDonation] = useState<ReceivingSite | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'MEALS' | 'REFRIGERATED' | 'HIGH_DEMAND'>('ALL');

  const loadData = () => {
    setLoading(true);
    api.listSites().then((list) => {
      setSites(list);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalDemandMeals = sites.reduce((sum, s) => {
    return sum + s.demand.reduce((dSum, d) => dSum + d.demandQty, 0);
  }, 0);

  const totalReservedMeals = sites.reduce((sum, s) => {
    return sum + s.demand.reduce((dSum, d) => dSum + d.reservedQty, 0);
  }, 0);

  const filteredSites = sites.filter((site) => {
    const matchesSearch =
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.orgName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.address.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'MEALS') {
      return site.acceptedCategories.includes('COOKED_MEAL');
    }
    if (filterType === 'REFRIGERATED') {
      return site.capabilities.REFRIGERATION === true;
    }
    if (filterType === 'HIGH_DEMAND') {
      const remaining = site.demand.reduce((sum, d) => sum + (d.demandQty - d.reservedQty), 0);
      return remaining > 30;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner / Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" /> Verified Community Aid Network
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Verified NGO &amp; Shelter Directory
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            Direct provisions &amp; food aid to certified relief facilities. Each facility is audited for hygienic storage, refrigeration, and verified capacity limits.
          </p>
        </div>

        {/* Aggregate Stats Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-teal-700/50">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-teal-300">{sites.length}</div>
            <div className="text-[11px] text-teal-200/80 font-medium">Verified Facilities</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-amber-300">{totalDemandMeals}</div>
            <div className="text-[11px] text-teal-200/80 font-medium">Total Aid Units Demanded</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-300">{totalReservedMeals}</div>
            <div className="text-[11px] text-teal-200/80 font-medium">Allocated / In Delivery</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">100%</div>
            <div className="text-[11px] text-teal-200/80 font-medium">Verified Compliance</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by shelter name, NGO, or neighborhood..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-[#161C23] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterType === 'ALL'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            All Shelters ({sites.length})
          </button>
          <button
            onClick={() => setFilterType('HIGH_DEMAND')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
              filterType === 'HIGH_DEMAND'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" /> High Demand
          </button>
          <button
            onClick={() => setFilterType('MEALS')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterType === 'MEALS'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            🍲 Cooked Meals
          </button>
          <button
            onClick={() => setFilterType('REFRIGERATED')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
              filterType === 'REFRIGERATED'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Snowflake className="w-3.5 h-3.5 text-sky-500" /> Cold Storage
          </button>
        </div>
      </div>

      {/* Shelter Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading verified facilities...</div>
      ) : filteredSites.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-[#161C23] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">No shelters match your criteria</h3>
          <p className="text-xs text-slate-500">Try adjusting your search terms or filter selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSites.map((site) => {
            const totalDemand = site.demand.reduce((sum, d) => sum + d.demandQty, 0);
            const totalReserved = site.demand.reduce((sum, d) => sum + d.reservedQty, 0);
            const unmet = Math.max(0, totalDemand - totalReserved);
            const percentFilled = totalDemand > 0 ? Math.min(100, Math.round((totalReserved / totalDemand) * 100)) : 100;

            return (
              <div
                key={site.id}
                className="group bg-white dark:bg-[#161C23] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-teal-500/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                        {site.orgName}
                      </span>
                      <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mt-0.5 group-hover:text-teal-800 dark:group-hover:text-teal-300 transition">
                        {site.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{site.address}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <StatusBadge status={site.status} />
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified
                      </span>
                    </div>
                  </div>

                  {/* Real-time Demand Fulfillment Meter */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Real-time Aid Demand:
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-500">
                        {totalReserved} / {totalDemand} filled ({percentFilled}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentFilled >= 100
                            ? 'bg-emerald-500'
                            : percentFilled >= 50
                            ? 'bg-teal-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${percentFilled}%` }}
                      />
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {site.demand.map((d) => (
                        <span
                          key={d.category}
                          className="text-[11px] font-medium px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        >
                          {d.category.replace(/_/g, ' ')}: <strong>{d.demandQty - d.reservedQty} {d.unit} needed</strong>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Verified Capabilities */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Facility Capabilities:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(site.capabilities)
                        .filter(([_, val]) => val)
                        .map(([cap]) => (
                          <span
                            key={cap}
                            className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/50 text-teal-800 dark:text-teal-300 text-[10px] font-semibold"
                          >
                            ✓ {CAPABILITIES_LABELS[cap as keyof typeof CAPABILITIES_LABELS] || cap}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <Link
                    to={`/site/${site.id}`}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 transition flex items-center gap-1"
                  >
                    Facility Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => setSelectedSiteForDonation(site)}
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm hover:shadow"
                  >
                    <HeartHandshake className="w-4 h-4" /> Donate to this Shelter
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Direct Donation Modal */}
      {selectedSiteForDonation && (
        <DirectShelterDonationModal
          site={selectedSiteForDonation}
          isOpen={!!selectedSiteForDonation}
          onClose={() => setSelectedSiteForDonation(null)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
};
