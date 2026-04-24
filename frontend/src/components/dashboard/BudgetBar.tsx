import { useEffect, useState } from 'react';
import { getBudgetStatus } from '@/api/client';
import { formatCurrency } from '@/lib/utils';

function getBarColor(percentage: number): string {
  if (percentage >= 95) return 'bg-red-500';
  if (percentage >= 80) return 'bg-orange-500';
  if (percentage >= 60) return 'bg-yellow-500';
  return 'bg-green-500';
}

function getBarTrackColor(percentage: number): string {
  if (percentage >= 95) return 'bg-red-500/20';
  if (percentage >= 80) return 'bg-orange-500/20';
  if (percentage >= 60) return 'bg-yellow-500/20';
  return 'bg-green-500/20';
}

const periodLabels: Record<string, string> = {
  daily: 'Daily',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

interface BudgetBarProps {
  refreshKey?: number;
}

export default function BudgetBar({ refreshKey }: BudgetBarProps) {
  const [status, setStatus] = useState<{
    budget: any | null;
    spent: number;
    percentage: number;
    remaining: number;
  } | null>(null);

  useEffect(() => {
    getBudgetStatus().then(setStatus).catch(console.error);
  }, [refreshKey]);

  if (!status || !status.budget) return null;

  const pct = Math.min(status.percentage, 100);
  const label = periodLabels[status.budget.period] || '';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-muted-foreground">
          {label} Budget
        </span>
        <span className="text-sm font-medium">
          {formatCurrency(status.spent)} of {formatCurrency(status.budget.amount)}{' '}
          <span className="text-muted-foreground">({status.percentage}%)</span>
        </span>
      </div>
      <div className={`w-full h-4 rounded-full overflow-hidden transition-colors duration-500 ${getBarTrackColor(status.percentage)}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(status.percentage)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {formatCurrency(status.remaining)} remaining
      </p>
    </div>
  );
}
