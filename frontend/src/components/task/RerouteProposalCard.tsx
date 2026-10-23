import React, { useState } from 'react';
import { AlertTriangle, Route, Check, X } from 'lucide-react';
import { RerouteProposal } from '../../api/types';

interface RerouteProposalCardProps {
  proposal: RerouteProposal;
  originalSiteName: string;
  onAccept: (proposalId: string) => Promise<void>;
  onDecline: (reason: string) => Promise<void>;
}

export const RerouteProposalCard: React.FC<RerouteProposalCardProps> = ({
  proposal,
  originalSiteName,
  onAccept,
  onDecline,
}) => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600 rounded-xl p-5 my-4 shadow-md">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-lg bg-amber-500 text-white shrink-0 mt-0.5">
          <Route className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-200/70 dark:bg-amber-900 px-2 py-0.5 rounded">
              Shelter Status Changed
            </span>
            <span className="text-xs text-amber-700 dark:text-amber-400">Action Required</span>
          </div>
          <h4 className="text-base font-bold text-amber-950 dark:text-amber-200 mt-1">
            Destination "{originalSiteName}" is now Full or Closed
          </h4>
          <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
            The platform evaluated candidate shelters matching safety capabilities and deadline buffer.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#161C23] border border-amber-200 dark:border-amber-800 rounded-lg p-3.5 my-3">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Recommended Alternative Destination
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-base font-bold text-slate-900 dark:text-white">
            {proposal.newSiteName}
          </span>
          <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
            {proposal.etaMinutes} min travel time (Estimated, mock)
          </span>
        </div>
        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
          ✓ Arrives {proposal.deadlineHeadroomMinutes} minutes before safe expiry deadline.
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={() => onDecline('Rider unable to reach alternative location')}
          disabled={loading}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition"
        >
          Decline Reroute
        </button>
        <button
          onClick={() => onAccept(proposal.proposalId)}
          disabled={loading}
          className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
        >
          <Check className="w-4 h-4" /> Accept Reroute to {proposal.newSiteName}
        </button>
      </div>
    </div>
  );
};
