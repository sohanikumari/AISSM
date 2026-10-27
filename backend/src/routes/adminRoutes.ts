import { Router } from 'express';
import { db } from '../db';
import { authMiddleware, requireRole } from '../middleware/auth';
import { matchingEngine } from '../services/matchingEngine';
import { runClaimExpiryWorker } from '../workers/claimExpiry';
import { runListingClosureWorker } from '../workers/listingClosure';
import { runExpirySweeperWorker } from '../workers/expirySweeper';

export const adminRouter = Router();

adminRouter.post('/sim/seed', (req, res) => {
  db.seed();
  res.json({ message: 'Simulation seed data restored successfully' });
});

adminRouter.post('/sim/match', (req, res, next) => {
  try {
    const { donationId } = req.body;
    const targetId = donationId || 'don_sharma_180';
    const result = matchingEngine.matchDonation(targetId);
    res.json({ result });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/sim/worker/claim-expiry', (req, res) => {
  const result = runClaimExpiryWorker();
  res.json({ result });
});

adminRouter.post('/sim/worker/listing-closure', (req, res) => {
  const result = runListingClosureWorker();
  res.json({ result });
});

adminRouter.post('/sim/worker/expiry-sweeper', (req, res) => {
  const result = runExpirySweeperWorker();
  res.json({ result });
});

adminRouter.post('/sim/zero-volunteers', (req, res) => {
  const { enabled } = req.body;
  for (const avail of db.riderAvailability.values()) {
    avail.isAvailable = !enabled;
  }
  res.json({ zeroVolunteersActive: !!enabled });
});

adminRouter.get('/audit', authMiddleware, requireRole('ADMIN'), (req, res) => {
  const { entityType, entityId } = req.query;
  let logs = db.auditLogs;

  if (entityType) {
    logs = logs.filter((l) => l.entityType === entityType);
  }
  if (entityId) {
    logs = logs.filter((l) => l.entityId === entityId);
  }

  res.json({ logs });
});

adminRouter.get('/events', (req, res) => {
  const { donationId, taskId } = req.query;
  let events = db.events;

  if (donationId) {
    events = events.filter((e) => e.donationId === donationId);
  }
  if (taskId) {
    events = events.filter((e) => e.taskId === taskId);
  }

  res.json({ events });
});
