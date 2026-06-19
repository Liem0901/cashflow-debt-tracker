import Card from '../ui/Card';
import CategoryIcon from '../transactions/CategoryIcon';
import { formatCurrency, formatDayLabel } from '../../utils/formatters';

export default function DayDetail({ dateStr, transactions }) {
  if (!dateStr) {
    return (
      <Card animate>
        <p className="py-6 text-center text-sm text-portfolio-gray">
          Select a day to view expenses
        </p>
      </Card>
    );
  }

  const cashTotal = transactions
    .filter((t) => t.type === 'cash')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const debtTotal = transactions
    .filter((t) => t.type === 'debt')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <Card animate>
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 className="font-semibold text-white">{formatDayLabel(dateStr)}</h2>
          <p className="text-xs text-portfolio-gray">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-white">{formatCurrency(cashTotal)}</p>
          <p className="text-[10px] uppercase text-portfolio-gray">Cash spent</p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <p className="rounded-xl bg-portfolio-elevated py-6 text-center text-sm text-portfolio-gray">
          No expenses on this day
        </p>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-xl bg-portfolio-elevated px-3 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-portfolio-muted text-base">
                  <CategoryIcon category={tx.category} className="text-base" />
                </span>
                <div>
                  <p className="text-sm font-medium text-white">
                    {tx.description || tx.category}
                  </p>
                  <p className="text-xs text-portfolio-gray">{tx.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">{formatCurrency(tx.amount)}</p>
                <span className="inline-block rounded-full border border-portfolio-border px-1.5 py-0.5 text-[9px] font-medium uppercase text-portfolio-gray">
                  {tx.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {debtTotal > 0 && (
        <p className="mt-3 text-xs text-portfolio-light">
          + {formatCurrency(debtTotal)} in pay-later / debt recorded this day
        </p>
      )}
    </Card>
  );
}
