import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { env, isProd } from '../config';
import { Response } from 'express';
import crypto from 'crypto';

export interface JwtPayload {
  uid: string;
  email: string;
  remember?: boolean;
  iat?: number;
  exp?: number;
}

export function signJwt(payload: JwtPayload, expiresInSeconds: number = 60 * 60 * 24 * 7) {
  const options: SignOptions = { expiresIn: expiresInSeconds };
  return jwt.sign(payload as unknown as object, env.JWT_SECRET as Secret, options);
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET as Secret) as JwtPayload;
  } catch {
    return null;
  }
}

export function setAuthCookie(res: Response, token: string, remember: boolean) {
  const base = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  } as any;
  if (remember) {
    base.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  }
  // If not remember: session cookie (no maxAge) so closing browser logs out
  res.cookie('token', token, base);
}

export function clearAuthCookie(res: Response) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
}

export function generateCsrfToken() {
  return crypto.randomBytes(16).toString('hex');
}

export function setCsrfCookie(res: Response, token: string) {
  res.cookie('csrf', token, {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearCsrfCookie(res: Response) {
  res.clearCookie('csrf', {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
}
