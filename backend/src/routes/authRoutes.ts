import { Router } from 'express';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { loginSchema, registerSchema, riderAvailabilitySchema } from '../../../shared/src/schemas';
import { User } from '../../../shared/src/types';

export const authRouter = Router();

authRouter.post('/login', validateBody(loginSchema), (req, res) => {
  const { email } = req.body;
  const user = Array.from(db.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
  }

  const userWithToken: User = {
    ...user,
    token: `token_${user.id}`,
  };

  res.json({ user: userWithToken });
});

authRouter.post('/register', validateBody(registerSchema), (req, res) => {
  const { email, displayName, role, helperOptIn, phone } = req.body;
  const existing = Array.from(db.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(422).json({ code: 'VALIDATION_ERROR', message: 'Email already registered' });
  }

  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newUser: User = {
    id: userId,
    email,
    displayName,
    roles: [role],
    activeRole: role,
    helperOptIn: !!helperOptIn,
    phone,
    token: `token_${userId}`,
  };

  db.users.set(newUser.id, newUser);

  if (role === 'RIDER' || role === 'HELPER') {
    db.riderAvailability.set(userId, {
      userId,
      isAvailable: true,
      capacityQty: role === 'HELPER' ? 20 : 40,
      capacityUnit: 'meals',
      hasColdBag: false,
      radiusKm: 15,
      updatedAtUtc: new Date().toISOString(),
    });
  }

  res.status(201).json({ user: newUser });
});

authRouter.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

authRouter.put('/availability', authMiddleware, validateBody(riderAvailabilitySchema), (req, res) => {
  const userId = req.user!.id;
  const now = new Date().toISOString();

  const availability = {
    userId,
    ...req.body,
    updatedAtUtc: now,
  };

  db.riderAvailability.set(userId, availability);

  db.addAuditLog({
    actorKind: 'user',
    actorId: userId,
    action: 'RIDER_AVAILABILITY_UPDATED',
    entityType: 'rider',
    entityId: userId,
    afterState: availability,
  });

  res.json({ availability });
});

authRouter.get('/availability', authMiddleware, (req, res) => {
  const userId = req.user!.id;
  const availability = db.riderAvailability.get(userId);
  res.json({ availability: availability || null });
});
