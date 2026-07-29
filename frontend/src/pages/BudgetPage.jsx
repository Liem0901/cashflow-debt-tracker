import { BudgetSettings } from '../components/profile/ProfileSections';
import { useApp } from '../context/AppContext';
import EmptyState from '../components/ui/EmptyState';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function BudgetPage() {
  const { data } = useApp();
  const hasBudgets = Object.keys(data.budgets || {}).length > 0;

  return (
    <div className="page-padding animate-fade-in">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-white">Budget</h1>
        <p className="text-sm text-portfolio-gray">Monthly spending limits by category</p>
      </header>

      {!hasBudgets ? (
        <EmptyState
          icon="📊"
          title="No budget yet"
          description="Create your first monthly budget to track spending against limits."
          action={
            <p className="text-xs text-portfolio-gray">Add categories below to get started.</p>
          }
        />
      ) : null}

      <BudgetSettings />

      <div className="mt-4 text-center">
        <Link to="/history">
          <Button variant="ghost" size="sm">
            View transaction history →
          </Button>
        </Link>
      </div>
    </div>
  );
}
