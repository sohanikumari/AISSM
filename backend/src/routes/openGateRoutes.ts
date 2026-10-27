import { Router } from 'express';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { recordHandoutSchema } from '../../../shared/src/schemas';
import { openGateService } from '../services/openGateService';

export const openGateRouter = Router();

openGateRouter.get('/', (req, res) => {
  const listings = Array.from(db.openGateListings.values());
  res.json({ listings });
});

openGateRouter.get('/:id', (req, res) => {
  const listing = db.openGateListings.get(req.params.id);
  if (!listing) return res.status(404).json({ code: 'NOT_FOUND', message: 'Listing not found' });
  res.json({ listing });
});

openGateRouter.post('/:id/handout', authMiddleware, validateBody(recordHandoutSchema), (req, res, next) => {
  try {
    const listing = openGateService.recordHandout(req.params.id, req.body.quantity, req.body.notes);
    res.json({ listing });
  } catch (err) {
    next(err);
  }
});
