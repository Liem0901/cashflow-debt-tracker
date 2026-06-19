import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';

const SEGMENT_COLORS = {
  'Cash Expenses': '#FFD700',
  Debt: '#FF1744',
  'Safe Balance': '#00FFAA',
};

export default function DonutChart({ cashExpenses, upcomingDebt, safeBalance }) {
  const safeDisplay = Math.max(0, safeBalance);
  const data = [
    { name: 'Cash Expenses', value: cashExpenses },
    { name: 'Debt', value: upcomingDebt },
    { name: 'Safe Balance', value: safeDisplay },
  ].filter((d) => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <Card animate>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
          Breakdown
        </h2>
        <div className="flex h-48 items-center justify-center text-sm text-portfolio-gray">
          No data yet this month
        </div>
      </Card>
    );
  }

  return (
    <Card animate>
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
        Breakdown
      </h2>
      <div className="relative h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart style={{ background: 'transparent' }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              stroke="#0f0f0f"
              strokeWidth={2}
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={SEGMENT_COLORS[entry.name]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-portfolio-gray">Safe to Spend</p>
          <p className="text-amount text-lg font-bold text-white">
            {formatCurrency(safeBalance)}
          </p>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-4">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: SEGMENT_COLORS[entry.name] }}
            />
            <span className="text-portfolio-gray">{entry.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
