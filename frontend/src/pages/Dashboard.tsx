import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import BudgetBar from '@/components/dashboard/BudgetBar';
import ExpenseSummary from '@/components/dashboard/ExpenseSummary';
import CategoryChart from '@/components/dashboard/CategoryChart';
import AiAnalysis from '@/components/dashboard/AiAnalysis';
import ExpenseList from '@/components/expenses/ExpenseList';
import AddExpenseDialog from '@/components/expenses/AddExpenseDialog';

export default function Dashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <BudgetBar refreshKey={refreshKey} />
        </div>
        <Button onClick={() => setDialogOpen(true)} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      <ExpenseSummary refreshKey={refreshKey} />
      <CategoryChart refreshKey={refreshKey} />
      <AiAnalysis />
      <ExpenseList refreshKey={refreshKey} onRefresh={refresh} />

      <AddExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={refresh}
      />
    </div>
  );
}
