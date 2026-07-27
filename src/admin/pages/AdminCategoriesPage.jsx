import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchAdminCategories, saveAdminCategories } from '../../services/adminApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

function CategoryEditor({ title, items, onChange }) {
  const [draft, setDraft] = useState('');

  const addItem = () => {
    const value = draft.trim();
    if (!value || items.includes(value)) return;
    onChange([...items, value]);
    setDraft('');
  };

  const removeItem = (item) => {
    onChange(items.filter((entry) => entry !== item));
  };

  return (
    <div className="rounded-2xl border border-portfolio-border bg-portfolio-card p-4">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <div className="mt-3 flex gap-2">
        <Input
          placeholder="Add category…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
        />
        <Button variant="secondary" onClick={addItem}>
          Add
        </Button>
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-center justify-between rounded-xl bg-portfolio-elevated px-3 py-2 text-sm"
          >
            <span>{item}</span>
            <button
              type="button"
              onClick={() => removeItem(item)}
              className="text-xs text-rose-400 hover:text-rose-300"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminCategoriesPage() {
  const { getIdToken } = useAuth();
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminCategories(getIdToken)
      .then((data) => {
        setExpenseCategories(data.expenseCategories || []);
        setIncomeCategories(data.incomeCategories || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [getIdToken]);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const data = await saveAdminCategories({ expenseCategories, incomeCategories }, getIdToken);
      setExpenseCategories(data.expenseCategories);
      setIncomeCategories(data.incomeCategories);
      setMessage('Categories saved. New users can reference these defaults.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-portfolio-gray">Loading categories…</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Categories</h2>
          <p className="text-sm text-portfolio-gray">
            Default expense and income categories for the platform
          </p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>

      {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryEditor
          title="Expense categories"
          items={expenseCategories}
          onChange={setExpenseCategories}
        />
        <CategoryEditor
          title="Income categories"
          items={incomeCategories}
          onChange={setIncomeCategories}
        />
      </div>
    </div>
  );
}
