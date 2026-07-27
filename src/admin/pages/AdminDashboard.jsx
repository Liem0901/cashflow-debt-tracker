import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { fetchAdminDashboard } from '../../services/adminApi';
import { formatCurrency } from '../../utils/formatters';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';

export default function AdminDashboard() {
  const { getIdToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetchAdminDashboard(getIdToken)
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [getIdToken]);

  if (loading) {
    return <p className="text-portfolio-gray">Loading dashboard…</p>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-900/50 bg-rose-950/20 p-4 text-sm text-rose-300">
        {error}. Run <code className="text-white">npm run dev:full</code> for admin APIs.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-portfolio-gray">Platform overview and cashflow aggregates</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={stats.totalUsers} />
        <StatCard label="Active users (30d)" value={stats.activeUsers} accent="blue" />
        <StatCard label="Transactions" value={stats.totalTransactions.toLocaleString()} />
        <StatCard
          label="Net cashflow"
          value={formatCurrency(stats.netCashflow)}
          accent={stats.netCashflow >= 0 ? 'green' : 'red'}
        />
        <StatCard label="Total income" value={formatCurrency(stats.totalIncome)} accent="green" />
        <StatCard label="Total expenses" value={formatCurrency(stats.totalExpenses)} accent="red" />
        <StatCard label="Disabled users" value={stats.disabledUsers} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-portfolio-border bg-portfolio-card p-4">
          <h3 className="mb-4 text-sm font-semibold text-white">Monthly cashflow</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyCashflow}>
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

        <div className="rounded-2xl border border-portfolio-border bg-portfolio-card p-4">
          <h3 className="mb-4 text-sm font-semibold text-white">User growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 11 }} />
                <YAxis tick={{ fill: '#888', fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 12 }}
                />
                <Line type="monotone" dataKey="count" stroke="#38bdf8" strokeWidth={2} name="New users" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">Top expense categories</h3>
        <DataTable
          columns={[
            { key: 'category', label: 'Category' },
            {
              key: 'total',
              label: 'Total',
              render: (row) => formatCurrency(row.total),
            },
          ]}
          rows={stats.topCategories.map((row, index) => ({ ...row, id: index }))}
          emptyMessage="No category data yet"
        />
      </div>
    </div>
  );
}
