import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'treasure-game-dev-secret-change-in-production';

router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Valid email is required' });
    return;
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }

  const existing = await db.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] });
  if (existing.rows.length > 0) {
    res.status(409).json({ error: 'Email already in use' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await db.execute({
    sql: 'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    args: [email, passwordHash],
  });
  const userId = Number(result.lastInsertRowid);

  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id: userId, email } });
});

router.post('/signin', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const result = await db.execute({
    sql: 'SELECT id, email, password_hash FROM users WHERE email = ?',
    args: [email],
  });

  if (result.rows.length === 0) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const row = result.rows[0];
  const valid = await bcrypt.compare(password as string, row.password_hash as string);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const userId = Number(row.id);
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  res.status(200).json({ token, user: { id: userId, email: row.email } });
});

router.get('/me', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const result = await db.execute({
    sql: 'SELECT id, email, created_at FROM users WHERE id = ?',
    args: [req.userId!],
  });

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const row = result.rows[0];
  res.json({ user: { id: row.id, email: row.email, created_at: row.created_at } });
});

export default router;
