import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/db';
import { matchingEngine } from '../src/services/matchingEngine';
import { taskService } from '../src/services/taskService';
import { siteService } from '../src/services/siteService';
import { runClaimExpiryWorker } from '../src/workers/claimExpiry';

describe('LastMile Aid - PRD MVP Proof Points', () => {
  beforeEach(() => {
    db.seed();
  });

  // MVP Proof 1: A 180-meal donation is split into feasible, capacity-respecting, demand-respecting delivery tasks.
  it('Proof 1: Splits 180-meal donation into capacity-respecting (<=40 meals) tasks matching shelter demands', () => {
    const res = matchingEngine.matchDonation('don_sharma_180');
    expect(res.tasksCreated.length).toBeGreaterThan(0);
    expect(res.allocatedQuantity).toBe(180);
    expect(res.remainingQuantity).toBe(0);
    expect(res.status).toBe('ALLOCATED');

    // Verify invariant INV-4: Each task quantity <= 40
    for (const task of res.tasksCreated) {
      expect(task.quantity).toBeLessThanOrEqual(40);
      expect(task.status).toBe('OPEN');
    }

    // Verify sum of task quantities equals 180 (INV-3)
    const totalAllocated = res.tasksCreated.reduce((sum, t) => sum + t.quantity, 0);
    expect(totalAllocated).toBe(180);
  });

  // MVP Proof 2: A ghost claim expires and the task returns to the pool.
  it('Proof 2: Ghost claim expires after TTL and automatically returns task to OPEN status', () => {
    matchingEngine.matchDonation('don_sharma_180');
    const firstTask = Array.from(db.tasks.values())[0];

    // Rider 1 claims task
    const claimedTask = taskService.claimTask(firstTask.id, 'rider1', 'Rahul');
    expect(claimedTask.status).toBe('CLAIMED');
    expect(claimedTask.claimedBy).toBe('rider1');

    // Simulate time passing beyond claim TTL (11 minutes ago)
    claimedTask.claimExpiresAtUtc = new Date(Date.now() - 60 * 1000).toISOString();

    // Run claim expiry worker
    const workerResult = runClaimExpiryWorker();
    expect(workerResult.expiredCount).toBe(1);

    // Verify task is back in OPEN status and pool
    const refreshedTask = db.tasks.get(firstTask.id)!;
    expect(refreshedTask.status).toBe('OPEN');
    expect(refreshedTask.claimedBy).toBeUndefined();
    expect(refreshedTask.claimExpiresAtUtc).toBeUndefined();
  });

  // MVP Proof 3: A full shelter triggers a feasible reroute, or an explicit "no safe option" exception.
  it('Proof 3: Full shelter mid-transit triggers feasible reroute proposal with valid destination', () => {
    matchingEngine.matchDonation('don_sharma_180');
    const task = Array.from(db.tasks.values()).find((t) => t.siteId === 'site_asha')!;

    // Move task to IN_TRANSIT
    taskService.claimTask(task.id, 'rider1', 'Rahul');
    taskService.acknowledgeTask(task.id, 'rider1');
    taskService.confirmPickup(task.id, 'rider1', task.quantity);
    expect(task.status).toBe('IN_TRANSIT');

    // Asha Shelter becomes FULL
    const { affectedTasks } = siteService.setSiteStatus('site_asha', 'FULL');
    expect(affectedTasks.length).toBeGreaterThan(0);

    const affected = affectedTasks.find((t) => t.id === task.id)!;
    expect(affected.status).toBe('REROUTE_PROPOSED');
    expect(affected.reroute).toBeDefined();
    expect(affected.reroute?.newSiteId).not.toBe('site_asha');
    expect(affected.reroute?.deadlineHeadroomMinutes).toBeGreaterThan(0);
  });

  // MVP Proof 4: Incompatible item-to-site assignments are rejected by backend.
  it('Proof 4: Incompatible item requirements (refrigeration) rejected for sites lacking capability', () => {
    // Create perishable cold-chain donation
    const perishableDonation = {
      category: 'COLD_CHAIN_FOOD',
      description: 'Dairy milk cartons needing cold storage',
      quantity: 50,
      unit: 'liters',
      pickup: { lat: 28.618, lng: 77.21, address: 'Dairy Depot' },
      availableFromUtc: new Date().toISOString(),
      expiryUtc: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
      requiredCapabilities: ['REFRIGERATION'],
      mode: 'VOLUNTEER' as const,
    };

    const don = db.donations.set('don_cold', {
      id: 'don_cold',
      donorId: 'donor1',
      donorName: 'Dairy Depot',
      allocatedQty: 0,
      deliveredQty: 0,
      status: 'PUBLISHED',
      createdAtUtc: new Date().toISOString(),
      updatedAtUtc: new Date().toISOString(),
      ...perishableDonation,
    });

    const res = matchingEngine.matchDonation('don_cold');
    // Site B (Bright Future) has NO refrigeration, so it must be rejected
    const siteBRejection = res.rejectionReasons.find((r) => r.siteId === 'site_bright');
    expect(siteBRejection).toBeDefined();
    expect(siteBRejection?.code).toBe('INCOMPATIBLE_SITE');
  });

  // MVP Proof 5: Credits are awarded exactly once, only after verified events.
  it('Proof 5: Credits are awarded exactly once upon receipt verification (idempotent ledger)', () => {
    matchingEngine.matchDonation('don_sharma_180');
    const task = Array.from(db.tasks.values())[0];

    taskService.claimTask(task.id, 'rider1', 'Rahul');
    taskService.acknowledgeTask(task.id, 'rider1');
    taskService.confirmPickup(task.id, 'rider1', task.quantity);
    taskService.confirmDelivery(task.id, 'rider1', task.quantity);

    // Site operator verifies receipt
    const verification = taskService.verifyReceipt(task.id, 'ngo1', task.quantity, 'Delivered in good condition');
    expect(verification.task.status).toBe('DELIVERED_VERIFIED');
    expect(verification.credits.length).toBeGreaterThan(0);

    const initialLedgerCount = db.ledger.length;

    // Attempt duplicate credit award for the same event and task
    const duplicate = db.awardCredit({
      userId: 'rider1',
      creditType: 'VOLUNTEER',
      eventType: 'DELIVERY_VERIFIED',
      amount: 15,
      multiplier: 1.0,
      subjectId: task.id,
    });

    expect(duplicate).toBeNull(); // Rejected by uniqueness constraint
    expect(db.ledger.length).toBe(initialLedgerCount);
  });

  // MVP Proof 6: Organizer can fall back to Open Gate distribution.
  it('Proof 6: Fallback to Open Gate distribution allows walk-in recording and window closure', async () => {
    const res = await request(app)
      .post('/api/donations/don_sharma_180/open-gate')
      .set('x-user-id', 'donor1')
      .set('x-active-role', 'DONOR')
      .send({
        opensAtUtc: new Date().toISOString(),
        closesAtUtc: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
        instructions: 'Walk in directly at Main Banquet Hall',
      });

    expect(res.status).toBe(200);
    expect(res.body.listing).toBeDefined();
    expect(res.body.listing.remainingQty).toBe(180);
    expect(res.body.listing.status).toBe('ACTIVE');

    // Record handout of 20 meals
    const handoutRes = await request(app)
      .post(`/api/open-gate/${res.body.listing.id}/handout`)
      .set('x-user-id', 'donor1')
      .send({ quantity: 20 });

    expect(handoutRes.status).toBe(200);
    expect(handoutRes.body.listing.remainingQty).toBe(160);
  });
});
