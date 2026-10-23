import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { ReceivingSite } from '../api/types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Building2, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';
import { CAPABILITIES_LABELS } from '../lib/constants';

export const NgoDirectoryPage: React.FC = () => {
  const [sites, setSites] = useState<ReceivingSite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.listSites().then((list) => {
      setSites(list);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Certified NGO &amp; Shelter Directory</h1>
        <p className="text-xs text-slate-500 mt-1">
          Registered and verified facilities receiving food and emergency provisions across the metropolitan area.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading shelter directory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sites.map((site) => (
            <div key={site.id} className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">{site.orgName}</span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">{site.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={site.status} />
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> {site.verification}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{site.address}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Verified Facility Capabilities:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(site.capabilities)
                    .filter(([_, val]) => val)
                    .map(([cap]) => (
                      <span key={cap} className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[11px] font-medium">
                        ✓ {CAPABILITIES_LABELS[cap as keyof typeof CAPABILITIES_LABELS] || cap}
                      </span>
                    ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400 font-mono">
                  Needs: {site.demand.map((d) => `${d.demandQty} ${d.unit} ${d.category}`).join(', ')}
                </span>
                <Link
                  to={`/site/${site.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                >
                  Manage Facility <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
