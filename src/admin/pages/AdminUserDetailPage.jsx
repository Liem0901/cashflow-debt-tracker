import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchAdminUser, updateAdminUser, deleteAdminUser } from '../../services/adminApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import DataTable from '../components/DataTable';
import StatCard from '../components/StatCard';

export default function AdminUserDetailPage() {
  const { userId } = useParams();
  const { getIdToken } = useAuth();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUser(userId, getIdToken);
      setUser(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId, getIdToken]);

  const toggleDisabled = async () => {
    await updateAdminUser(userId, { disabled: !user.disabled }, getIdToken);
    load();
  };

  const removeUser = async () => {
    if (!window.confirm(`Delete all data for ${userId}?`)) return;
    await deleteAdminUser(userId, getIdToken);
    window.location.href = '/admin';
  };

  if (loading) return <p className="text-portfolio-gray">Loading user…</p>;
  if (error) return <p className="text-rose-400">{error}</p>;
  if (!user) return <p className="text-portfolio-gray">User not found</p>;

  const recentTx = (user.data?.transactions || []).slice(-10).reverse();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/admin" className="text-sm text-sky-400 hover:underline">
            ← Back to users
          </Link>
          <h2 className="mt-2 text-xl font-bold">{user.name || userId}</h2>
          {user.email ? <p className="text-sm text-portfolio-gray">{user.email}</p> : null}
          <p className="mt-1 break-all text-xs text-portfolio-gray">{userId}</p>
          <p className="text-sm text-portfolio-gray">
            {user.disabled ? 'Disabled' : 'Active'} · Updated {user.updatedAt ? formatDate(String(user.updatedAt).slice(0, 10)) : '—'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={toggleDisabled}>
            {user.disabled ? 'Enable user' : 'Disable user'}
          </Button>
          <Button variant="danger" onClick={removeUser}>
            Delete user
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Transactions" value={user.transactionCount} />
        <StatCard label="Debts" value={user.debtCount} />
        <StatCard label="Total income" value={formatCurrency(user.totalIncome)} accent="green" />
        <StatCard label="Total expenses" value={formatCurrency(user.totalExpenses)} accent="red" />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Recent transactions</h3>
        <DataTable
          columns={[
            { key: 'date', label: 'Date', render: (row) => formatDate(row.date) },
            { key: 'type', label: 'Type' },
            { key: 'category', label: 'Category' },
            {
              key: 'amount',
              label: 'Amount',
              render: (row) => formatCurrency(row.amount),
            },
            { key: 'note', label: 'Note' },
          ]}
          rows={recentTx.map((row, index) => ({ ...row, id: row.id || index }))}
          emptyMessage="No transactions"
        />
      </div>
    </div>
  );
}
