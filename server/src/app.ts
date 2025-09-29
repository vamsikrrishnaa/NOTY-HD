import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env, isProd } from './config.js';
import { attachUser } from './middlewares/attachUser.js';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import { errorHandler } from './middlewares/error.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(morgan(isProd ? 'combined' : 'dev'));
  app.use(express.json());
  app.use(cookieParser());

  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    })
  );

  app.use(rateLimit({ windowMs: 60_000, max: 100 }));

  app.get('/health', (_req, res) => res.json({ ok: true }));

  // Minimal static asset bridge so client can use root images without duplication
  app.get('/assets/:name', (req, res) => {
    const allowed = new Set(['logo.png', 'win.png']);
    const name = req.params.name;
    if (!allowed.has(name)) return res.status(404).end();
    const rootPath = path.resolve(process.cwd(), '..'); // project root (VK-A)
    const filePath = path.join(rootPath, name);
    res.sendFile(filePath);
  });

  app.use(attachUser);

  app.use('/api/auth', authRoutes);
  app.use('/api/notes', notesRoutes);

  app.use(errorHandler);

  return app;
}
