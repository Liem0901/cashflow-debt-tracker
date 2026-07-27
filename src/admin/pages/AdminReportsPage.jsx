import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { fetchAdminReports } from '../../services/adminApi';
import { formatCurrency } from '../../utils/formatters';
import DataTable from '../components/DataTable';
import StatCard from '../components/StatCard';

export default function AdminReportsPage() {
  const { getIdToken } = useAuth();
  const [reports, setReports] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminReports(getIdToken)
      .then(setReports)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [getIdToken]);

  if (loading) return <p className="text-portfolio-gray">Loading reports…</p>;
  if (error) return <p className="text-rose-400">{error}</p>;
  if (!reports) return null;

  const chartData = reports.monthlyExpenses.map((row, index) => ({
    month: row.month,
    expenses: row.total,
    income: reports.monthlyIncome[index]?.total || 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reports</h2>
        <p className="text-sm text-portfolio-gray">Analytics across all active users</p>
      </div>

      <StatCard
        label="Average spending per user"
        value={formatCurrency(reports.averageSpendingPerUser)}
        accent="blue"
      />

      <div className="rounded-2xl border border-portfolio-border bg-portfolio-card p-4">
        <h3 className="mb-4 text-sm font-semibold">Monthly income vs expenses</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 11 }} />
              <YAxis tick={{ fill: '#888', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 12 }}
                formatter={(value) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="income" fill="#34d399" name="Income" />
              <Bar dataKey="expenses" fill="#fb7185" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-semibold">Most common expense categories</h3>
          <DataTable
            columns={[
              { key: 'category', label: 'Category' },
              {
                key: 'total',
                label: 'Total',
                render: (row) => formatCurrency(row.total),
              },
            ]}
            rows={reports.topCategories.map((row, index) => ({ ...row, id: index }))}
          />
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Highest spending users</h3>
          <DataTable
            columns={[
              {
                key: 'userId',
                label: 'User',
                render: (row) => `${row.userId.slice(0, 14)}…`,
              },
              {
                key: 'totalExpenses',
                label: 'Expenses',
                render: (row) => formatCurrency(row.totalExpenses),
              },
            ]}
            rows={reports.highestSpendingUsers.map((row) => ({ ...row, id: row.userId }))}
          />
        </div>
      </div>
    </div>
  );
}
