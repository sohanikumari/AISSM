import React from 'react';
import { Lightbulb, Truck, DoorOpen } from 'lucide-react';

interface ModeRecommendationProps {
  quantity: number;
  minutesRemaining: number;
  hasColdChain: boolean;
  onSelectMode: (mode: 'VOLUNTEER' | 'OPEN_GATE') => void;
  selectedMode: 'VOLUNTEER' | 'OPEN_GATE';
}

export const ModeRecommendation: React.FC<ModeRecommendationProps> = ({
  quantity,
  minutesRemaining,
  hasColdChain,
  onSelectMode,
  selectedMode,
}) => {
  // Recommendation rule logic
  const recommendOpenGate = minutesRemaining < 90 && quantity > 100 && !hasColdChain;
  const recommendedMode = recommendOpenGate ? 'OPEN_GATE' : 'VOLUNTEER';
  const explanation = recommendOpenGate
    ? 'Short expiry window (<90m) and high volume favor direct walk-in distribution to prevent transit latency.'
    : 'Volunteer delivery provides targeted distribution to verified shelters matching required handling capabilities.';

  return (
    <div className="bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-xl p-4 my-4">
      <div className="flex items-start gap-2.5 mb-3">
        <Lightbulb className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-teal-950 dark:text-teal-200">
            Platform Recommendation: {recommendedMode === 'VOLUNTEER' ? 'Volunteer Dispatch' : 'Open Gate Walk-in'}
          </h4>
          <p className="text-xs text-teal-800 dark:text-teal-300 mt-0.5">{explanation}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        <button
          type="button"
          onClick={() => onSelectMode('VOLUNTEER')}
          className={`flex items-start gap-3 p-3 rounded-lg border text-left transition ${
            selectedMode === 'VOLUNTEER'
              ? 'bg-white dark:bg-[#161C23] border-teal-600 shadow-sm ring-1 ring-teal-600'
              : 'bg-white/60 dark:bg-[#161C23]/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="p-2 rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Volunteer Delivery</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Dispatches to vetted shelters via coordinated riders.</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectMode('OPEN_GATE')}
          className={`flex items-start gap-3 p-3 rounded-lg border text-left transition ${
            selectedMode === 'OPEN_GATE'
              ? 'bg-white dark:bg-[#161C23] border-teal-600 shadow-sm ring-1 ring-teal-600'
              : 'bg-white/60 dark:bg-[#161C23]/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="p-2 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
            <DoorOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Open Gate (Walk-in)</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Recipients come directly to the venue during set window.</div>
          </div>
        </button>
      </div>
    </div>
  );
};
