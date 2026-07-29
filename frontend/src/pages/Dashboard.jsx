import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import SalaryCard from '../components/dashboard/SalaryCard';
import DonutChart from '../components/dashboard/DonutChart';
import ExpenseTrendChart from '../components/dashboard/ExpenseTrendChart';
import CategorySpendingChart from '../components/dashboard/CategorySpendingChart';
import QuickInsights, { DashboardQuickLinks, SavingsTeaser } from '../components/dashboard/DashboardExtras';
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
    () => getDailyExpenses(data.transactions, viewMonth, 'all', data.debts, true),
    [data.transactions, data.debts, viewMonth]
  );

  return (
    <div className="page-padding space-y-4 animate-fade-in lg:grid lg:grid-cols-2 lg:items-start lg:gap-4 lg:space-y-0">
      {stats.warnings.length > 0 ? (
        <div className="lg:col-span-2">
          <Warnings warnings={stats.warnings} />
        </div>
      ) : null}

      <div className="space-y-4 lg:col-span-2 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-4 lg:space-y-0">
        <div className="space-y-4 lg:flex lg:flex-col lg:justify-between">
          <SalaryCard
            salary={stats.salary}
            viewMonth={viewMonth}
            currentMonth={monthKey}
            onViewMonthChange={setViewMonth}
          />
          <QuickInsights stats={stats} viewMonth={viewMonth} currentMonth={monthKey} />
          <SavingsTeaser balance={data.savingsBalance} goal={data.savingsGoal} />
          <DashboardQuickLinks />
        </div>

        <DonutChart
          totalExpenses={stats.totalExpenses}
          upcomingDebt={stats.upcomingDebt}
          safeBalance={stats.safeBalance}
        />
      </div>

      <div className="lg:col-span-2">
        <ExpenseTrendChart dailyExpenses={dailyExpenses} monthKey={viewMonth} />
      </div>

      <CategorySpendingChart
        categorySpending={stats.categorySpending}
        budgets={data.budgets}
      />

      <RecentExpenses transactions={stats.recentTransactions} debts={data.debts} />
    </div>
  );
}
