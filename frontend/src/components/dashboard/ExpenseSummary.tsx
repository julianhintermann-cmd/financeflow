import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getExpenseSummary } from '@/api/client';
import { formatCurrency } from '@/lib/utils';
import { CalendarDays, CalendarRange, Calendar, CalendarSearch } from 'lucide-react';

interface SummaryData {
  today: number;
  month: number;
  year: number;
  custom: number | null;
}

interface ExpenseSummaryProps {
  refreshKey?: number;
}

export default function ExpenseSummary({ refreshKey }: ExpenseSummaryProps) {
  const [data, setData] = useState<SummaryData>({ today: 0, month: 0, year: 0, custom: null });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const params: Record<string, string> = {};
    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    getExpenseSummary(params).then(setData).catch(console.error);
  }, [refreshKey, startDate, endDate]);

  const cards = [
    { label: 'Today', value: data.today, icon: CalendarDays, color: 'text-blue-500' },
    { label: 'This Month', value: data.month, icon: Calendar, color: 'text-emerald-500' },
    { label: 'This Year', value: data.year, icon: CalendarRange, color: 'text-violet-500' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <card.icon className={`w-4 h-4 ${card.color}`} />
              <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
            </div>
            <p className="text-xl md:text-2xl font-bold tracking-tight">{formatCurrency(card.value)}</p>
          </CardContent>
        </Card>
      ))}

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarSearch className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-muted-foreground">Custom Range</span>
          </div>
          {data.custom !== null ? (
            <p className="text-xl md:text-2xl font-bold tracking-tight">{formatCurrency(data.custom)}</p>
          ) : (
            <div className="flex gap-1.5">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs h-8"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs h-8"
              />
            </div>
          )}
          {data.custom !== null && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="text-xs text-primary hover:underline mt-1"
            >
              Reset
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
