import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'finance.db');
const db: import('better-sqlite3').Database = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#3B82F6',
      icon TEXT NOT NULL DEFAULT 'Tag',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      category_id INTEGER NOT NULL,
      date DATE NOT NULL,
      receipt_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      period TEXT NOT NULL CHECK(period IN ('daily', 'monthly', 'yearly')),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
  `);

  const count = db.prepare('SELECT COUNT(*) as cnt FROM categories').get() as { cnt: number };
  if (count.cnt === 0) {
    const insert = db.prepare('INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)');
    const defaults = [
      ['Groceries', '#22C55E', 'ShoppingCart'],
      ['Transport', '#3B82F6', 'Car'],
      ['Housing', '#8B5CF6', 'Home'],
      ['Entertainment', '#F97316', 'Gamepad2'],
      ['Health', '#EF4444', 'Heart'],
      ['Other', '#6B7280', 'MoreHorizontal'],
    ];
    const insertMany = db.transaction((cats: string[][]) => {
      for (const cat of cats) insert.run(cat[0], cat[1], cat[2]);
    });
    insertMany(defaults);
  }
}

export default db;
