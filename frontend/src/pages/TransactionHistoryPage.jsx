import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TransactionList from '../components/transactions/TransactionList';
import { getTransactionCalendarDate } from '../utils/calculations';
import { formatCurrency, getMonthName, isSameMonth, shiftMonthKey } from '../utils/formatters';
import { getTransactionPaidStatus } from '../utils/transactionStatus';

const STATUS_TABS = [
  { id: 'paid', label: 'Paid' },
  { id: 'unpaid', label: 'Unpaid' },
];

export default function TransactionHistoryPage() {
  const { data, monthKey } = useApp();
  const [showFilter, setShowFilter] = useState(false);
  const [filterMonth, setFilterMonth] = useState(monthKey);
  const [viewAll, setViewAll] = useState(false);
  const [statusTab, setStatusTab] = useState('paid');

  useEffect(() => {
    setFilterMonth(monthKey);
  }, [monthKey]);

  const transactions = useMemo(() => {
    let list = [...data.transactions];

    if (!viewAll) {
      list = list.filter((t) =>
        isSameMonth(getTransactionCalendarDate(t, data.debts), filterMonth)
      );
    }

    list = list.filter(
      (t) => getTransactionPaidStatus(t, data.debts) === statusTab
    );

    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [data.transactions, data.debts, filterMonth, viewAll, statusTab]);

  const total = useMemo(
    () => transactions.reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions]
  );

  const showAll = () => {
    setViewAll(true);
    setShowFilter(false);
  };

  const selectMonth = (month) => {
    setFilterMonth(month);
    setViewAll(false);
  };

  const emptyMessage =
    statusTab === 'paid'
      ? viewAll
        ? 'No paid transactions yet.'
        : `No paid transactions in ${getMonthName(filterMonth)}.`
      : viewAll
        ? 'No unpaid transactions yet.'
        : `No unpaid transactions in ${getMonthName(filterMonth)}.`;

  return (
    <div className="page-padding space-y-4 animate-fade-in">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Transaction History</h1>
          <p className="text-sm text-portfolio-gray">
            {!viewAll && <span>{getMonthName(filterMonth)} · </span>}
            {transactions.length} shown · {formatCurrency(total)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowFilter((open) => !open)}
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border border-portfolio-border bg-portfolio-elevated text-white transition-colors hover:border-white hover:bg-portfolio-muted"
          aria-label={!viewAll ? 'Month filter active' : 'Filter transactions'}
          aria-pressed={showFilter}
        >
          <i className="bi bi-funnel text-lg" aria-hidden="true" />
        </button>
      </header>

      <div className="flex rounded-xl bg-portfolio-elevated p-1">
        {STATUS_TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setStatusTab(id)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${statusTab === id
                ? 'bg-white text-black shadow-sm'
                : 'text-portfolio-gray'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {showFilter && (
        <Card animate>
          <div className="space-y-3">
            <p className="text-xs text-portfolio-gray">Show transactions for</p>
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => selectMonth(shiftMonthKey(filterMonth, -1))}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-portfolio-border bg-portfolio-elevated text-portfolio-gray hover:border-white hover:text-white"
                aria-label="Previous month"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <p className="min-w-0 truncate text-center text-sm font-semibold text-white">
                {getMonthName(filterMonth)}
              </p>
              <button
                type="button"
                onClick={() => selectMonth(shiftMonthKey(filterMonth, 1))}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-portfolio-border bg-portfolio-elevated text-portfolio-gray hover:border-white hover:text-white"
                aria-label="Next month"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => selectMonth(monthKey)}
              >
                This month
              </Button>
              <Button variant="ghost" size="sm" className="flex-1" onClick={showAll}>
                Show all
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card animate>
        <TransactionList
          transactions={transactions}
          debts={data.debts}
          editable
          emptyMessage={emptyMessage}
        />
      </Card>
    </div>
  );
}
