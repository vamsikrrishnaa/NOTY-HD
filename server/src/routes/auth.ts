import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { requestOtpSchema, verifyOtpSchema, googleSchema } from '../validators/authSchemas.js';
import { OtpModel } from '../models/Otp.js';
import { UserModel } from '../models/User.js';
import { sendMail } from '../utils/mailer.js';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../config.js';
import { setAuthCookie, clearAuthCookie, signJwt, generateCsrfToken, setCsrfCookie, clearCsrfCookie } from '../utils/jwt.js';

const router = Router();

const otpWindowMs = 10 * 60 * 1000; // 10 minutes
const maxAttempts = 5;

router.post('/request-otp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = requestOtpSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message });
    const { purpose, name, dob, email } = parsed.data;
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;

    const existing = await UserModel.findOne({ email });
    if (purpose === 'signup' && existing) {
      const msg = existing.provider === 'google'
        ? 'Email already registered with Google. Please sign in with Google.'
        : 'Email already registered. Please sign in.';
      return res.status(409).json({ code: 'EMAIL_TAKEN', message: msg });
    }
    if (purpose === 'login' && !existing) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'No account found. Please sign up.' });
    }

    // Abuse controls
    const now = new Date();
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    // Cooldown: only 1 OTP per minute per email or IP
    const [recentByEmail, recentByIp, lastByEmail] = await Promise.all([
      OtpModel.countDocuments({ email, createdAt: { $gt: oneMinuteAgo } }),
      OtpModel.countDocuments({ ip, createdAt: { $gt: oneMinuteAgo } }),
      OtpModel.findOne({ email }).sort({ createdAt: -1 }),
    ]);
    if (recentByEmail > 0 || recentByIp > 0) {
      const waitSec = lastByEmail ? Math.max(0, 60 - Math.floor((now.getTime() - lastByEmail.createdAt.getTime()) / 1000)) : 60;
      return res.status(429).json({ code: 'OTP_COOLDOWN', message: `Please wait ${waitSec}s before requesting another OTP.` });
    }
    // Limit: max 5 OTPs per 10 minutes per email
    const count10min = await OtpModel.countDocuments({ email, createdAt: { $gt: tenMinutesAgo } });
    if (count10min >= 5) {
      return res.status(429).json({ code: 'OTP_RATE_LIMIT', message: 'Too many OTP requests. Please try again later.' });
    }

    const code = (Math.floor(100000 + Math.random() * 900000)).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + otpWindowMs);

    await OtpModel.create({ email, codeHash, purpose, expiresAt, ip });

    const subject = 'Your OTP Code';
    const text = `Your OTP code is ${code}. It expires in 10 minutes.`;
    const html = `<p>Your OTP code is <b>${code}</b>. It expires in 10 minutes.</p>`;
    await sendMail({ to: email, subject, text, html });

    res.json({ ok: true, message: 'OTP sent to email', meta: { purpose, email, name, dob } });
  } catch (err) {
    next(err);
  }
});

router.post('/verify-otp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message });
    const { purpose, name, dob, email, otp, remember } = parsed.data;

    const latest = await OtpModel.findOne({ email, purpose }).sort({ createdAt: -1 });
    if (!latest) return res.status(400).json({ code: 'OTP_MISSING', message: 'Please request a new OTP.' });
    if (latest.used) return res.status(400).json({ code: 'OTP_USED', message: 'OTP already used, request a new one.' });
    if (latest.expiresAt < new Date()) return res.status(400).json({ code: 'OTP_EXPIRED', message: 'OTP expired, request a new one.' });
    if (latest.attempts >= maxAttempts) return res.status(429).json({ code: 'OTP_RATE_LIMIT', message: 'Too many attempts, request a new OTP.' });

    const match = await bcrypt.compare(otp, latest.codeHash);
    if (!match) {
      latest.attempts += 1;
      await latest.save();
      return res.status(400).json({ code: 'OTP_INVALID', message: 'Incorrect OTP.' });
    }

    latest.used = true;
    await latest.save();

    let user = await UserModel.findOne({ email });
    if (purpose === 'signup') {
      if (!user) {
        user = await UserModel.create({
          name: name || email.split('@')[0],
          email,
          dob: dob ? new Date(dob) : undefined,
          provider: 'email',
        });
      }
    }

    if (!user) return res.status(404).json({ code: 'NOT_FOUND', message: 'Account not found.' });

    const token = signJwt({ uid: user._id.toString(), email: user.email, remember }, remember ? 60 * 60 * 24 * 7 : 60 * 30);
    setAuthCookie(res, token, Boolean(remember));
    const csrf = generateCsrfToken();
    setCsrfCookie(res, csrf);

    res.json({ ok: true, user: { id: user._id, name: user.name, email: user.email, provider: user.provider } });
  } catch (err) {
    next(err);
  }
});

router.post('/google', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = googleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message });
    const { idToken, remember } = parsed.data;

    if (!env.GOOGLE_CLIENT_ID) return res.status(500).json({ code: 'CONFIG_MISSING', message: 'Google client ID not configured' });

    const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken, audience: env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload) return res.status(401).json({ code: 'GOOGLE_INVALID', message: 'Invalid Google token' });

    const email = payload.email!;
    const name = payload.name || email.split('@')[0];
    const sub = payload.sub!;

    let user = await UserModel.findOne({ email });
    if (user && user.provider === 'email') {
      return res.status(409).json({ code: 'PROVIDER_MISMATCH', message: 'This email is registered with OTP. Please sign in using email OTP.' });
    }
    if (!user) {
      user = await UserModel.create({ name, email, provider: 'google', googleId: sub });
    }

    const token = signJwt({ uid: user._id.toString(), email: user.email, remember }, remember ? 60 * 60 * 24 * 7 : 60 * 30);
    setAuthCookie(res, token, Boolean(remember));
    const csrf = generateCsrfToken();
    setCsrfCookie(res, csrf);
    res.json({ ok: true, user: { id: user._id, name: user.name, email: user.email, provider: user.provider } });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req: Request, res: Response) => {
  clearAuthCookie(res);
  clearCsrfCookie(res);
  res.json({ ok: true });
});

router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = (req as any).user;
    if (!payload) return res.status(200).json({ user: null });
    const user = await UserModel
      .findById(payload.uid)
      .select('name email provider')
      .lean<{ _id: any; name: string; email: string; provider: string }>();
    if (!user) return res.status(200).json({ user: null });
    res.json({ user: { id: user._id, name: user.name, email: user.email, provider: user.provider } });
  } catch (err) {
    next(err);
  }
});

export default router;
