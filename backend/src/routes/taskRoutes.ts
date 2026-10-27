import { Router } from 'express';
import { db } from '../db';
import { authMiddleware, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import {
  pickupTaskSchema,
  deliverTaskSchema,
  verifyReceiptSchema,
  acceptRerouteSchema,
  declineRerouteSchema,
} from '../../../shared/src/schemas';
import { taskService } from '../services/taskService';
import { rerouteService } from '../services/rerouteService';

export const taskRouter = Router();

taskRouter.get('/available', (req, res) => {
  const tasks = Array.from(db.tasks.values()).filter((t) => t.status === 'OPEN');
  // Sort FEFO by expiry deadline
  tasks.sort((a, b) => new Date(a.expiryDeadlineUtc).getTime() - new Date(b.expiryDeadlineUtc).getTime());
  res.json({ tasks });
});

taskRouter.get('/:id', (req, res) => {
  const task = db.tasks.get(req.params.id);
  if (!task) return res.status(404).json({ code: 'NOT_FOUND', message: 'Task not found' });
  const events = db.events.filter((e) => e.taskId === task.id);
  res.json({ task, events });
});

taskRouter.post('/:id/claim', authMiddleware, requireRole('RIDER', 'HELPER', 'ADMIN'), (req, res, next) => {
  try {
    const user = req.user!;
    const task = taskService.claimTask(req.params.id, user.id, user.displayName);
    res.json({ task });
  } catch (err) {
    next(err);
  }
});

taskRouter.post('/:id/acknowledge', authMiddleware, (req, res, next) => {
  try {
    const task = taskService.acknowledgeTask(req.params.id, req.user!.id);
    res.json({ task });
  } catch (err) {
    next(err);
  }
});

taskRouter.post('/:id/pickup', authMiddleware, validateBody(pickupTaskSchema), (req, res, next) => {
  try {
    const task = taskService.confirmPickup(req.params.id, req.user!.id, req.body.pickedUpQty);
    res.json({ task });
  } catch (err) {
    next(err);
  }
});

taskRouter.post('/:id/deliver', authMiddleware, validateBody(deliverTaskSchema), (req, res, next) => {
  try {
    const task = taskService.confirmDelivery(req.params.id, req.user!.id, req.body.deliveredQty);
    res.json({ task });
  } catch (err) {
    next(err);
  }
});

taskRouter.post('/:id/verify', authMiddleware, requireRole('NGO_OPERATOR', 'ADMIN'), validateBody(verifyReceiptSchema), (req, res, next) => {
  try {
    const result = taskService.verifyReceipt(req.params.id, req.user!.id, req.body.verifiedQty, req.body.note);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

taskRouter.post('/:id/reroute/accept', authMiddleware, validateBody(acceptRerouteSchema), (req, res, next) => {
  try {
    const task = rerouteService.acceptReroute(req.params.id, req.user!.id, req.body.proposalId);
    res.json({ task });
  } catch (err) {
    next(err);
  }
});

taskRouter.post('/:id/reroute/decline', authMiddleware, validateBody(declineRerouteSchema), (req, res, next) => {
  try {
    const task = rerouteService.declineReroute(req.params.id, req.user!.id, req.body.reason);
    res.json({ task });
  } catch (err) {
    next(err);
  }
});
