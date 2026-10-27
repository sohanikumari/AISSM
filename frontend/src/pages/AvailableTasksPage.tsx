import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../api';
import { DeliveryTask } from '../api/types';
import { TaskCard } from '../components/task/TaskCard';
import { EmptyState } from '../components/common/EmptyState';
import { LiveMap } from '../components/map/LiveMap';
import { Truck, List, MapPin, Filter } from 'lucide-react';
import { useRealtimeEvent } from '../hooks/useRealtimeEvent';

export const AvailableTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<DeliveryTask[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [newTaskFlash, setNewTaskFlash] = useState(false);

  const loadTasks = useCallback(() => {
    setLoading(true);
    api.availableTasks().then((list) => {
      setTasks(list);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Auto-refresh task list when a new task becomes available
  const handleTaskAvailable = useCallback(() => {
    setNewTaskFlash(true);
    loadTasks();
    setTimeout(() => setNewTaskFlash(false), 3000);
  }, [loadTasks]);

  useRealtimeEvent('task.available', handleTaskAvailable);

  const handleClaim = async (taskId: string) => {
    await api.claimTask(taskId);
    loadTasks();
  };

  const filteredTasks = tasks.filter((t) => {
    if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* New task flash banner */}
      {newTaskFlash && (
        <div className="flex items-center gap-3 bg-teal-50 dark:bg-teal-950/50 border border-teal-300 dark:border-teal-700 rounded-xl px-4 py-3 text-teal-800 dark:text-teal-200 text-sm font-medium animate-pulse">
          <Truck className="w-4 h-4 shrink-0" />
          New delivery tasks just posted — list refreshed automatically!
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Available Aid Deliveries</h1>
          <p className="text-xs text-slate-500 mt-1">
            Realtime dispatch pool sorted by FEFO urgency. Claims are atomic and time-reserved.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
              viewMode === 'list' ? 'bg-white dark:bg-[#161C23] text-teal-700 shadow-xs' : 'text-slate-500'
            }`}
          >
            <List className="w-3.5 h-3.5" /> List View ({tasks.length})
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
              viewMode === 'map' ? 'bg-white dark:bg-[#161C23] text-teal-700 shadow-xs' : 'text-slate-500'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> Live Map
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center gap-3 bg-white dark:bg-[#161C23] p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-600 dark:text-slate-400">Category Filter:</span>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-2.5 py-1 text-xs border rounded bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
        >
          <option value="ALL">All Categories</option>
          <option value="COOKED_MEAL">Cooked Meals</option>
          <option value="RAW_RATION_KIT">Raw Ration Kits</option>
          <option value="COLD_CHAIN_FOOD">Cold Chain Food</option>
          <option value="PACKAGED_DRY_GOODS">Packaged Dry Goods</option>
        </select>
      </div>

      {viewMode === 'map' ? (
        <LiveMap tasks={tasks} />
      ) : loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Scanning available delivery tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No eligible delivery tasks in pool"
          description="All active donation quantities are currently claimed or delivered. Check back shortly as new surplus posts arrive."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} onClaim={handleClaim} />
          ))}
        </div>
      )}
    </div>
  );
};
