import { Router } from 'express';
import { db } from '../db';
import { authMiddleware, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { setSiteStatusSchema, setSiteDemandSchema, setSiteCapabilitySchema } from '../../../shared/src/schemas';
import { siteService } from '../services/siteService';

export const siteRouter = Router();

siteRouter.get('/', (req, res) => {
  const { status, category } = req.query;
  let list = Array.from(db.sites.values());

  if (status) {
    list = list.filter((s) => s.status === status);
  }
  if (category) {
    list = list.filter((s) => s.acceptedCategories.includes(category as string));
  }

  res.json({ sites: list });
});

siteRouter.get('/:id', (req, res) => {
  const site = db.sites.get(req.params.id);
  if (!site) return res.status(404).json({ code: 'NOT_FOUND', message: 'Site not found' });
  res.json({ site });
});

siteRouter.patch('/:id/status', authMiddleware, requireRole('NGO_OPERATOR', 'ADMIN'), validateBody(setSiteStatusSchema), (req, res, next) => {
  try {
    const result = siteService.setSiteStatus(req.params.id, req.body.status, req.body.confirm);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

siteRouter.put('/:id/demand', authMiddleware, requireRole('NGO_OPERATOR', 'ADMIN'), validateBody(setSiteDemandSchema), (req, res, next) => {
  try {
    const { category, unit, demandQty } = req.body;
    const site = siteService.setSiteDemand(req.params.id, category, unit, demandQty);
    res.json({ site });
  } catch (err) {
    next(err);
  }
});

siteRouter.put('/:id/capability', authMiddleware, requireRole('NGO_OPERATOR', 'ADMIN'), validateBody(setSiteCapabilitySchema), (req, res, next) => {
  try {
    const { capability, available } = req.body;
    const site = siteService.setSiteCapability(req.params.id, capability, available);
    res.json({ site });
  } catch (err) {
    next(err);
  }
});
