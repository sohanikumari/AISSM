import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { creditService } from '../services/creditService';

export const creditRouter = Router();

creditRouter.get('/', authMiddleware, (req, res) => {
  const result = creditService.getUserCredits(req.user!.id);
  res.json(result);
});

creditRouter.get('/leaderboard', (req, res) => {
  const type = (req.query.type as 'DONOR' | 'VOLUNTEER' | 'HELPER') || 'VOLUNTEER';
  const leaderboard = creditService.getLeaderboard(type);
  res.json({ leaderboard });
});
