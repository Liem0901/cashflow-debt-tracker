import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchAdminUsers, updateAdminUser, deleteAdminUser } from '../../services/adminApi';
import { formatCurrency } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import DataTable from '../components/DataTable';

export default function AdminUsersPage() {
  const { getIdToken } = useAuth();
  const [search, setSearch] = useState('');
  const [disabledFilter, setDisabledFilter] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ users: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUsers(
        { search, page, limit: 20, disabled: disabledFilter || undefined },
        getIdToken
      );
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, page, disabledFilter, getIdToken]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const toggleDisabled = async (userId, disabled) => {
    await updateAdminUser(userId, { disabled: !disabled }, getIdToken);
    loadUsers();
  };

  const removeUser = async (userId) => {
    if (!window.confirm(`Delete all data for ${userId}? This cannot be undone.`)) return;
    await deleteAdminUser(userId, getIdToken);
    loadUsers();
  };

  const totalPages = Math.max(1, Math.ceil(result.total / 20));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Users</h2>
        <p className="text-sm text-portfolio-gray">Manage registered accounts and access</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search by user ID…"
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
          className="flex-1"
        />
        <select
          value={disabledFilter}
          onChange={(event) => {
            setPage(1);
            setDisabledFilter(event.target.value);
          }}
          className="rounded-xl border border-portfolio-border bg-portfolio-elevated px-3 py-2 text-sm text-white"
        >
          <option value="">All users</option>
          <option value="false">Active only</option>
          <option value="true">Disabled only</option>
        </select>
      </div>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      {loading ? <p className="text-portfolio-gray">Loading…</p> : null}

      <DataTable
        columns={[
          {
            key: 'userId',
            label: 'User',
            render: (row) => (
              <Link to={`/admin/users/${encodeURIComponent(row.userId)}`} className="text-sky-400 hover:underline">
                {row.userId.slice(0, 12)}…
              </Link>
            ),
          },
          { key: 'transactionCount', label: 'Txns' },
          {
            key: 'totalIncome',
            label: 'Income',
            render: (row) => formatCurrency(row.totalIncome),
          },
          {
            key: 'totalExpenses',
            label: 'Expenses',
            render: (row) => formatCurrency(row.totalExpenses),
          },
          {
            key: 'disabled',
            label: 'Status',
            render: (row) => (
              <span className={row.disabled ? 'text-rose-400' : 'text-emerald-400'}>
                {row.disabled ? 'Disabled' : 'Active'}
              </span>
            ),
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => toggleDisabled(row.userId, row.disabled)}>
                  {row.disabled ? 'Enable' : 'Disable'}
                </Button>
                <Button size="sm" variant="danger" onClick={() => removeUser(row.userId)}>
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
        rows={result.users.map((row) => ({ ...row, id: row.userId }))}
        emptyMessage="No users found"
      />

      <div className="flex items-center justify-between text-sm text-portfolio-gray">
        <span>
          Page {page} of {totalPages} · {result.total} users
        </span>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
