import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middlewares/auth.js';
import { NoteModel } from '../models/Note.js';
import { requireCsrf } from '../middlewares/csrf.js';

const router = Router();

const createSchema = z.object({ content: z.string().min(1).max(2000) });

router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = (req as any).user.uid;
    const notes = await NoteModel.find({ userId: uid }).sort({ createdAt: -1 });
    res.json({ ok: true, notes });
  } catch (err) { next(err); }
});

router.post('/', requireAuth, requireCsrf, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message });
    const note = await NoteModel.create({ userId: (req as any).user.uid, content: parsed.data.content });
    res.status(201).json({ ok: true, note });
  } catch (err) { next(err); }
});

router.delete('/:id', requireAuth, requireCsrf, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deleted = await NoteModel.findOneAndDelete({ _id: id, userId: (req as any).user.uid });
    if (!deleted) return res.status(404).json({ code: 'NOT_FOUND', message: 'Note not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
