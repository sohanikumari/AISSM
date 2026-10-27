import { db } from '../db';

export function runExpirySweeperWorker(): { expiredDonations: number; expiredTasks: number } {
  const now = new Date();
  let dCount = 0;
  let tCount = 0;

  for (const donation of db.donations.values()) {
    if (!['COMPLETED', 'CANCELLED', 'EXPIRED_UNDELIVERED', 'CLOSED_WINDOW_ENDED'].includes(donation.status)) {
      const expiry = new Date(donation.expiryUtc);
      if (expiry.getTime() <= now.getTime()) {
        donation.status = 'EXPIRED_UNDELIVERED';
        donation.updatedAtUtc = now.toISOString();
        dCount++;

        db.addEvent({
          donationId: donation.id,
          type: 'donation.expired_undelivered',
          actor: 'worker',
          payload: { remainingQty: donation.quantity - donation.deliveredQty },
        });

        db.addAuditLog({
          actorKind: 'system',
          action: 'DONATION_EXPIRED_UNDELIVERED',
          entityType: 'donation',
          entityId: donation.id,
          reason: 'Safe food shelf-life passed without full verified distribution',
        });
      }
    }
  }

  for (const task of db.tasks.values()) {
    if (task.status === 'OPEN') {
      const expiry = new Date(task.expiryDeadlineUtc);
      if (expiry.getTime() <= now.getTime()) {
        task.status = 'EXPIRED';
        task.updatedAtUtc = now.toISOString();
        tCount++;
      }
    }
  }

  return { expiredDonations: dCount, expiredTasks: tCount };
}
