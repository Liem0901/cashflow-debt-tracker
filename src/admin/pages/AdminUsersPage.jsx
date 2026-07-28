import { useCallback, useEffect, useState } from 'react';
import { fetchAdminUsers, updateAdminUser, deleteAdminUser } from '../../services/adminApi';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import AdminUsersTable from '../components/AdminUsersTable';

export default function AdminUsersPage() {
  const { getIdToken } = useAuth();
  const [search, setSearch] = useState('');
  const [disabledFilter, setDisabledFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ users: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUsers(
        { search, page, limit: 20, disabled: disabledFilter === 'all' ? undefined : disabledFilter },
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

  const removeUser = async (userId, name) => {
    if (!window.confirm(`Delete all data for ${name}? This cannot be undone.`)) return;
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
          placeholder="Search by name, email, or ID…"
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
          className="flex-1"
        />
        <Select
          instanceId="admin-users-filter"
          className="sm:w-48"
          value={disabledFilter}
          onChange={(value) => {
            setPage(1);
            setDisabledFilter(value);
          }}
          options={[
            { value: 'all', label: 'All users' },
            { value: 'false', label: 'Active only' },
            { value: 'true', label: 'Disabled only' },
          ]}
          isSearchable={false}
        />
      </div>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      {loading ? <p className="text-portfolio-gray">Loading…</p> : null}

      {!loading ? (
        <AdminUsersTable
          users={result.users}
          onToggleDisabled={toggleDisabled}
          onDelete={removeUser}
        />
      ) : null}

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
