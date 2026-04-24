import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getExpensesByCategory, getDailyExpenses } from '@/api/client';
import { formatCurrency } from '@/lib/utils';

interface CategoryData {
  category_name: string;
  category_color: string;
  total: number;
}

interface DailyData {
  date: string;
  total: number;
}

interface CategoryChartProps {
  refreshKey?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border rounded-lg shadow-lg p-2.5 text-sm">
        <p className="font-medium">{payload[0].name || payload[0].payload.date}</p>
        <p className="text-primary">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function CategoryChart({ refreshKey }: CategoryChartProps) {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);

  useEffect(() => {
    getExpensesByCategory().then(setCategoryData).catch(console.error);
    getDailyExpenses(30).then(setDailyData).catch(console.error);
  }, [refreshKey]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="total"
                    nameKey="category_name"
                  >
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.category_color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-2 justify-center">
                {categoryData.map((c, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.category_color }} />
                    <span className="text-muted-foreground">{c.category_name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">No expenses yet</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => v.slice(5)}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `$${v}`}
                  className="text-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="hsl(217.2, 91.2%, 59.8%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">No expenses yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
