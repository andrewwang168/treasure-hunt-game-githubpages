import { Router, Request, Response } from 'express';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { score, result } = req.body;

  if (typeof score !== 'number') {
    res.status(400).json({ error: 'score must be a number' });
    return;
  }
  if (!['win', 'tie', 'loss'].includes(result)) {
    res.status(400).json({ error: 'result must be win, tie, or loss' });
    return;
  }

  const inserted = await db.execute({
    sql: 'INSERT INTO scores (user_id, score, result) VALUES (?, ?, ?)',
    args: [req.userId!, score, result],
  });

  res.status(201).json({ id: Number(inserted.lastInsertRowid) });
});

router.get('/me', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const result = await db.execute({
    sql: 'SELECT id, score, result, created_at FROM scores WHERE user_id = ? ORDER BY created_at DESC',
    args: [req.userId!],
  });

  res.json({ scores: result.rows });
});

export default router;
