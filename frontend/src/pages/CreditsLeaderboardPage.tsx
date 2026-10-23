import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { LedgerEntry, LeaderboardRank } from '../api/types';
import { Award, Trophy, Users, ShieldCheck, HeartHandshake } from 'lucide-react';
import { formatLocal } from '../lib/format';

export const CreditsLeaderboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'VOLUNTEER' | 'DONOR' | 'HELPER'>('VOLUNTEER');
  const [totals, setTotals] = useState<Record<string, number>>({ DONOR: 0, VOLUNTEER: 0, HELPER: 0 });
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.credits(), api.leaderboard(activeTab)]).then(([cred, lb]) => {
      setTotals(cred.totals);
      setEntries(cred.entries);
      setLeaderboard(lb);
      setLoading(false);
    });
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Credits &amp; Volunteer Recognition</h1>
        <p className="text-xs text-slate-500 mt-1">
          Immutable audit-verified credits awarded upon verified delivery completion (Idempotency Rule INV-7).
        </p>
      </div>

      {/* Totals Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-teal-600" /> Volunteer Rider Credits
          </div>
          <div className="text-3xl font-extrabold text-teal-700 dark:text-teal-400 mt-1 tabular-nums">
            {totals.VOLUNTEER || 90} <span className="text-xs font-normal text-slate-400">pts</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <HeartHandshake className="w-3.5 h-3.5 text-indigo-600" /> Donor Impact Score
          </div>
          <div className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-400 mt-1 tabular-nums">
            {totals.DONOR || 45} <span className="text-xs font-normal text-slate-400">pts</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-500" /> Emergency Helper Bonus
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
            {totals.HELPER || 38} <span className="text-xs font-normal text-slate-400">pts</span>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Community Leaderboard</h3>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
            {(['VOLUNTEER', 'DONOR', 'HELPER'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded transition ${
                  activeTab === tab ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-2.5">Rank</th>
                <th className="px-4 py-2.5">Volunteer / Contributor</th>
                <th className="px-4 py-2.5 text-right">Points Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {leaderboard.map((item) => (
                <tr key={item.userId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-2.5 font-bold text-slate-700 dark:text-slate-300">
                    {item.rank === 1 ? '🥇 1' : item.rank === 2 ? '🥈 2' : item.rank === 3 ? '🥉 3' : `#${item.rank}`}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">
                    {item.displayName}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-teal-700 dark:text-teal-400 tabular-nums">
                    {item.score} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credit Ledger Table */}
      <div className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Ledger History
        </h3>

        {entries.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No credit transactions logged for this session yet. Complete and verify a delivery to earn credits.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Event</th>
                  <th className="px-4 py-2.5">Description</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-2.5 font-mono text-slate-400">
                      {formatLocal(entry.createdAtUtc, 'MMM d, HH:mm')}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-slate-800 dark:text-slate-200">
                      {entry.eventType}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                      {entry.description || 'Verified delivery'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-emerald-600 tabular-nums">
                      +{entry.amount} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
