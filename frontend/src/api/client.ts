const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unbekannter Fehler' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Categories
export const getCategories = () => request<any[]>('/categories');
export const createCategory = (data: { name: string; color: string; icon: string }) =>
  request<any>('/categories', { method: 'POST', body: JSON.stringify(data) });
export const updateCategory = (id: number, data: { name?: string; color?: string; icon?: string }) =>
  request<any>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCategory = (id: number) =>
  request<any>(`/categories/${id}`, { method: 'DELETE' });

// Expenses
export const getExpenses = (params?: Record<string, string>) => {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return request<any[]>(`/expenses${query}`);
};
export const getExpenseSummary = (params?: Record<string, string>) => {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return request<{ today: number; month: number; year: number; custom: number | null }>(`/expenses/summary${query}`);
};
export const getExpensesByCategory = (params?: Record<string, string>) => {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return request<any[]>(`/expenses/by-category${query}`);
};
export const getDailyExpenses = (days?: number) => {
  const query = days ? `?days=${days}` : '';
  return request<{ date: string; total: number }[]>(`/expenses/daily${query}`);
};
export const createExpense = (data: { amount: number; description: string; category_id: number; date: string; receipt_path?: string }) =>
  request<any>('/expenses', { method: 'POST', body: JSON.stringify(data) });
export const updateExpense = (id: number, data: Partial<{ amount: number; description: string; category_id: number; date: string }>) =>
  request<any>(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteExpense = (id: number) =>
  request<any>(`/expenses/${id}`, { method: 'DELETE' });

// Budget
export const getBudget = () => request<any | null>('/budget');
export const getBudgetStatus = () =>
  request<{ budget: any | null; spent: number; percentage: number; remaining: number }>('/budget/status');
export const createBudget = (data: { amount: number; period: string }) =>
  request<any>('/budget', { method: 'POST', body: JSON.stringify(data) });

// AI
export const analyzeExpenses = (data?: { startDate?: string; endDate?: string }) =>
  request<{ summary: string; tips: string[]; trends: string[] }>('/ai/analyze', {
    method: 'POST',
    body: JSON.stringify(data || {}),
  });

// Receipts
export const uploadReceipt = async (file: File) => {
  const formData = new FormData();
  formData.append('receipt', file);
  const res = await fetch(`${API_BASE}/receipts/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Upload fehlgeschlagen' }));
    throw new Error(error.error);
  }
  return res.json();
};

// Reports
export const getMonthlyReports = () =>
  request<{ filename: string; path: string; created: string }[]>('/reports/monthly');

export const downloadReport = async (startDate: string, endDate: string) => {
  const res = await fetch(`${API_BASE}/reports/download?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error('Report-Download fehlgeschlagen');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Report-${startDate}-${endDate}.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
};
