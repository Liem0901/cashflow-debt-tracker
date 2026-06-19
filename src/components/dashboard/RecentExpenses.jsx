import Card from '../ui/Card';
import TransactionList from '../transactions/TransactionList';

export default function RecentExpenses({ transactions }) {
  return (
    <Card animate>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
        Recent Expenses
      </h2>
      <TransactionList transactions={transactions} editable />
    </Card>
  );
}
