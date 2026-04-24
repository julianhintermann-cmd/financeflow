import { useEffect, useState } from 'react';
import { getBudgetStatus } from '@/api/client';
import BudgetSettings from '@/components/budget/BudgetSettings';
import BudgetBar from '@/components/dashboard/BudgetBar';
import { PiggyBank } from 'lucide-react';

export default function BudgetPage() {
  const [budgetData, setBudgetData] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    getBudgetStatus().then(setBudgetData).catch(console.error);
  }, [refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PiggyBank className="w-6 h-6" />
          Budget
        </h1>
        <p className="text-muted-foreground mt-1">
          Set a budget and keep track of your spending
        </p>
      </div>

      <BudgetBar refreshKey={refreshKey} />

      <BudgetSettings
        currentBudget={budgetData?.budget || null}
        status={budgetData ? { spent: budgetData.spent, percentage: budgetData.percentage, remaining: budgetData.remaining } : null}
        onRefresh={refresh}
      />
    </div>
  );
}
