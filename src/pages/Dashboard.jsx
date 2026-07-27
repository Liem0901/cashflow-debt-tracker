import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import SalaryCard from '../components/dashboard/SalaryCard';
import DonutChart from '../components/dashboard/DonutChart';
import ExpenseTrendChart from '../components/dashboard/ExpenseTrendChart';
import CategorySpendingChart from '../components/dashboard/CategorySpendingChart';
import QuickInsights, { DashboardQuickLinks } from '../components/dashboard/DashboardExtras';
import RecentExpenses from '../components/dashboard/RecentExpenses';
import Warnings from '../components/dashboard/Warnings';
import { getDashboardStats, getDailyExpenses } from '../utils/calculations';

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

  const dailyExpenses = useMemo(
    () => getDailyExpenses(data.transactions, viewMonth, 'cash', data.debts),
    [data.transactions, data.debts, viewMonth]
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

      <DonutChart
        totalExpenses={stats.totalExpenses}
        upcomingDebt={stats.upcomingDebt}
        safeBalance={stats.safeBalance}
      />

      <QuickInsights stats={stats} viewMonth={viewMonth} currentMonth={monthKey} />

      <ExpenseTrendChart dailyExpenses={dailyExpenses} monthKey={viewMonth} />

      <CategorySpendingChart
        categorySpending={stats.categorySpending}
        budgets={data.budgets}
      />

      <RecentExpenses transactions={stats.recentTransactions} debts={data.debts} />

      <DashboardQuickLinks />
    </div>
  );
}
