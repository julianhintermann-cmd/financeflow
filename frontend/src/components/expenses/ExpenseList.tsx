import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getExpenses, deleteExpense } from '@/api/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Trash2, Receipt } from 'lucide-react';

interface ExpenseListProps {
  refreshKey?: number;
  onRefresh: () => void;
}

export default function ExpenseList({ refreshKey, onRefresh }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    getExpenses({ limit: '30' }).then(setExpenses).catch(console.error);
  }, [refreshKey]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await deleteExpense(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Receipt className="w-4 h-4" />
          Recent Expenses
        </CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No expenses yet. Add your first expense!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Description</th>
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Category</th>
                  <th className="text-right py-2 pr-4 font-medium text-muted-foreground">Amount</th>
                  <th className="py-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-2.5 pr-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(exp.date)}
                    </td>
                    <td className="py-2.5 pr-4 max-w-[200px] truncate">
                      {exp.description || '-'}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: (exp.category_color || '#6B7280') + '20',
                          color: exp.category_color || '#6B7280',
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: exp.category_color }} />
                        {exp.category_name || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-right font-medium whitespace-nowrap">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="py-2.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(exp.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
