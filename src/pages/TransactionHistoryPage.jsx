import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/ui/Card';
import TransactionList from '../components/transactions/TransactionList';
import { formatCurrency } from '../utils/formatters';

export default function TransactionHistoryPage() {
  const { data } = useApp();

  const transactions = useMemo(
    () =>
      [...data.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [data.transactions]
  );

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

      <Card animate>
        <TransactionList
          transactions={transactions}
          debts={data.debts}
          editable
          emptyMessage="No transactions yet. Tap + to add one."
        />
      </Card>
    </div>
  );
}
