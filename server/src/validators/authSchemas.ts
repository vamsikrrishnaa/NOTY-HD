import { z } from 'zod';

export const requestOtpSchema = z.object({
  purpose: z.enum(['signup', 'login']),
  name: z.string().min(2).max(60).optional(),
  dob: z.string().optional(),
  email: z.string().email(),
});

export const verifyOtpSchema = z.object({
  purpose: z.enum(['signup', 'login']),
  name: z.string().min(2).max(60).optional(),
  dob: z.string().optional(),
  email: z.string().email(),
  otp: z.string().min(4).max(8),
  remember: z.boolean().optional(),
});

export const googleSchema = z.object({
  idToken: z.string().min(10),
  remember: z.boolean().optional(),
});
