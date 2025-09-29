import { Request, Response, NextFunction } from 'express';

export function requireCsrf(req: Request, res: Response, next: NextFunction) {
  const token = (req.headers['x-csrf-token'] as string) || '';
  const cookie = (req as any).cookies?.csrf;
  if (!cookie || !token || cookie !== token) {
    return res.status(403).json({ code: 'CSRF_MISMATCH', message: 'Invalid CSRF token' });
  }
  next();
}
