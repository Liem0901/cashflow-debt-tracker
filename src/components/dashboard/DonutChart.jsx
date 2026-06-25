import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { METRIC_COLORS, METRIC_DIMS } from '../../theme/metricColors';

const SEGMENTS = {
  Expenses: { color: METRIC_COLORS.expense, dim: METRIC_DIMS.expense },
  Debt: { color: METRIC_COLORS.debt, dim: METRIC_DIMS.debt },
  'Safe Balance': { color: METRIC_COLORS.cash, dim: METRIC_DIMS.cash },
};

const TRACK_COLOR = '#1a1a1a';

function SegmentDetail({ entry }) {
  if (!entry) {
    return (
      <p className="text-center text-xs text-portfolio-gray">
        Tap a segment for details
      </p>
    );
  }

  const label = entry.name === 'Safe Balance' ? 'Safe' : entry.name;
  const segment = SEGMENTS[entry.name];

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-xl border border-portfolio-border bg-portfolio-elevated px-3 py-2">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: segment.color }}
      />
      <span className="text-[10px] font-semibold uppercase tracking-wide text-portfolio-gray">
        {label} - {Math.round(entry.percent)}%
      </span>
      <span className="text-amount text-sm font-bold text-white">
        {formatCurrency(entry.value, { twoDecimals: true })}
      </span>
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

  const [activeEntry, setActiveEntry] = useState(null);

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

  const handleSegmentActive = (_, index) => {
    setActiveEntry(dataWithPercent[index] ?? null);
  };

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
              onMouseEnter={handleSegmentActive}
              onMouseMove={handleSegmentActive}
              onMouseLeave={() => setActiveEntry(null)}
              onClick={handleSegmentActive}
            >
              {dataWithPercent.map((entry) => (
                <Cell key={entry.name} fill={SEGMENTS[entry.name].color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex max-w-[5.5rem] flex-col items-center justify-center rounded-full border border-portfolio-border/60 bg-portfolio-card/90 px-2 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm">
            <p className="text-[10px] font-medium uppercase tracking-wide text-portfolio-gray">
              Safe
            </p>
            <p
              className={`text-amount text-center text-sm font-bold leading-tight sm:text-base ${
                isNegative ? 'text-metric-debt' : 'text-white'
              }`}
            >
              {formatCurrency(safeBalance)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-2 min-h-[2.75rem] px-1">
        <SegmentDetail entry={activeEntry} />
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:grid sm:grid-cols-3 sm:gap-2">
        {dataWithPercent.map((entry) => {
          const segment = SEGMENTS[entry.name];
          const label = entry.name === 'Safe Balance' ? 'Safe' : entry.name;
          return (
            <div
              key={entry.name}
              className="flex items-center justify-between gap-3 rounded-xl border border-portfolio-border bg-portfolio-elevated px-3 py-2.5 sm:flex-col sm:items-stretch sm:gap-1 sm:px-2.5 sm:py-2"
              style={{ backgroundImage: `linear-gradient(180deg, ${segment.dim} 0%, transparent 100%)` }}
            >
              <div className="flex min-w-0 items-center gap-1.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-[10px] font-medium uppercase tracking-wide text-portfolio-gray">
                  {label} - {Math.round(entry.percent)}%
                </span>
              </div>
              <p className="text-amount shrink-0 whitespace-nowrap text-sm font-semibold text-white sm:text-xs">
                {formatCurrency(entry.value, { twoDecimals: true })}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
