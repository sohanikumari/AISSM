import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Info, ExternalLink } from 'lucide-react';
import { DeliveryTask } from '../../api/types';
import { StatusBadge } from '../common/StatusBadge';
import { EtaBadge } from '../common/EtaBadge';

export const AllocationTable: React.FC<{ tasks: DeliveryTask[] }> = ({ tasks }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (tasks.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
        No delivery tasks generated yet. Run matching engine to split this donation.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold text-xs border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="px-4 py-3">Task ID</th>
            <th className="px-4 py-3">Destination Shelter</th>
            <th className="px-4 py-3">Quantity</th>
            <th className="px-4 py-3">Assigned Rider</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">ETA</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {tasks.map((task) => {
            const isExpanded = expandedId === task.id;
            return (
              <React.Fragment key={task.id}>
                <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {task.id.slice(0, 14)}...
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {task.siteName}
                  </td>
                  <td className="px-4 py-3 font-semibold text-teal-800 dark:text-teal-400">
                    {task.quantity} {task.unit}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {task.claimedByAlias || <span className="text-slate-400 italic">Unclaimed</span>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-4 py-3">
                    <EtaBadge minutes={task.etaMinutes} source={task.etaSource} />
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : task.id)}
                      className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-0.5"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      Why?
                    </button>
                    <Link
                      to={`/tasks/${task.id}`}
                      className="text-teal-700 dark:text-teal-400 font-semibold hover:underline inline-flex items-center gap-1 text-xs"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>

                {/* Expanded "Why this assignment?" Drawer */}
                {isExpanded && (
                  <tr className="bg-slate-50/80 dark:bg-slate-800/60 text-xs">
                    <td colSpan={7} className="px-4 py-3 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                        <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white mb-1">
                            Deterministic Dispatch Explanation
                          </div>
                          <p className="mb-2">
                            {task.assignmentReason?.note || 'Assigned based on proximity, unmet demand, and strict safety capability checks.'}
                          </p>
                          {task.assignmentReason?.rejections && task.assignmentReason.rejections.length > 0 && (
                            <div className="mt-2 text-slate-500">
                              <span className="font-medium">Other candidate sites rejected:</span>
                              <ul className="list-disc list-inside mt-1 space-y-0.5">
                                {task.assignmentReason.rejections.map((rej, idx) => (
                                  <li key={idx}>
                                    <span className="font-mono text-[11px] text-amber-700 dark:text-amber-400">[{rej.code}]</span> {rej.description}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
