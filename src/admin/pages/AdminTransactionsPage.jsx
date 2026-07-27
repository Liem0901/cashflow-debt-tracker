import { useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { fetchAdminTransactions } from '../../services/adminApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import DataTable from '../components/DataTable';

const TYPE_OPTIONS = ['', 'income', 'cash', 'debt'];

export default function AdminTransactionsPage() {
  const { getIdToken } = useAuth();
  const [filters, setFilters] = useState({
    userId: '',
    type: '',
    category: '',
    dateFrom: '',
    dateTo: '',
  });
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminTransactions({ ...filters, page, limit: 50 }, getIdToken);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, page, getIdToken]);

  useEffect(() => {
    load();
  }, [load]);

  const trendMap = {};
  for (const tx of result.items) {
    const month = tx.date?.slice(0, 7) || 'unknown';
    if (!trendMap[month]) trendMap[month] = { month, total: 0 };
    if (tx.type === 'cash' || tx.type === 'debt') {
      trendMap[month].total += Number(tx.amount || 0);
    }
  }
  const trendData = Object.values(trendMap).sort((a, b) => a.month.localeCompare(b.month));

  const totalPages = Math.max(1, Math.ceil(result.total / 50));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Transactions</h2>
        <p className="text-sm text-portfolio-gray">Cross-user activity with filters</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          placeholder="User ID"
          value={filters.userId}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, userId: e.target.value }));
          }}
        />
        <select
          value={filters.type}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, type: e.target.value }));
          }}
          className="rounded-xl border border-portfolio-border bg-portfolio-elevated px-3 py-2 text-sm text-white"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt || 'all'} value={opt}>
              {opt || 'All types'}
            </option>
          ))}
        </select>
        <Input
          placeholder="Category"
          value={filters.category}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, category: e.target.value }));
          }}
        />
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, dateFrom: e.target.value }));
          }}
        />
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, dateTo: e.target.value }));
          }}
        />
      </div>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      {trendData.length > 0 ? (
        <div className="rounded-2xl border border-portfolio-border bg-portfolio-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Spending trend (current page)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 11 }} />
                <YAxis tick={{ fill: '#888', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 12 }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Bar dataKey="total" fill="#fb7185" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      {loading ? <p className="text-portfolio-gray">Loading…</p> : null}

      <DataTable
        columns={[
          { key: 'date', label: 'Date', render: (row) => formatDate(row.date) },
          {
            key: 'userId',
            label: 'User',
            render: (row) => `${row.userId.slice(0, 10)}…`,
          },
          { key: 'type', label: 'Type' },
          { key: 'category', label: 'Category' },
          {
            key: 'amount',
            label: 'Amount',
            render: (row) => formatCurrency(row.amount),
          },
          { key: 'note', label: 'Note' },
        ]}
        rows={result.items.map((row, index) => ({ ...row, id: `${row.userId}-${row.id || index}` }))}
        emptyMessage="No transactions match filters"
      />

      <div className="flex items-center justify-between text-sm text-portfolio-gray">
        <span>
          Page {page} of {totalPages} · {result.total} results
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
