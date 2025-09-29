import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ code: 'UNAUTHENTICATED', message: 'Missing token' });
  const payload = verifyJwt(token);
  if (!payload) return res.status(401).json({ code: 'INVALID_TOKEN', message: 'Invalid token' });
  (req as any).user = payload;
  next();
}
