import React from 'react';
import { Link } from 'react-router-dom';
import { Package, MapPin, ArrowRight } from 'lucide-react';
import { Donation } from '../../api/types';
import { StatusBadge } from '../common/StatusBadge';
import { UrgencyBadge } from '../common/UrgencyBadge';
import { CountdownTimer } from '../common/CountdownTimer';

export const DonationCard: React.FC<{ donation: Donation }> = ({ donation }) => {
  const total = donation.quantity;
  const verified = donation.deliveredQty;
  const inProgress = Math.max(0, donation.allocatedQty - donation.deliveredQty);
  const unallocated = Math.max(0, total - donation.allocatedQty);

  const verifiedPct = Math.round((verified / total) * 100);
  const inProgressPct = Math.round((inProgress / total) * 100);
  const unallocatedPct = Math.round((unallocated / total) * 100);

  return (
    <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-teal-500/50 transition">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {donation.category.replace(/_/g, ' ')}
            </span>
            <StatusBadge status={donation.status} />
          </div>
          <h3 className="font-semibold text-base text-slate-900 dark:text-white">
            {donation.description}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <UrgencyBadge expiryUtc={donation.expiryUtc} />
          <CountdownTimer expiryUtc={donation.expiryUtc} />
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
          <Package className="w-3.5 h-3.5 text-teal-600" />
          {donation.quantity} {donation.unit}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          {donation.pickup.address}
        </span>
      </div>

      {/* Segmented Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
          <span>Fulfillment Progress</span>
          <span>{verified} of {total} {donation.unit} delivered</span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div style={{ width: `${verifiedPct}%` }} className="bg-emerald-600 transition-all" title={`Verified: ${verified}`} />
          <div style={{ width: `${inProgressPct}%` }} className="bg-sky-500 transition-all" title={`In Progress: ${inProgress}`} />
          <div style={{ width: `${unallocatedPct}%` }} className="bg-slate-300 dark:bg-slate-700 transition-all" title={`Unallocated: ${unallocated}`} />
        </div>
        <div className="flex gap-4 mt-2 text-[11px] text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600" /> Verified ({verified})</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500" /> In Progress ({inProgress})</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" /> Unallocated ({unallocated})</span>
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <Link
          to={`/donations/${donation.id}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800"
        >
          View Details &amp; Task Splits <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
