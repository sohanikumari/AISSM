import { Router } from 'express';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';

export const notificationRouter = Router();

notificationRouter.get('/', authMiddleware, (req, res) => {
  const userId = req.user!.id;
  const list = db.notifications.filter((n) => n.userId === userId || n.userId === 'system');
  res.json({ notifications: list });
});

notificationRouter.post('/mark-read', authMiddleware, (req, res) => {
  const { ids } = req.body;
  const now = new Date().toISOString();

  if (Array.isArray(ids)) {
    for (const notif of db.notifications) {
      if (ids.includes(notif.id)) {
        notif.readAtUtc = now;
      }
    }
  }

  res.json({ success: true });
});
