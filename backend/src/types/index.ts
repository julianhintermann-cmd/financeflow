export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  created_at: string;
}

export interface Expense {
  id: number;
  amount: number;
  description: string;
  category_id: number;
  date: string;
  receipt_path: string | null;
  created_at: string;
}

export interface ExpenseWithCategory extends Expense {
  category_name: string;
  category_color: string;
  category_icon: string;
}

export interface Budget {
  id: number;
  amount: number;
  period: 'daily' | 'monthly' | 'yearly';
  is_active: boolean;
  created_at: string;
}

export interface BudgetStatus {
  budget: Budget | null;
  spent: number;
  percentage: number;
  remaining: number;
}

export interface ExpenseSummary {
  today: number;
  month: number;
  year: number;
  custom?: number;
}

export interface CategorySummary {
  category_id: number;
  category_name: string;
  category_color: string;
  category_icon: string;
  total: number;
}

export interface ReceiptParseResult {
  amount: number | null;
  description: string | null;
  date: string | null;
  suggestedCategory: string | null;
}

export interface AiAnalysisResult {
  summary: string;
  tips: string[];
  trends: string[];
}
