import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../api';
import { Notification } from '../api/types';
import { Bell, CheckCheck, Clock, Route, Award, AlertTriangle, Truck } from 'lucide-react';
import { formatTimeAgo } from '../lib/format';
import { useRealtimeEvent } from '../hooks/useRealtimeEvent';
import { Link } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifs = useCallback(() => {
    setLoading(true);
    api.notifications().then((list) => {
      setNotifications(list);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    loadNotifs();
  }, [loadNotifs]);

  // Live refresh when new tasks are dispatched
  useRealtimeEvent('task.available', loadNotifs);

  const handleMarkAllRead = async () => {
    const ids = notifications.map((n) => n.id);
    await api.markRead(ids);
    loadNotifs();
  };

  const getIcon = (type: string) => {
    if (type === 'TASK_AVAILABLE') return <Truck className="w-4 h-4" />;
    if (type === 'EXPIRY_WARNING') return <AlertTriangle className="w-4 h-4" />;
    if (type === 'REROUTE_PROPOSED') return <Route className="w-4 h-4" />;
    if (type === 'CREDIT_EARNED') return <Award className="w-4 h-4" />;
    return <Bell className="w-4 h-4" />;
  };

  const getIconColors = (type: string) => {
    if (type === 'TASK_AVAILABLE') return 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300';
    if (type === 'EXPIRY_WARNING') return 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300';
    if (type === 'REROUTE_PROPOSED') return 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300';
    if (type === 'CREDIT_EARNED') return 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300';
    return 'bg-slate-50 dark:bg-slate-800 text-slate-500';
  };

  const unreadCount = notifications.filter((n) => !n.readAtUtc).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Notifications & Alerts
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">Real-time alerts for dispatch, expiry warnings, and rerouting proposals.</p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm text-slate-500">No notifications yet.</p>
            <p className="text-xs text-slate-400">When a donor posts a donation, riders & helpers will be notified instantly.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 flex items-start gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition ${
                !notif.readAtUtc ? 'border-l-2 border-teal-500' : ''
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${getIconColors(notif.type)}`}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-xs font-bold ${!notif.readAtUtc ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 shrink-0">{formatTimeAgo(notif.createdAtUtc)}</span>
                </div>
                {notif.body && <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{notif.body}</p>}
                {notif.type === 'TASK_AVAILABLE' && (
                  <Link
                    to="/tasks"
                    className="inline-block mt-1.5 text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline"
                  >
                    View available tasks →
                  </Link>
                )}
              </div>
              {!notif.readAtUtc && (
                <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
