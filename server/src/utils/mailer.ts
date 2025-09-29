import nodemailer from 'nodemailer';
import { env } from '../config.js';

export interface SendMailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

let transporter: nodemailer.Transporter | null = null;

export function getTransporter() {
  if (
    env.SMTP_HOST &&
    env.SMTP_PORT &&
    env.SMTP_USER &&
    env.SMTP_PASS
  ) {
    if (!transporter) {
      transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT),
        secure: Number(env.SMTP_PORT) === 465,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      });
    }
    return transporter;
  }
  return null;
}

export async function sendMail(params: SendMailParams) {
  const tx = getTransporter();
  if (!tx) {
    console.log(`[MAIL:FALLBACK] To:${params.to} Subject:${params.subject} Body:${params.text}`);
    return;
  }
  const from = env.SMTP_FROM ? `Notes App <${env.SMTP_FROM}>` : `Notes App <${env.SMTP_USER}>`;
  await tx.sendMail({ from, ...params });
}
