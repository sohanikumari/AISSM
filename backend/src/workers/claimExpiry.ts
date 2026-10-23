import { db } from '../db';

export function runClaimExpiryWorker(): { expiredCount: number } {
  const now = new Date();
  let count = 0;

  for (const task of db.tasks.values()) {
    if (task.status === 'CLAIMED' && task.claimExpiresAtUtc) {
      const expiresAt = new Date(task.claimExpiresAtUtc);
      if (expiresAt.getTime() <= now.getTime()) {
        const previousClaimant = task.claimedBy;
        task.status = 'OPEN';
        task.claimedBy = undefined;
        task.claimedByAlias = undefined;
        task.claimExpiresAtUtc = undefined;
        task.updatedAtUtc = now.toISOString();
        count++;

        db.addEvent({
          taskId: task.id,
          donationId: task.donationId,
          type: 'task.claim_expired',
          actor: 'worker',
          payload: { releasedClaimant: previousClaimant },
        });

        db.addAuditLog({
          actorKind: 'system',
          action: 'CLAIM_EXPIRED_RELEASED',
          entityType: 'task',
          entityId: task.id,
          reason: `Rider ${previousClaimant} failed to acknowledge within claim TTL. Task returned to available pool.`,
        });
      }
    }
  }

  return { expiredCount: count };
}
