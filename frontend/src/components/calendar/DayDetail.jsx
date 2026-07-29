import Card from '../ui/Card';
import TransactionList from '../transactions/TransactionList';
import { formatCurrency, formatDayLabel } from '../../utils/formatters';

export default function DayDetail({ dateStr, transactions, debts = [] }) {
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
  const incomeTotal = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const dayTotal = cashTotal + debtTotal;

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
          <p className="text-lg font-bold text-white">{formatCurrency(dayTotal)}</p>
          <p className="text-[10px] uppercase text-portfolio-gray">
            {incomeTotal > 0
              ? debtTotal > 0
                ? 'Spent + income'
                : 'Spent'
              : debtTotal > 0
                ? 'Cash + debt'
                : 'Total spent'}
          </p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <p className="rounded-xl bg-portfolio-elevated py-6 text-center text-sm text-portfolio-gray">
          No expenses on this day
        </p>
      ) : (
        <TransactionList
          transactions={transactions}
          debts={debts}
          editable
          emptyMessage="No expenses on this day"
        />
      )}

      {debtTotal > 0 && (
        <p className="mt-3 text-xs text-portfolio-light">
          + {formatCurrency(debtTotal)} in pay-later / debt recorded this day
        </p>
      )}

      {incomeTotal > 0 && (
        <p className="mt-3 text-xs text-metric-cash">
          + {formatCurrency(incomeTotal)} income received this day
        </p>
      )}
    </Card>
  );
}
