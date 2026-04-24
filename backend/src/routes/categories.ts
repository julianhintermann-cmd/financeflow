import { Router, Request, Response } from 'express';
import db from '../database';
import { Category } from '../types';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const categories = db.prepare(`
    SELECT c.*, COALESCE(SUM(e.amount), 0) as total_expenses
    FROM categories c
    LEFT JOIN expenses e ON e.category_id = c.id
    GROUP BY c.id
    ORDER BY c.name
  `).all();
  res.json(categories);
});

router.post('/', (req: Request, res: Response) => {
  const { name, color, icon } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  const result = db.prepare(
    'INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)'
  ).run(name, color || '#3B82F6', icon || 'Tag');
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(category);
});

router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, color, icon } = req.body;
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(Number(id)) as Category | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  db.prepare('UPDATE categories SET name = ?, color = ?, icon = ? WHERE id = ?')
    .run(name || existing.name, color || existing.color, icon || existing.icon, id);
  const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(Number(id));
  res.json(updated);
});

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(Number(id));
  if (!existing) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  db.prepare('DELETE FROM categories WHERE id = ?').run(Number(id));
  res.json({ success: true });
});

export default router;
