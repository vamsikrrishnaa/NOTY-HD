import { NextFunction, Request, Response } from 'express';
import { verifyJwt, signJwt, setAuthCookie } from '../utils/jwt';

export function attachUser(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (token) {
    const payload = verifyJwt(token);
    if (payload) {
      (req as any).user = payload;
      // Sliding refresh only for non-remember sessions
      if (!payload.remember && payload.exp) {
        const nowSec = Math.floor(Date.now() / 1000);
        const remaining = payload.exp - nowSec;
        if (remaining > 0 && remaining < 10 * 60) {
          const fresh = signJwt({ uid: payload.uid, email: payload.email, remember: false }, 60 * 30);
          setAuthCookie(res, fresh, false);
        }
      }
    }
  }
  next();
}
