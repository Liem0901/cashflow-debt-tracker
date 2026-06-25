import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import SalaryCard from '../components/dashboard/SalaryCard';
import CashStatus from '../components/dashboard/CashStatus';
import DonutChart from '../components/dashboard/DonutChart';
import UpcomingDebts from '../components/dashboard/UpcomingDebts';
import RecentExpenses from '../components/dashboard/RecentExpenses';
import Warnings from '../components/dashboard/Warnings';
import CanIBuySimulator from '../components/dashboard/CanIBuySimulator';
import BudgetProgress from '../components/dashboard/BudgetProgress';
import { getDashboardStats } from '../utils/calculations';

export default function Dashboard() {
  const { data, monthKey } = useApp();
  const [viewMonth, setViewMonth] = useState(monthKey);

  useEffect(() => {
    setViewMonth(monthKey);
  }, [monthKey]);

  const stats = useMemo(
    () => getDashboardStats(data, viewMonth),
    [data, viewMonth]
  );

  return (
    <div className="page-padding space-y-4 animate-fade-in">
      <Warnings warnings={stats.warnings} />

      <SalaryCard
        salary={stats.salary}
        viewMonth={viewMonth}
        currentMonth={monthKey}
        onViewMonthChange={setViewMonth}
      />

      <CashStatus
        cashAvailable={stats.cashAvailable}
        totalExpenses={stats.totalExpenses}
        upcomingDebt={stats.upcomingDebt}
        safeBalance={stats.safeBalance}
      />

      <DonutChart
        totalExpenses={stats.totalExpenses}
        upcomingDebt={stats.upcomingDebt}
        safeBalance={stats.safeBalance}
      />

      <BudgetProgress budgets={data.budgets} categorySpending={stats.categorySpending} />

      <CanIBuySimulator safeBalance={stats.safeBalance} />

      <UpcomingDebts debts={stats.debtsDueThisMonth} />

      <RecentExpenses transactions={stats.recentTransactions} debts={data.debts} />
    </div>
  );
}
