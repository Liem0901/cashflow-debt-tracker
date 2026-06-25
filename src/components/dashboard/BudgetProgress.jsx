import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import CategoryIcon from '../transactions/CategoryIcon';
import { CATEGORIES, getBudgetCategories } from '../../data/initialData';
import { formatCurrency } from '../../utils/formatters';

function BudgetRow({ cat, spent, limit, pct, over }) {
  return (
    <div
      className={`rounded-xl border p-3 ${over
          ? 'border-metric-debt/40 bg-portfolio-elevated'
          : 'border-portfolio-border bg-portfolio-elevated'
        }`}
    >
      <div className="flex items-center gap-2">
        {CATEGORIES.includes(cat) && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-portfolio-muted">
            <CategoryIcon category={cat} className="text-base" />
          </span>
        )}
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-portfolio-gray">{cat}</p>
        <p
          className={`shrink-0 text-sm font-semibold ${over ? 'text-metric-debt' : 'text-white'
            }`}
        >
          {formatCurrency(spent)} / {formatCurrency(limit)}
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-portfolio-muted">
        <div
          className={`h-full rounded-full transition-all ${over ? 'bg-metric-debt' : 'bg-metric-cash'
            }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function BudgetProgress({ budgets, categorySpending }) {
  const items = getBudgetCategories(budgets)
    .map((cat) => {
      const spent = categorySpending[cat] || 0;
      const numLimit = Number(budgets[cat]) || 0;
      const pct = numLimit > 0 ? Math.min(100, (spent / numLimit) * 100) : 0;
      const over = spent > numLimit && numLimit > 0;
      return { cat, spent, limit: numLimit, pct, over };
    })
    .filter((item) => item.limit > 0)
    .sort((a, b) => {
      if (a.over !== b.over) return a.over ? -1 : 1;
      return b.pct - a.pct;
    });

  const overCount = items.filter((item) => item.over).length;

  if (items.length === 0) {
    return (
      <Card animate>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
          Monthly Budgets
        </h2>
        <p className="py-4 text-center text-sm text-portfolio-gray">
          No budgets set.{' '}
          <Link to="/profile" className="text-white underline underline-offset-2">
            Set in Profile
          </Link>
        </p>
      </Card>
    );
  }

  return (
    <Card animate>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
            Monthly Budgets
          </h2>
          <p className="mt-0.5 text-xs text-portfolio-gray">Cash spending by category</p>
        </div>
        {overCount > 0 && (
          <span className="shrink-0 rounded-full border border-metric-debt/50 px-2 py-0.5 text-[10px] font-semibold uppercase text-metric-debt">
            {overCount} over
          </span>
        )}
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <BudgetRow key={item.cat} {...item} />
        ))}
      </div>
    </Card>
  );
}
