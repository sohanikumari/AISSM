import React from 'react';
import { Capability } from '../../api/types';
import { CAPABILITIES_LABELS } from '../../lib/constants';
import { ShieldCheck } from 'lucide-react';

interface CapabilityTogglesProps {
  capabilities: Record<Capability, boolean>;
  onToggle: (capability: Capability, value: boolean) => Promise<void>;
}

export const CapabilityToggles: React.FC<CapabilityTogglesProps> = ({ capabilities, onToggle }) => {
  const caps: Capability[] = [
    'CLEAN_WATER',
    'COOKING_FUEL',
    'REFRIGERATION',
    'INFANT_CARE_PROCEDURE',
    'DRY_STORAGE',
  ];

  return (
    <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-5 h-5 text-teal-700 dark:text-teal-400" />
        <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
          Certified Facility Capabilities
        </h4>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Dispatch engine verifies these safety parameters before assigning perishable or raw rations to this site.
      </p>

      <div className="space-y-2.5">
        {caps.map((cap) => {
          const isEnabled = capabilities[cap] || false;
          return (
            <label
              key={cap}
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition"
            >
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                {CAPABILITIES_LABELS[cap]}
              </span>
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => onToggle(cap, e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
};
