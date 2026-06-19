import Card from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';

export default function CashStatus({ salary, cashExpenses, upcomingDebt, safeBalance }) {
  const items = [
    { label: 'Cash Available', value: salary, color: 'text-metric-cash' },
    { label: 'Total Expenses', value: cashExpenses, color: 'text-metric-expense' },
    { label: 'Upcoming Debt', value: upcomingDebt, color: 'text-metric-debt' },
  ];

  return (
    <Card animate>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
        Cash Status
      </h2>
      <div className="space-y-3">
        {items.map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-sm text-portfolio-gray">{label}</span>
            <span className={`text-amount font-semibold ${color}`}>{formatCurrency(value)}</span>
          </div>
        ))}
        <div className="border-t border-portfolio-border pt-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">Safe to Spend</span>
            <span className="text-amount text-xl font-bold text-white">
              {formatCurrency(safeBalance)}
            </span>
          </div>
          <p className="mt-1 text-xs text-portfolio-muted">
            Salary − Cash Expenses − Upcoming Debt
          </p>
        </div>
      </div>
    </Card>
  );
}
