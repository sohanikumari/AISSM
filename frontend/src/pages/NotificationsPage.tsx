import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Notification } from '../api/types';
import { Bell, CheckCheck, Clock, Route, Award, AlertTriangle } from 'lucide-react';
import { formatTimeAgo } from '../lib/format';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifs = () => {
    setLoading(true);
    api.notifications().then((list) => {
      setNotifications(list);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    const ids = notifications.map((n) => n.id);
    await api.markRead(ids);
    loadNotifs();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications &amp; Alerts</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time alerts for dispatch, expiry warnings, and rerouting proposals.</p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
        </button>
      </div>

      <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No unread notifications at this time.
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className="p-4 flex items-start gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
              <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{notif.title}</h4>
                  <span className="text-[11px] text-slate-400">{formatTimeAgo(notif.createdAtUtc)}</span>
                </div>
                {notif.body && <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{notif.body}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
