import { useEffect, useRef } from 'react';
import { api } from '../api';
import { mockRealtime } from '../realtime/mockRealtime';

const WARN_MINUTES = 15;   // emit warning below this
const CRIT_MINUTES = 5;    // emit critical below this
const CHECK_INTERVAL_MS = 30_000; // check every 30s

/**
 * Background watcher that monitors tasks and donations for imminent expiry.
 * Emits mockRealtime events so any component can subscribe:
 *   - 'task.expiring_soon'    → { taskId, siteName, quantity, unit, secondsLeft, level }
 *   - 'donation.expiring_soon' → { donationId, quantity, unit, secondsLeft, level }
 *
 * Mount this once at the app root (AppShell). It self-cleans on unmount.
 */
export function useExpiryWatcher() {
  // Track which ids we've already fired for each level to avoid spam
  const warnedTasks = useRef<Set<string>>(new Set());
  const critTasks = useRef<Set<string>>(new Set());
  const warnedDonations = useRef<Set<string>>(new Set());
  const critDonations = useRef<Set<string>>(new Set());

  useEffect(() => {
    const check = async () => {
      const now = Date.now();

      // ── Check tasks ──────────────────────────────────────────────────────
      try {
        const tasks = await api.availableTasks();
        for (const task of tasks) {
          if (task.status !== 'OPEN') continue;
          const secsLeft = Math.floor((new Date(task.expiryDeadlineUtc).getTime() - now) / 1000);
          if (secsLeft <= 0) continue;

          const key = task.id;
          const minsLeft = secsLeft / 60;

          if (minsLeft <= CRIT_MINUTES && !critTasks.current.has(key)) {
            critTasks.current.add(key);
            warnedTasks.current.add(key); // also mark warned
            mockRealtime.emit('task.expiring_soon', {
              taskId: task.id,
              siteName: task.siteName,
              quantity: task.quantity,
              unit: task.unit,
              category: task.category,
              secondsLeft: secsLeft,
              level: 'CRITICAL',
            });
          } else if (minsLeft <= WARN_MINUTES && !warnedTasks.current.has(key)) {
            warnedTasks.current.add(key);
            mockRealtime.emit('task.expiring_soon', {
              taskId: task.id,
              siteName: task.siteName,
              quantity: task.quantity,
              unit: task.unit,
              category: task.category,
              secondsLeft: secsLeft,
              level: 'WARNING',
            });
          }
        }
      } catch (_) {
        // silently swallow – watcher should never crash the app
      }

      // ── Check donations ──────────────────────────────────────────────────
      try {
        const donations = await api.listDonations({ status: 'PUBLISHED' });
        const active = (await api.listDonations({ status: 'ALLOCATED' }));
        const all = [...donations, ...active];

        for (const don of all) {
          const secsLeft = Math.floor((new Date(don.expiryUtc).getTime() - now) / 1000);
          if (secsLeft <= 0) continue;

          const key = don.id;
          const minsLeft = secsLeft / 60;

          if (minsLeft <= CRIT_MINUTES && !critDonations.current.has(key)) {
            critDonations.current.add(key);
            warnedDonations.current.add(key);
            mockRealtime.emit('donation.expiring_soon', {
              donationId: don.id,
              donorName: don.donorName,
              quantity: don.quantity,
              unit: don.unit,
              category: don.category,
              secondsLeft: secsLeft,
              level: 'CRITICAL',
            });
          } else if (minsLeft <= WARN_MINUTES && !warnedDonations.current.has(key)) {
            warnedDonations.current.add(key);
            mockRealtime.emit('donation.expiring_soon', {
              donationId: don.id,
              donorName: don.donorName,
              quantity: don.quantity,
              unit: don.unit,
              category: don.category,
              secondsLeft: secsLeft,
              level: 'WARNING',
            });
          }
        }
      } catch (_) {}
    };

    // Run immediately, then on interval
    check();
    const id = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
}
