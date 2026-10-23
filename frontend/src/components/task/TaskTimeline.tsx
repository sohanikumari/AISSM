import React from 'react';
import { Check } from 'lucide-react';
import { TaskStatus } from '../../api/types';

interface TaskTimelineProps {
  status: TaskStatus;
}

const STEPS: { key: TaskStatus[]; label: string }[] = [
  { key: ['CLAIMED', 'ACKNOWLEDGED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'DELIVERED_VERIFIED'], label: 'Claimed' },
  { key: ['ACKNOWLEDGED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'DELIVERED_VERIFIED'], label: 'Acknowledged' },
  { key: ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'DELIVERED_VERIFIED'], label: 'Picked Up' },
  { key: ['IN_TRANSIT', 'DELIVERED', 'DELIVERED_VERIFIED'], label: 'In Transit' },
  { key: ['DELIVERED', 'DELIVERED_VERIFIED'], label: 'Delivered' },
  { key: ['DELIVERED_VERIFIED'], label: 'Verified' },
];

export const TaskTimeline: React.FC<TaskTimelineProps> = ({ status }) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />
        {STEPS.map((step, idx) => {
          const isDone = step.key.includes(status);
          const isCurrent = (step.key[0] === status) || (status === 'IN_TRANSIT' && step.label === 'In Transit');

          return (
            <div key={idx} className="flex flex-col items-center relative z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition ${
                  isDone
                    ? 'bg-teal-700 text-white ring-4 ring-white dark:ring-[#161C23]'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700'
                } ${isCurrent ? 'ring-teal-500/30' : ''}`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <span className={`text-[11px] font-medium mt-1.5 whitespace-nowrap ${isDone ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
