import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import TransactionList from '../transactions/TransactionList';
import Button from '../ui/Button';

export default function RecentExpenses({ transactions, debts = [] }) {
  return (
    <Card animate>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
          Recent Activity
        </h2>
        <Link to="/history">
          <Button variant="ghost" size="sm" className="!px-2 !py-1 text-xs">
            View all →
          </Button>
        </Link>
      </div>
      <TransactionList transactions={transactions} debts={debts} editable />
    </Card>
  );
}
