import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { DeliveryTask } from '../api/types';
import { TaskCard } from '../components/task/TaskCard';
import { EmptyState } from '../components/common/EmptyState';
import { UserCheck, ShieldAlert, Zap, AlertCircle, Heart } from 'lucide-react';

export const EmergencyHelperPage: React.FC = () => {
  const [tasks, setTasks] = useState<DeliveryTask[]>([]);
  const [optedIn, setOptedIn] = useState(true);
  const [safetyAgreed, setSafetyAgreed] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadTasks = () => {
    setLoading(true);
    api.availableTasks().then((list) => {
      // Emergency helpers cannot transport restricted categories like INFANT_FORMULA
      const helperEligible = list.filter((t) => t.category !== 'INFANT_FORMULA');
      setTasks(helperEligible);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleClaim = async (taskId: string) => {
    await api.claimTask(taskId);
    loadTasks();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Emergency Public Helper Portal</h1>
        <p className="text-xs text-slate-500 mt-1">
          Rapid-response dispatch for nearby volunteers to avert perishable wastage during volunteer rider shortages.
        </p>
      </div>

      {/* Safety Protocol & Opt-in Consent */}
      <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-teal-600" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Emergency Helper Safety Agreement</h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          As a public helper, you agree to inspect containers for food integrity, maintain clean transport, and verify receipt with shelter coordinators on arrival.
          Special medical supplies and infant formula are excluded from public dispatch for safety compliance.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
            <input
              type="checkbox"
              checked={safetyAgreed}
              onChange={(e) => setSafetyAgreed(e.target.checked)}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
            />
            I accept public helper guidelines and safety protocols.
          </label>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Zap className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            1.5× Emergency Bonus Multiplier Active
          </span>
        </div>
      </div>

      {/* Alert Feed */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          High-Urgency Emergency Alerts ({tasks.length})
        </h2>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading emergency aid alerts...</div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No emergency alerts pending"
            description="Regular scheduled delivery tasks are operating normally. Thank you for your readiness to assist!"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onClaim={handleClaim} riderCapacity={20} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
