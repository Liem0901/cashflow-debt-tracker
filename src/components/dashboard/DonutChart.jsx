import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { METRIC_COLORS, METRIC_DIMS } from '../../theme/metricColors';

const SEGMENTS = {
  Expenses: { color: METRIC_COLORS.expense, dim: METRIC_DIMS.expense },
  Debt: { color: METRIC_COLORS.debt, dim: METRIC_DIMS.debt },
  'Safe Balance': { color: METRIC_COLORS.cash, dim: METRIC_DIMS.cash },
};

const TRACK_COLOR = '#1a1a1a';

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const pct = item.percent != null ? Math.round(item.percent * 100) : null;

  return (
    <div className="rounded-xl border border-portfolio-border bg-portfolio-card px-3 py-2 shadow-card">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-portfolio-gray">
        {item.name}
      </p>
      <p className="text-sm font-bold text-white">
        {formatCurrency(item.value)}{' '}
        <span className="text-xs font-medium text-portfolio-gray">
          ({pct}%)
        </span>
      </p>
    </div>
  );
}

export default function DonutChart({ totalExpenses, upcomingDebt, safeBalance }) {
  const safeDisplay = Math.max(0, safeBalance);

  const data = useMemo(
    () =>
      [
        { name: 'Expenses', value: totalExpenses },
        { name: 'Debt', value: upcomingDebt },
        { name: 'Safe Balance', value: safeDisplay },
      ].filter((d) => d.value > 0),
    [totalExpenses, upcomingDebt, safeDisplay]
  );

  const total = data.reduce((s, d) => s + d.value, 0);

  const dataWithPercent = useMemo(
    () =>
      data.map((entry) => ({
        ...entry,
        percent: total > 0 ? (entry.value / total) * 100 : 0,
      })),
    [data, total]
  );

  if (total === 0) {
    return (
      <Card animate>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
          Breakdown
        </h2>
        <div className="flex h-52 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-portfolio-border bg-portfolio-elevated/40 text-sm text-portfolio-gray">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-portfolio-border bg-portfolio-muted/50">
            <i className="bi bi-pie-chart text-lg text-portfolio-gray" aria-hidden="true" />
          </span>
          No data yet this month
        </div>
      </Card>
    );
  }

  const isNegative = safeBalance < 0;

  return (
    <Card animate>
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
        Breakdown
      </h2>
      <p className="mb-3 text-xs text-portfolio-gray">Where your money goes this month</p>

      <div className="relative mx-auto h-56 w-full max-w-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[{ value: 1 }]}
              cx="50%"
              cy="50%"
              innerRadius="72%"
              outerRadius="92%"
              dataKey="value"
              fill={TRACK_COLOR}
              stroke="none"
              isAnimationActive={false}
            />
            <Pie
              data={dataWithPercent}
              cx="50%"
              cy="50%"
              innerRadius="72%"
              outerRadius="92%"
              paddingAngle={3}
              cornerRadius={10}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={700}
              animationEasing="ease-out"
            >
              {dataWithPercent.map((entry) => (
                <Cell key={entry.name} fill={SEGMENTS[entry.name].color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex h-[5.5rem] w-[5.5rem] flex-col items-center justify-center rounded-full border border-portfolio-border/60 bg-portfolio-card/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm">
            <p className="text-[10px] font-medium uppercase tracking-wide text-portfolio-gray">
              Safe
            </p>
            <p
              className={`text-amount text-base font-bold leading-tight ${isNegative ? 'text-metric-debt' : 'text-white'
                }`}
            >
              {formatCurrency(safeBalance)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {dataWithPercent.map((entry) => {
          const segment = SEGMENTS[entry.name];
          return (
            <div
              key={entry.name}
              className="rounded-xl border border-portfolio-border bg-portfolio-elevated px-2.5 py-2"
              style={{ backgroundImage: `linear-gradient(180deg, ${segment.dim} 0%, transparent 100%)` }}
            >
              <div className="mb-1 flex items-center gap-1.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="truncate text-[10px] font-medium uppercase tracking-wide text-portfolio-gray">
                  {entry.name === 'Safe Balance' ? 'Safe' : entry.name}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-1">
                <p className="truncate text-sm font-semibold text-white">
                  {formatCurrency(entry.value)}
                </p>
                <p className="shrink-0 text-[11px] text-portfolio-gray">
                  {Math.round(entry.percent)}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
