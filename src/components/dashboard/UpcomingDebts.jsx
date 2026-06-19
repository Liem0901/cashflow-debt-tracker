import Card from '../ui/Card';
import { formatCurrency, formatDate, daysUntil } from '../../utils/formatters';

export default function UpcomingDebts({ debts }) {
  if (debts.length === 0) {
    return (
      <Card animate>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
          Upcoming Debt
        </h2>
        <p className="py-4 text-center text-sm text-portfolio-gray">No debts due this month</p>
      </Card>
    );
  }

  return (
    <Card animate>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
        Upcoming Debt
      </h2>
      <div className="space-y-3">
        {debts.map((debt) => {
          const paid = debt.amount - debt.remaining;
          const progress = debt.amount > 0 ? (paid / debt.amount) * 100 : 0;
          const days = daysUntil(debt.dueDate);
          const urgent = days >= 0 && days <= 7;

          return (
            <div
              key={debt.id}
              className={`rounded-xl border p-3 ${
                urgent
                  ? 'border-white bg-portfolio-elevated'
                  : 'border-portfolio-border bg-portfolio-elevated'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-white">{debt.name}</p>
                  <p className="text-xs text-portfolio-gray">
                    Due {formatDate(debt.dueDate)}
                    {days >= 0 && (
                      <span className={urgent ? ' ml-1 font-medium text-white' : ' ml-1'}>
                        ({days === 0 ? 'today' : `${days}d left`})
                      </span>
                    )}
                  </p>
                </div>
                <p className="font-semibold text-white">{formatCurrency(debt.remaining)}</p>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-portfolio-gray">
                  <span>Paid {formatCurrency(paid)}</span>
                  <span>of {formatCurrency(debt.amount)}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-portfolio-muted">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
