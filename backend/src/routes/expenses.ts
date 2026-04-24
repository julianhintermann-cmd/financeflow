import { Router, Request, Response } from 'express';
import db from '../database';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { startDate, endDate, category_id, limit = '50', offset = '0' } = req.query;
  let query = `
    SELECT e.*, c.name as category_name, c.color as category_color, c.icon as category_icon
    FROM expenses e
    LEFT JOIN categories c ON c.id = e.category_id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (startDate) {
    query += ' AND e.date >= ?';
    params.push(startDate as string);
  }
  if (endDate) {
    query += ' AND e.date <= ?';
    params.push(endDate as string);
  }
  if (category_id) {
    query += ' AND e.category_id = ?';
    params.push(Number(category_id));
  }

  query += ' ORDER BY e.date DESC, e.created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const expenses = db.prepare(query).all(...params);
  res.json(expenses);
});

router.get('/summary', (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  const today = new Date().toISOString().split('T')[0];
  const monthStart = today.slice(0, 7) + '-01';
  const yearStart = today.slice(0, 4) + '-01-01';

  const todaySum = db.prepare(
    'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date = ?'
  ).get(today) as { total: number };

  const monthSum = db.prepare(
    'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date >= ? AND date <= ?'
  ).get(monthStart, today) as { total: number };

  const yearSum = db.prepare(
    'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date >= ? AND date <= ?'
  ).get(yearStart, today) as { total: number };

  let customSum = null;
  if (startDate && endDate) {
    const result = db.prepare(
      'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date >= ? AND date <= ?'
    ).get(startDate as string, endDate as string) as { total: number };
    customSum = result.total;
  }

  res.json({
    today: todaySum.total,
    month: monthSum.total,
    year: yearSum.total,
    custom: customSum,
  });
});

router.get('/by-category', (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  const today = new Date().toISOString().split('T')[0];
  const monthStart = today.slice(0, 7) + '-01';

  const start = (startDate as string) || monthStart;
  const end = (endDate as string) || today;

  const data = db.prepare(`
    SELECT c.id as category_id, c.name as category_name, c.color as category_color,
           c.icon as category_icon, COALESCE(SUM(e.amount), 0) as total
    FROM categories c
    LEFT JOIN expenses e ON e.category_id = c.id AND e.date >= ? AND e.date <= ?
    GROUP BY c.id
    HAVING total > 0
    ORDER BY total DESC
  `).all(start, end);

  res.json(data);
});

router.get('/daily', (req: Request, res: Response) => {
  const { days = '30' } = req.query;
  const data = db.prepare(`
    SELECT date, SUM(amount) as total
    FROM expenses
    WHERE date >= date('now', ? || ' days')
    GROUP BY date
    ORDER BY date ASC
  `).all('-' + days);
  res.json(data);
});

router.post('/', (req: Request, res: Response) => {
  const { amount, description, category_id, date } = req.body;
  if (!amount || !category_id || !date) {
    res.status(400).json({ error: 'Amount, category, and date are required' });
    return;
  }
  const result = db.prepare(
    'INSERT INTO expenses (amount, description, category_id, date) VALUES (?, ?, ?, ?)'
  ).run(amount, description || '', category_id, date);
  const expense = db.prepare(`
    SELECT e.*, c.name as category_name, c.color as category_color, c.icon as category_icon
    FROM expenses e
    LEFT JOIN categories c ON c.id = e.category_id
    WHERE e.id = ?
  `).get(result.lastInsertRowid);
  res.status(201).json(expense);
});

router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount, description, category_id, date } = req.body;
  const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(Number(id));
  if (!existing) {
    res.status(404).json({ error: 'Expense not found' });
    return;
  }
  db.prepare(
    'UPDATE expenses SET amount = COALESCE(?, amount), description = COALESCE(?, description), category_id = COALESCE(?, category_id), date = COALESCE(?, date) WHERE id = ?'
  ).run(amount, description, category_id, date, Number(id));
  const updated = db.prepare(`
    SELECT e.*, c.name as category_name, c.color as category_color, c.icon as category_icon
    FROM expenses e LEFT JOIN categories c ON c.id = e.category_id WHERE e.id = ?
  `).get(Number(id));
  res.json(updated);
});

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(Number(id));
  if (!existing) {
    res.status(404).json({ error: 'Expense not found' });
    return;
  }
  db.prepare('DELETE FROM expenses WHERE id = ?').run(Number(id));
  res.json({ success: true });
});

export default router;
