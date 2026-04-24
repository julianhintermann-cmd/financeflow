import { Router, Request, Response } from 'express';
import db from '../database';
import { Budget } from '../types';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const budget = db.prepare(
    'SELECT * FROM budgets WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1'
  ).get() as Budget | undefined;
  res.json(budget || null);
});

router.get('/status', (_req: Request, res: Response) => {
  const budget = db.prepare(
    'SELECT * FROM budgets WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1'
  ).get() as Budget | undefined;

  if (!budget) {
    res.json({ budget: null, spent: 0, percentage: 0, remaining: 0 });
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  let spent = 0;

  if (budget.period === 'daily') {
    const row = db.prepare(
      'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date = ?'
    ).get(today) as { total: number };
    spent = row.total;
  } else if (budget.period === 'monthly') {
    const monthStart = today.slice(0, 7) + '-01';
    const row = db.prepare(
      'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date >= ? AND date <= ?'
    ).get(monthStart, today) as { total: number };
    spent = row.total;
  } else if (budget.period === 'yearly') {
    const yearStart = today.slice(0, 4) + '-01-01';
    const row = db.prepare(
      'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date >= ? AND date <= ?'
    ).get(yearStart, today) as { total: number };
    spent = row.total;
  }

  const percentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;
  const remaining = Math.max(0, budget.amount - spent);

  res.json({ budget, spent, percentage, remaining });
});

router.get('/all', (_req: Request, res: Response) => {
  const budgets = db.prepare('SELECT * FROM budgets ORDER BY created_at DESC').all();
  res.json(budgets);
});

router.post('/', (req: Request, res: Response) => {
  const { amount, period } = req.body;
  if (!amount || !period) {
    res.status(400).json({ error: 'Amount and period are required' });
    return;
  }
  if (!['daily', 'monthly', 'yearly'].includes(period)) {
    res.status(400).json({ error: 'Invalid period' });
    return;
  }

  db.prepare('UPDATE budgets SET is_active = 0 WHERE is_active = 1').run();
  const result = db.prepare(
    'INSERT INTO budgets (amount, period, is_active) VALUES (?, ?, 1)'
  ).run(amount, period);
  const budget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(budget);
});

export default router;
