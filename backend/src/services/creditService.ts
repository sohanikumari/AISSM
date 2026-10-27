import { db } from '../db';
import { LedgerEntry, LeaderboardRank } from '../../../shared/src/types';

export class CreditService {
  getUserCredits(userId: string): { totals: Record<'DONOR' | 'VOLUNTEER' | 'HELPER', number>; entries: LedgerEntry[] } {
    const entries = db.ledger.filter((e) => e.userId === userId);
    const totals = {
      DONOR: 0,
      VOLUNTEER: 0,
      HELPER: 0,
    };

    for (const entry of entries) {
      if (entry.reverses) {
        totals[entry.creditType] -= entry.amount;
      } else {
        totals[entry.creditType] += entry.amount;
      }
    }

    return { totals, entries };
  }

  getLeaderboard(creditType: 'DONOR' | 'VOLUNTEER' | 'HELPER'): LeaderboardRank[] {
    const map = new Map<string, number>();

    for (const entry of db.ledger) {
      if (entry.creditType !== creditType) continue;
      const current = map.get(entry.userId) || 0;
      map.set(entry.userId, current + (entry.reverses ? -entry.amount : entry.amount));
    }

    const list: { userId: string; score: number }[] = [];
    for (const [userId, score] of map.entries()) {
      list.push({ userId, score });
    }

    list.sort((a, b) => b.score - a.score);

    return list.map((item, index) => {
      const user = db.users.get(item.userId);
      return {
        rank: index + 1,
        userId: item.userId,
        displayName: user?.displayName || 'Anonymous Volunteer',
        score: item.score,
        creditType,
      };
    });
  }
}

export const creditService = new CreditService();
