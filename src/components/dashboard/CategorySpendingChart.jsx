import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters';

const BAR_COLORS = ['#FFD700', '#E6C200', '#CCAD00', '#B39900', '#998500', '#807000'];

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-xl border border-portfolio-border bg-portfolio-card px-3 py-2 shadow-card">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-portfolio-gray">
        {item.category}
      </p>
      <p className="text-sm font-bold text-white">{formatCurrency(item.amount)}</p>
      {item.limit > 0 ? (
        <p className="mt-0.5 text-xs text-portfolio-gray">
          Budget {formatCurrency(item.limit)}
        </p>
      ) : null}
    </div>
  );
}

export default function CategorySpendingChart({ categorySpending, budgets = {} }) {
  const data = useMemo(() => {
    return Object.entries(categorySpending)
      .filter(([, amount]) => amount > 0)
      .map(([category, amount]) => ({
        category: category.length > 10 ? `${category.slice(0, 9)}…` : category,
        fullName: category,
        amount,
        limit: Number(budgets[category]) || 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [categorySpending, budgets]);

  if (data.length === 0) {
    return (
      <Card animate>
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
          By Category
        </h2>
        <p className="mb-3 text-xs text-portfolio-gray">Where your money went</p>
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-portfolio-border bg-portfolio-elevated/40 text-sm text-portfolio-gray">
          <i className="bi bi-tags text-lg" aria-hidden="true" />
          No category spending yet
        </div>
      </Card>
    );
  }

  const chartHeight = Math.max(140, data.length * 32);

  return (
    <Card animate>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
            By Category
          </h2>
          <p className="mt-0.5 text-xs text-portfolio-gray">Top spending categories</p>
        </div>
        <Link
          to="/budget"
          className="shrink-0 text-xs font-medium text-portfolio-gray transition-colors hover:text-white"
        >
          Budget →
        </Link>
      </div>

      <div className="w-full" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 4, left: 0, bottom: 0 }}
          >
            <XAxis
              type="number"
              tick={{ fill: '#888888', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatCompactCurrency}
            />
            <YAxis
              type="category"
              dataKey="category"
              width={76}
              tick={{ fill: '#cccccc', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="amount" radius={[0, 6, 6, 0]} maxBarSize={14}>
              {data.map((entry, index) => (
                <Cell
                  key={entry.fullName}
                  fill={
                    entry.limit > 0 && entry.amount > entry.limit
                      ? '#FF4569'
                      : BAR_COLORS[index % BAR_COLORS.length]
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
