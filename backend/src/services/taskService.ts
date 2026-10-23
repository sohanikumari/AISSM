import { db } from '../db';
import { DeliveryTask, LedgerEntry } from '../../../shared/src/types';
import { SYSTEM_DEFAULTS } from '../../../shared/src/constants';

export class TaskService {
  claimTask(taskId: string, userId: string, alias: string): DeliveryTask {
    const task = db.tasks.get(taskId);
    if (!task) {
      throw { code: 'NOT_FOUND', message: 'Task not found' };
    }

    // INV-2: Atomic single winner claim check
    if (task.status !== 'OPEN') {
      throw { code: 'ALREADY_CLAIMED', message: 'Someone else just claimed this task' };
    }

    // Check rider availability and capacity constraints (INV-4)
    const rider = db.riderAvailability.get(userId);
    if (rider) {
      if (task.quantity > rider.capacityQty) {
        throw {
          code: 'CAPACITY_EXCEEDED',
          message: `Task quantity (${task.quantity} ${task.unit}) exceeds your declared capacity (${rider.capacityQty} ${rider.capacityUnit})`,
        };
      }
      if (task.requiresColdBag && !rider.hasColdBag) {
        throw {
          code: 'INCOMPATIBLE_SITE',
          message: 'This task requires an insulated cold bag which is not in your declared profile',
        };
      }
    }

    const now = new Date();
    const ttlMs = SYSTEM_DEFAULTS.CLAIM_TTL_MINUTES * 60 * 1000;
    const expiresAt = new Date(now.getTime() + ttlMs).toISOString();

    task.status = 'CLAIMED';
    task.claimedBy = userId;
    task.claimedByAlias = alias;
    task.claimExpiresAtUtc = expiresAt;
    task.updatedAtUtc = now.toISOString();

    db.addEvent({
      taskId: task.id,
      donationId: task.donationId,
      type: 'task.claimed',
      actor: userId,
      payload: { claimedByAlias: alias, expiresAt },
    });

    db.addAuditLog({
      actorKind: 'user',
      actorId: userId,
      action: 'TASK_CLAIMED',
      entityType: 'task',
      entityId: task.id,
      afterState: { status: 'CLAIMED', claimedBy: userId, expiresAt },
      reason: `Claimed by ${alias} with TTL ${SYSTEM_DEFAULTS.CLAIM_TTL_MINUTES}m`,
    });

    return task;
  }

  acknowledgeTask(taskId: string, userId: string): DeliveryTask {
    const task = db.tasks.get(taskId);
    if (!task) throw { code: 'NOT_FOUND', message: 'Task not found' };

    if (task.claimedBy !== userId) {
      throw { code: 'FORBIDDEN', message: 'You are not the designated claimant for this task' };
    }

    const now = new Date();
    if (task.claimExpiresAtUtc && new Date(task.claimExpiresAtUtc).getTime() <= now.getTime()) {
      // Release stale claim
      task.status = 'OPEN';
      task.claimedBy = undefined;
      task.claimedByAlias = undefined;
      task.claimExpiresAtUtc = undefined;
      task.updatedAtUtc = now.toISOString();

      throw {
        code: 'CLAIM_EXPIRED',
        message: 'Your claim reservation has expired and the task has been released back to the pool',
      };
    }

    if (task.status !== 'CLAIMED') {
      throw {
        code: 'INVALID_STATE_TRANSITION',
        message: `Cannot acknowledge task in status ${task.status}`,
      };
    }

    const pickupDeadline = new Date(now.getTime() + SYSTEM_DEFAULTS.PICKUP_DEADLINE_MINUTES * 60 * 1000).toISOString();
    task.status = 'ACKNOWLEDGED';
    task.pickupDeadlineUtc = pickupDeadline;
    task.updatedAtUtc = now.toISOString();

    db.addEvent({
      taskId: task.id,
      donationId: task.donationId,
      type: 'task.acknowledged',
      actor: userId,
      payload: { pickupDeadline },
    });

    return task;
  }

  confirmPickup(taskId: string, userId: string, pickedUpQty: number): DeliveryTask {
    const task = db.tasks.get(taskId);
    if (!task) throw { code: 'NOT_FOUND', message: 'Task not found' };
    if (task.claimedBy !== userId) throw { code: 'FORBIDDEN', message: 'Not authorized for this task' };
    if (task.status !== 'ACKNOWLEDGED') {
      throw { code: 'INVALID_STATE_TRANSITION', message: `Cannot pickup task in status ${task.status}` };
    }

    if (pickedUpQty > task.quantity) {
      throw { code: 'VALIDATION_ERROR', message: `Cannot pickup more than allocated task quantity (${task.quantity})` };
    }

    const now = new Date().toISOString();
    task.status = 'IN_TRANSIT';
    task.pickedUpQty = pickedUpQty;
    task.updatedAtUtc = now;

    // Update parent donation state to IN_PROGRESS
    const donation = db.donations.get(task.donationId);
    if (donation && donation.status !== 'IN_PROGRESS' && donation.status !== 'COMPLETED') {
      donation.status = 'IN_PROGRESS';
      donation.updatedAtUtc = now;
    }

    db.addEvent({
      taskId: task.id,
      donationId: task.donationId,
      type: 'task.picked_up',
      actor: userId,
      payload: { pickedUpQty },
    });

    return task;
  }

  confirmDelivery(taskId: string, userId: string, deliveredQty: number): DeliveryTask {
    const task = db.tasks.get(taskId);
    if (!task) throw { code: 'NOT_FOUND', message: 'Task not found' };
    if (task.claimedBy !== userId) throw { code: 'FORBIDDEN', message: 'Not authorized for this task' };
    if (task.status !== 'IN_TRANSIT') {
      throw { code: 'INVALID_STATE_TRANSITION', message: `Cannot confirm delivery in status ${task.status}` };
    }

    const now = new Date().toISOString();
    task.status = 'DELIVERED';
    task.deliveredQty = deliveredQty;
    task.updatedAtUtc = now;

    db.addEvent({
      taskId: task.id,
      donationId: task.donationId,
      type: 'task.delivered',
      actor: userId,
      payload: { deliveredQty },
    });

    return task;
  }

  verifyReceipt(taskId: string, verifiedByUserId: string, verifiedQty: number, note?: string): { task: DeliveryTask; credits: LedgerEntry[] } {
    const task = db.tasks.get(taskId);
    if (!task) throw { code: 'NOT_FOUND', message: 'Task not found' };
    if (task.status !== 'DELIVERED') {
      throw { code: 'INVALID_STATE_TRANSITION', message: `Cannot verify receipt in status ${task.status}` };
    }

    const now = new Date().toISOString();
    task.status = 'DELIVERED_VERIFIED';
    task.verifiedQty = verifiedQty;
    task.updatedAtUtc = now;

    // Update receiving site inventory/demand: reserved becomes received
    const site = db.sites.get(task.siteId);
    if (site) {
      const demandItem = site.demand.find((d) => d.category === task.category);
      if (demandItem) {
        demandItem.reservedQty = Math.max(0, demandItem.reservedQty - task.quantity);
        demandItem.receivedQty += verifiedQty;
      }
    }

    // Update parent donation delivered counter
    const donation = db.donations.get(task.donationId);
    if (donation) {
      donation.deliveredQty += verifiedQty;
      // Check if all tasks belonging to this donation are verified
      const allTasks = Array.from(db.tasks.values()).filter((t) => t.donationId === donation.id);
      const allComplete = allTasks.every((t) => t.status === 'DELIVERED_VERIFIED');
      if (allComplete) {
        donation.status = 'COMPLETED';
      }
      donation.updatedAtUtc = now;
    }

    // Award Credits (INV-7 Idempotency)
    const creditsAwarded: LedgerEntry[] = [];
    if (task.claimedBy) {
      const riderUser = db.users.get(task.claimedBy);
      const isEmergencyHelper = riderUser?.roles.includes('HELPER');
      const creditType = isEmergencyHelper ? 'HELPER' : 'VOLUNTEER';
      const multiplier = isEmergencyHelper ? SYSTEM_DEFAULTS.EMERGENCY_HELPER_MULTIPLIER : 1.0;
      const amount = isEmergencyHelper ? 25 : 15;

      const riderCredit = db.awardCredit({
        userId: task.claimedBy,
        creditType,
        eventType: 'DELIVERY_VERIFIED',
        amount: Math.round(amount * multiplier),
        multiplier,
        subjectId: task.id,
        description: `Verified delivery of ${verifiedQty} ${task.unit} to ${task.siteName}`,
      });

      if (riderCredit) creditsAwarded.push(riderCredit);
    }

    // Award Donor Credit
    if (donation) {
      const donorCredit = db.awardCredit({
        userId: donation.donorId,
        creditType: 'DONOR',
        eventType: 'DONATION_VERIFIED',
        amount: Math.round(verifiedQty / 5) * 5, // 5 credits per 5 units
        multiplier: 1.0,
        subjectId: task.id,
        description: `Verified fulfillment of ${verifiedQty} ${donation.unit}`,
      });
      if (donorCredit) creditsAwarded.push(donorCredit);
    }

    db.addEvent({
      taskId: task.id,
      donationId: task.donationId,
      type: 'task.verified',
      actor: verifiedByUserId,
      payload: { verifiedQty, note, creditsAwarded: creditsAwarded.length },
    });

    db.addAuditLog({
      actorKind: 'user',
      actorId: verifiedByUserId,
      action: 'RECEIPT_VERIFIED',
      entityType: 'task',
      entityId: task.id,
      afterState: { status: 'DELIVERED_VERIFIED', verifiedQty, creditsCount: creditsAwarded.length },
      reason: note || 'Site verification confirmed arrival of goods',
    });

    return { task, credits: creditsAwarded };
  }
}

export const taskService = new TaskService();
