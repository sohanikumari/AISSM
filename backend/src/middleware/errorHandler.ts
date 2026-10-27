import { Request, Response, NextFunction } from 'express';
import { ERROR_MESSAGES } from '../../../shared/src/constants';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const code = err.code || 'INTERNAL_ERROR';
  const defaultMessage = ERROR_MESSAGES[code] || err.message || 'An unexpected error occurred';

  let status = 500;
  if (code === 'NOT_FOUND') status = 404;
  else if (code === 'UNAUTHORIZED') status = 401;
  else if (code === 'FORBIDDEN') status = 403;
  else if (code === 'ALREADY_CLAIMED' || code === 'INVALID_STATE_TRANSITION' || code === 'CLAIM_EXPIRED') status = 409;
  else if (code === 'CAPACITY_EXCEEDED' || code === 'INCOMPATIBLE_SITE' || code === 'ETA_EXCEEDS_DEADLINE' || code === 'EXPIRY_EXTENSION_FORBIDDEN' || code === 'HELPER_CATEGORY_FORBIDDEN' || code === 'VALIDATION_ERROR') status = 422;
  else if (code === 'RATE_LIMITED') status = 429;

  res.status(status).json({
    code,
    message: err.message || defaultMessage,
    fields: err.fields,
    requestId: req.headers['x-request-id'] || `req_${Date.now()}`,
  });
}
