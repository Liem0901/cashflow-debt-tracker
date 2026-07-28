import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import ShinyCoin from '../savings/ShinyCoin';
import { AI_BRAND_SHORT } from '../../constants/aiBrand';
import { formatCurrency } from '../../utils/formatters';
import { getSavingsProgress } from '../../utils/savings';

export default function QuickInsights({ stats, viewMonth, currentMonth }) {
  const isCurrentMonth = viewMonth === currentMonth;
  const savingsRate =
    stats.cashAvailable > 0
      ? Math.round((stats.safeBalance / stats.cashAvailable) * 100)
      : 0;

  const insights = [
    {
      label: 'Safe to spend',
      value: formatCurrency(stats.safeBalance),
      tone: stats.safeBalance < 0 ? 'text-metric-debt' : 'text-metric-cash',
    },
    {
      label: 'Spent this month',
      value: formatCurrency(stats.totalExpenses),
      tone: 'text-metric-expense',
    },
    {
      label: isCurrentMonth ? 'Savings rate' : 'Remaining',
      value: isCurrentMonth ? `${Math.max(0, savingsRate)}%` : formatCurrency(stats.safeBalance),
      tone: 'text-white',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {insights.map((item) => (
        <Card key={item.label} className="!p-3" animate>
          <p className="text-[10px] font-medium uppercase tracking-wide text-portfolio-gray">
            {item.label}
          </p>
          <p className={`text-amount mt-1 text-base font-bold leading-tight ${item.tone}`}>
            {item.value}
          </p>
        </Card>
      ))}
    </div>
  );
}

export function SavingsTeaser({ balance = 0, goal = 5000 }) {
  const progress = getSavingsProgress(balance, goal);

  return (
    <Link to="/savings" className="block">
      <Card className="!p-3 transition-colors hover:border-white/20" animate>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-portfolio-gray">
              Total saved
            </p>
            <p className="text-amount mt-0.5 text-lg font-bold text-white">
              {formatCurrency(balance)}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <ShinyCoin size="sm" />
            <span className="text-[10px] text-portfolio-gray">{progress}% of goal</span>
          </div>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-portfolio-elevated">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Card>
    </Link>
  );
}

export function DashboardQuickLinks() {
  const links = [
    { to: '/calendar', label: 'Calendar', icon: 'bi-calendar3' },
    { to: '/history', label: 'History', icon: 'bi-clock-history' },
    { to: '/savings', label: 'Savings', coin: true },
    { to: '/debts', label: 'Debts', icon: 'bi-wallet2' },
    { to: '/ai', label: `Ask ${AI_BRAND_SHORT}`, icon: 'bi-stars' },
  ];

  return (
    <div className="grid grid-cols-5 gap-2">
      {links.map(({ to, label, icon, coin }) => (
        <Link
          key={to}
          to={to}
          className="flex flex-col items-center gap-1.5 rounded-2xl border border-portfolio-border bg-portfolio-card px-2 py-3 text-center transition-colors hover:border-white/20 hover:bg-portfolio-elevated"
        >
          {coin ? (
            <ShinyCoin size="sm" />
          ) : (
            <i className={`bi ${icon} text-lg text-portfolio-gray`} aria-hidden="true" />
          )}
          <span className="text-[10px] font-medium text-portfolio-light">{label}</span>
        </Link>
      ))}
    </div>
  );
}
