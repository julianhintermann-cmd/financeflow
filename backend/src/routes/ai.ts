import { Router, Request, Response } from 'express';
import db from '../database';
import { chatCompletion } from '../services/openrouter';

const router = Router();

interface ExpenseRow {
  date: string;
  description: string;
  category_name: string;
  amount: number;
}

router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const monthStart = today.slice(0, 7) + '-01';

    const start = startDate || monthStart;
    const end = endDate || today;

    const expenses = db.prepare(`
      SELECT e.date, e.description, c.name as category_name, e.amount
      FROM expenses e
      LEFT JOIN categories c ON c.id = e.category_id
      WHERE e.date >= ? AND e.date <= ?
      ORDER BY e.date DESC
    `).all(start, end) as ExpenseRow[];

    if (expenses.length === 0) {
      res.json({
        summary: 'No expenses found in the selected time period.',
        tips: [],
        trends: [],
      });
      return;
    }

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const categories: Record<string, number> = {};
    for (const e of expenses) {
      const cat = e.category_name || 'Other';
      categories[cat] = (categories[cat] || 0) + e.amount;
    }

    const catSummary = Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .map(([name, amount]) => `${name}: ${amount.toFixed(2)} USD`)
      .join('\n');

    const prompt = `You are a helpful financial advisor. Analyze the following expenses and provide a useful summary.

Period: ${start} to ${end}
Total expenses: ${total.toFixed(2)} USD
Number of transactions: ${expenses.length}

Breakdown by category:
${catSummary}

Respond with a JSON object in the following format (ONLY the JSON, no additional text):
{
  "summary": "<2-3 sentence summary of the expenses>",
  "tips": ["<Saving tip 1>", "<Saving tip 2>", "<Saving tip 3>"],
  "trends": ["<Trend 1>", "<Trend 2>"]
}`;

    const response = await chatCompletion([{ role: 'user', content: prompt }]);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      res.json(JSON.parse(jsonMatch[0]));
    } else {
      res.json({ summary: response, tips: [], trends: [] });
    }
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({
      error: 'AI analysis failed. Please check your OpenRouter API key.',
    });
  }
});

export default router;
