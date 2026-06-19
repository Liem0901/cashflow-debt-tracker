import { useApp } from '../context/AppContext';
import SalaryCard from '../components/dashboard/SalaryCard';
import CashStatus from '../components/dashboard/CashStatus';
import DonutChart from '../components/dashboard/DonutChart';
import UpcomingDebts from '../components/dashboard/UpcomingDebts';
import RecentExpenses from '../components/dashboard/RecentExpenses';
import Warnings from '../components/dashboard/Warnings';
import CanIBuySimulator from '../components/dashboard/CanIBuySimulator';

export default function Dashboard() {
  const { data, monthKey, stats } = useApp();

  return (
    <div className="page-padding space-y-4 animate-fade-in">
      <Warnings warnings={stats.warnings} />

      <SalaryCard salary={data.salary} monthKey={monthKey} />

      <CashStatus
        salary={data.salary}
        cashExpenses={stats.cashExpenses}
        upcomingDebt={stats.upcomingDebt}
        safeBalance={stats.safeBalance}
      />

      <DonutChart
        cashExpenses={stats.cashExpenses}
        upcomingDebt={stats.upcomingDebt}
        safeBalance={stats.safeBalance}
      />

      <CanIBuySimulator safeBalance={stats.safeBalance} />

      <UpcomingDebts debts={stats.debtsDueThisMonth} />

      <RecentExpenses transactions={stats.recentTransactions} />
    </div>
  );
}
