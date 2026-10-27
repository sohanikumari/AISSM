import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { Role, User } from '../../../shared/src/types';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      activeRole?: Role;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Demo mode / header auth
  const authHeader = req.headers.authorization;
  const simulatedUserId = (req.headers['x-user-id'] as string) || (authHeader ? authHeader.replace('Bearer ', '') : undefined);

  if (!simulatedUserId) {
    // Default to admin in demo mode if unauthenticated, else return 401
    const defaultUser = db.users.get('admin1');
    if (defaultUser) {
      req.user = defaultUser;
      req.activeRole = (req.headers['x-active-role'] as Role) || defaultUser.activeRole;
      return next();
    }
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required' });
  }

  const user = db.users.get(simulatedUserId);
  if (!user) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid or unknown user' });
  }

  req.user = user;
  req.activeRole = (req.headers['x-active-role'] as Role) || user.activeRole;
  next();
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required' });
    }

    const currentRole = req.activeRole || req.user.activeRole;
    if (req.user.roles.includes('ADMIN') || allowedRoles.includes(currentRole)) {
      return next();
    }

    return res.status(403).json({
      code: 'FORBIDDEN',
      message: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`,
    });
  };
}
