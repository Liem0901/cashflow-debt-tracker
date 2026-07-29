import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Card from '../ui/Card';
import { formatCurrency, formatCompactCurrency, getCalendarDays } from '../../utils/formatters';
import { METRIC_COLORS } from '../../theme/metricColors';

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-xl border border-portfolio-border bg-portfolio-card px-3 py-2 shadow-card">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-portfolio-gray">
        Day {item.day}
      </p>
      <p className="text-sm font-bold text-white">{formatCurrency(item.amount)}</p>
    </div>
  );
}

export default function ExpenseTrendChart({ dailyExpenses, monthKey }) {
  const data = useMemo(() => {
    const cells = getCalendarDays(monthKey).filter(Boolean);
    return cells.map((dateStr) => {
      const day = Number(dateStr.split('-')[2]);
      const amount = dailyExpenses[dateStr] || 0;
      return { day, dateStr, amount, label: String(day) };
    });
  }, [dailyExpenses, monthKey]);

  const total = useMemo(() => data.reduce((sum, d) => sum + d.amount, 0), [data]);
  const maxAmount = useMemo(() => Math.max(...data.map((d) => d.amount), 0), [data]);

  if (total === 0) {
    return (
      <Card animate>
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
          Daily Spending
        </h2>
        <p className="mb-3 text-xs text-portfolio-gray">Expense activity this month</p>
        <div className="flex h-44 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-portfolio-border bg-portfolio-elevated/40 text-sm text-portfolio-gray">
          <i className="bi bi-bar-chart-line text-lg" aria-hidden="true" />
          No expenses recorded yet
        </div>
      </Card>
    );
  }

  return (
    <Card animate>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
            Daily Spending
          </h2>
          <p className="mt-0.5 text-xs text-portfolio-gray">Expense activity this month</p>
        </div>
        <p className="text-amount shrink-0 text-sm font-bold text-metric-expense">
          {formatCurrency(total)}
        </p>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: '#888888', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fill: '#888888', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatCompactCurrency}
              width={36}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={14}>
              {data.map((entry) => (
                <Cell
                  key={entry.dateStr}
                  fill={entry.amount === maxAmount && maxAmount > 0 ? METRIC_COLORS.expense : '#3a3a3a'}
                  fillOpacity={entry.amount === maxAmount && maxAmount > 0 ? 1 : 0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
