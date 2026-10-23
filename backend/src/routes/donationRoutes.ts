import { Router } from 'express';
import { db } from '../db';
import { authMiddleware, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { createDonationSchema, switchToOpenGateSchema } from '../../../shared/src/schemas';
import { donationService } from '../services/donationService';
import { openGateService } from '../services/openGateService';

export const donationRouter = Router();

donationRouter.get('/', (req, res) => {
  const { status, mine } = req.query;
  let list = Array.from(db.donations.values());

  if (status) {
    list = list.filter((d) => d.status === status);
  }

  // Sort FEFO (First Expiring, First Out)
  list.sort((a, b) => new Date(a.expiryUtc).getTime() - new Date(b.expiryUtc).getTime());

  res.json({ donations: list });
});

donationRouter.get('/:id', (req, res) => {
  const donation = db.donations.get(req.params.id);
  if (!donation) {
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Donation not found' });
  }

  const tasks = Array.from(db.tasks.values()).filter((t) => t.donationId === donation.id);
  const events = db.events.filter((e) => e.donationId === donation.id);

  res.json({ donation, tasks, events });
});

donationRouter.post('/', authMiddleware, requireRole('DONOR', 'ADMIN'), validateBody(createDonationSchema), (req, res, next) => {
  try {
    const user = req.user!;
    const donation = donationService.createDonation(user.id, user.displayName, req.body);
    res.status(201).json({ donation });
  } catch (err) {
    next(err);
  }
});

donationRouter.post('/:id/open-gate', authMiddleware, requireRole('DONOR', 'ADMIN'), validateBody(switchToOpenGateSchema), (req, res, next) => {
  try {
    const listing = openGateService.switchToOpenGate(req.params.id, req.body);
    res.json({ listing });
  } catch (err) {
    next(err);
  }
});
