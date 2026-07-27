import { useSearchParams, Link } from 'react-router-dom';
import { DebtManagement } from '../components/profile/ProfileSections';
import UpcomingDebts from '../components/dashboard/UpcomingDebts';
import { useApp } from '../context/AppContext';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

export default function DebtsPage() {
  const { data, stats, openAddTransaction } = useApp();
  const [searchParams] = useSearchParams();
  const payMode = searchParams.get('action') === 'pay';

  const activeDebts = data.debts.filter((d) => d.status !== 'paid');
  const debtFree = activeDebts.length === 0;

  return (
    <div className="page-padding animate-fade-in space-y-4">
      <header>
        <h1 className="text-xl font-bold text-white">Debts</h1>
        <p className="text-sm text-portfolio-gray">
          {payMode ? 'Select a debt below to record a payment' : 'Track obligations & payments'}
        </p>
      </header>

      {payMode ? (
        <div className="rounded-2xl border border-metric-cash/30 bg-metric-cash/5 px-4 py-3 text-sm text-portfolio-light">
          Tap <strong className="text-white">Pay</strong> on any active debt to record a payment.
        </div>
      ) : null}

      {debtFree ? (
        <EmptyState
          icon="🎉"
          title="You're debt free"
          description="No active debts. Add one if you need to track pay-later or loan obligations."
          action={
            <Button onClick={() => openAddTransaction({ mode: 'debt' })}>Add debt</Button>
          }
        />
      ) : (
        <UpcomingDebts debts={stats.debtsDueThisMonth} />
      )}

      <DebtManagement />

      <div className="text-center">
        <Link to="/history">
          <Button variant="ghost" size="sm">
            All transactions →
          </Button>
        </Link>
      </div>
    </div>
  );
}
