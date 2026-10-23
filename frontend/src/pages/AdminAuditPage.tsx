import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { AuditLog } from '../api/types';
import { AuditTable } from '../components/admin/AuditTable';
import { FileText, Download } from 'lucide-react';

export const AdminAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.audit().then((list) => {
      setLogs(list);
      setLoading(false);
    });
  }, []);

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Timestamp,Actor,Action,EntityType,EntityId,Reason']
        .concat(
          logs.map(
            (l) =>
              `"${l.createdAtUtc}","${l.actorId || l.actorKind}","${l.action}","${l.entityType}","${l.entityId}","${l.reason || ''}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lastmile_aid_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-700 dark:text-teal-400" />
            Append-Only Audit Log
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete immutable ledger of state transitions, override events, and credit allocations.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-50 transition shadow-xs"
        >
          <Download className="w-4 h-4 text-slate-600" /> Export CSV
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading audit log...</div>
      ) : (
        <AuditTable logs={logs} />
      )}
    </div>
  );
};
