import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/ui/Card';
import TransactionList from '../components/transactions/TransactionList';
import { formatCurrency } from '../utils/formatters';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'cash', label: 'Cash' },
  { id: 'debt', label: 'Debt' },
];

export default function TransactionHistoryPage() {
  const { data } = useApp();
  const [filter, setFilter] = useState('all');

  const transactions = useMemo(() => {
    const sorted = [...data.transactions].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    if (filter === 'all') return sorted;
    return sorted.filter((t) => t.type === filter);
  }, [data.transactions, filter]);

  const total = useMemo(
    () => transactions.reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions]
  );

  return (
    <div className="page-padding space-y-4 animate-fade-in">
      <header>
        <h1 className="text-xl font-bold text-white">Transaction History</h1>
        <p className="text-sm text-portfolio-gray">
          {data.transactions.length} total · {formatCurrency(total)} shown
        </p>
      </header>

      <div className="flex rounded-xl bg-portfolio-elevated p-1">
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              filter === id ? 'bg-white text-black' : 'text-portfolio-gray'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Card animate>
        <TransactionList
          transactions={transactions}
          editable
          emptyMessage={
            filter === 'all'
              ? 'No transactions yet. Tap + to add one.'
              : `No ${filter} transactions yet.`
          }
        />
      </Card>
    </div>
  );
}
