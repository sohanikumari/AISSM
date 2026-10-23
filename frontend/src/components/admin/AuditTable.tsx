import React from 'react';
import { AuditLog } from '../../api/types';
import { formatLocal } from '../../lib/format';

export const AuditTable: React.FC<{ logs: AuditLog[] }> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-500 bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl">
        No audit log records recorded yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#161C23] shadow-sm">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="px-4 py-3">Timestamp (Local)</th>
            <th className="px-4 py-3">Actor</th>
            <th className="px-4 py-3">Action</th>
            <th className="px-4 py-3">Entity</th>
            <th className="px-4 py-3">Reason / Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
              <td className="px-4 py-2.5 font-mono text-slate-500">
                {formatLocal(log.createdAtUtc, 'MMM d, HH:mm:ss')}
              </td>
              <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300">
                <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 mr-1.5">
                  {log.actorKind}
                </span>
                {log.actorId || 'system'}
              </td>
              <td className="px-4 py-2.5 font-mono text-teal-800 dark:text-teal-400 font-semibold">
                {log.action}
              </td>
              <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                {log.entityType} ({log.entityId.slice(0, 10)})
              </td>
              <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={log.reason}>
                {log.reason || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
