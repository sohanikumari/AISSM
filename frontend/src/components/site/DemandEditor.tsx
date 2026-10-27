import React, { useState } from 'react';
import { SiteDemandItem } from '../../api/types';
import { Edit2, Check, X } from 'lucide-react';

interface DemandEditorProps {
  demand: SiteDemandItem[];
  onUpdateDemand: (category: string, unit: string, newQty: number) => Promise<void>;
}

export const DemandEditor: React.FC<DemandEditorProps> = ({ demand, onUpdateDemand }) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const startEdit = (item: SiteDemandItem) => {
    setEditingCategory(item.category);
    setEditQty(item.demandQty);
    setError(null);
  };

  const saveEdit = async (item: SiteDemandItem) => {
    if (editQty < item.reservedQty + item.receivedQty) {
      setError(`Cannot lower demand below already reserved (${item.reservedQty}) + received (${item.receivedQty})`);
      return;
    }
    try {
      await onUpdateDemand(item.category, item.unit, editQty);
      setEditingCategory(null);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update demand');
    }
  };

  return (
    <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Shelter Unmet Demand</h4>
        <span className="text-xs text-slate-500">Live inventory reservation &amp; intake</span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {demand.map((item) => {
          const isEditing = editingCategory === item.category;
          const unmet = item.demandQty - item.reservedQty;

          return (
            <div key={item.category} className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-semibold text-sm text-slate-900 dark:text-white block">
                  {item.category.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-slate-500">
                  Reserved: {item.reservedQty} | Received: {item.receivedQty} | Remaining: {Math.max(0, unmet)} {item.unit}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editQty}
                      onChange={(e) => setEditQty(parseInt(e.target.value) || 0)}
                      className="w-24 px-2 py-1 text-sm border rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                    />
                    <button
                      onClick={() => saveEdit(item)}
                      className="p-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="p-1.5 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-teal-800 dark:text-teal-400">
                      {item.demandQty} {item.unit}
                    </span>
                    <button
                      onClick={() => startEdit(item)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      title="Edit demand"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-3 text-xs text-rose-700 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200">
          {error}
        </div>
      )}
    </div>
  );
};
