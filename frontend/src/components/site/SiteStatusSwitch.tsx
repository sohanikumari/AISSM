import React, { useState } from 'react';
import { SiteStatus } from '../../api/types';
import { CheckCircle2, Ban, Lock } from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface SiteStatusSwitchProps {
  currentStatus: SiteStatus;
  onChangeStatus: (status: SiteStatus) => Promise<void>;
}

export const SiteStatusSwitch: React.FC<SiteStatusSwitchProps> = ({ currentStatus, onChangeStatus }) => {
  const [pendingStatus, setPendingStatus] = useState<SiteStatus | null>(null);

  const handleSelect = (status: SiteStatus) => {
    if (status === currentStatus) return;
    if (status === 'FULL' || status === 'CLOSED') {
      setPendingStatus(status);
    } else {
      onChangeStatus(status);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
        <button
          type="button"
          onClick={() => handleSelect('OPEN')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
            currentStatus === 'OPEN'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> Open for Intake
        </button>

        <button
          type="button"
          onClick={() => handleSelect('FULL')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
            currentStatus === 'FULL'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <Ban className="w-4 h-4" /> Capacity Full
        </button>

        <button
          type="button"
          onClick={() => handleSelect('CLOSED')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
            currentStatus === 'CLOSED'
              ? 'bg-slate-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <Lock className="w-4 h-4" /> Facility Closed
        </button>
      </div>

      <ConfirmDialog
        isOpen={!!pendingStatus}
        title={`Set Shelter Status to ${pendingStatus}?`}
        message={`Switching to ${pendingStatus} will immediately evaluate in-flight deliveries and propose feasible rerouting to alternative shelters.`}
        confirmText={`Set as ${pendingStatus}`}
        isDestructive={pendingStatus === 'CLOSED'}
        onConfirm={() => {
          if (pendingStatus) onChangeStatus(pendingStatus);
          setPendingStatus(null);
        }}
        onCancel={() => setPendingStatus(null)}
      />
    </>
  );
};
