import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createBudget } from '@/api/client';
import { formatCurrency } from '@/lib/utils';
import { Loader2, PiggyBank, Target, TrendingDown, Calendar } from 'lucide-react';

interface BudgetSettingsProps {
  currentBudget: any | null;
  status: { spent: number; percentage: number; remaining: number } | null;
  onRefresh: () => void;
}

const periodLabels: Record<string, string> = {
  daily: 'Daily',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

export default function BudgetSettings({ currentBudget, status, onRefresh }: BudgetSettingsProps) {
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!amount) return;
    setLoading(true);
    try {
      await createBudget({ amount: parseFloat(amount), period });
      setAmount('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {currentBudget && status && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Budget</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(currentBudget.amount)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {periodLabels[currentBudget.period]}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-muted-foreground">Spent</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(status.spent)}</p>
              <p className="text-xs text-muted-foreground mt-1">{status.percentage}% used</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <PiggyBank className="w-4 h-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Remaining</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(status.remaining)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {100 - status.percentage}% available
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {currentBudget ? 'Change Budget' : 'Set Budget'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="budget-amount">Amount (USD)</Label>
              <Input
                id="budget-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 1500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Period</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={handleSave} disabled={loading || !amount}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Set Budget
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
