import express from 'express';
import cors from 'cors';
import path from 'path';
import { initDatabase } from './database';
import categoriesRouter from './routes/categories';
import expensesRouter from './routes/expenses';
import budgetRouter from './routes/budget';
import aiRouter from './routes/ai';
import receiptsRouter from './routes/receipts';
import reportsRouter from './routes/reports';
import { startScheduler } from './services/scheduler';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API routes
app.use('/api/categories', categoriesRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/budget', budgetRouter);
app.use('/api/ai', aiRouter);
app.use('/api/receipts', receiptsRouter);
app.use('/api/reports', reportsRouter);

// Serve uploaded files
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
app.use('/uploads', express.static(path.join(DATA_DIR, 'uploads')));

// Serve frontend static files in production
const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// Initialize
initDatabase();
startScheduler();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`FinanceFlow server running on http://localhost:${PORT}`);
});
