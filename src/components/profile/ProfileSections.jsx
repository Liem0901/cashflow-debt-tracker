import { useState, useEffect, useMemo } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input, { Select } from '../ui/Input';
import CategoryIcon from '../transactions/CategoryIcon';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, DEBT_PROVIDERS, getAvailableBudgetCategories, getBudgetCategories } from '../../data/initialData';
import { formatCurrency, formatDate, todayISO } from '../../utils/formatters';

function DebtItem({ debt, onPay, onMarkPaid }) {
  const [payAmount, setPayAmount] = useState('');
  const [showPay, setShowPay] = useState(false);
  const isPaid = debt.status === 'paid';

  return (
    <div className={`rounded-xl border p-3 ${isPaid ? 'border-portfolio-border bg-portfolio-elevated opacity-60' : 'border-portfolio-border bg-portfolio-elevated'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-white">{debt.name}</p>
          <p className="text-xs text-portfolio-gray">
            Due {formatDate(debt.dueDate)} · {debt.category}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-white">
            {formatCurrency(debt.remaining)}
          </p>
          <p className="text-xs text-portfolio-gray">of {formatCurrency(debt.amount)}</p>
        </div>
      </div>

      {!isPaid && (
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowPay(!showPay)}>
            Pay
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onMarkPaid(debt.id)}>
            Mark Paid
          </Button>
        </div>
      )}

      {showPay && !isPaid && (
        <div className="mt-2 flex gap-2">
          <input
            type="number"
            placeholder="Amount"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            className="flex-1 rounded-lg border border-portfolio-border bg-portfolio-black px-3 py-1.5 text-sm text-white"
          />
          <Button
            size="sm"
            onClick={() => {
              if (payAmount) {
                onPay(debt.id, payAmount);
                setPayAmount('');
                setShowPay(false);
              }
            }}
          >
            Confirm
          </Button>
        </div>
      )}

      {isPaid && (
        <span className="mt-2 inline-block rounded-full border border-portfolio-border px-2 py-0.5 text-xs font-medium text-portfolio-gray">
          Paid
        </span>
      )}
    </div>
  );
}

export function DebtManagement() {
  const { data, addDebtManually, payDebt, markDebtPaid } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState(DEBT_PROVIDERS[0]);
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(todayISO());
  const [category, setCategory] = useState('Other');

  const handleAdd = () => {
    if (!amount) return;
    addDebtManually({ name, amount, dueDate, category });
    setAmount('');
    setShowAdd(false);
  };

  const activeDebts = data.debts.filter((d) => d.status !== 'paid');
  const paidDebts = data.debts.filter((d) => d.status === 'paid');

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
          Debt Management
        </h2>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : '+ Add'}
        </Button>
      </div>

      {showAdd && (
        <div className="mb-4 space-y-3 rounded-xl border border-portfolio-border bg-portfolio-elevated p-3">
          <Select label="Provider" value={name} onChange={(e) => setName(e.target.value)}>
            {DEBT_PROVIDERS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
          <Input label="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
          <Button onClick={handleAdd} className="w-full">Add Debt</Button>
        </div>
      )}

      <div className="space-y-2">
        {activeDebts.length === 0 && paidDebts.length === 0 && (
          <p className="py-4 text-center text-sm text-portfolio-gray">No debts recorded</p>
        )}
        {activeDebts.map((debt) => (
          <DebtItem key={debt.id} debt={debt} onPay={payDebt} onMarkPaid={markDebtPaid} />
        ))}
        {paidDebts.length > 0 && (
          <p className="pt-2 text-xs font-medium text-portfolio-gray">Paid ({paidDebts.length})</p>
        )}
        {paidDebts.slice(0, 3).map((debt) => (
          <DebtItem key={debt.id} debt={debt} onPay={payDebt} onMarkPaid={markDebtPaid} />
        ))}
      </div>
    </Card>
  );
}

function BudgetCard({
  cat,
  spent,
  limit,
  pct,
  over,
  value,
  onChange,
  onRemove,
  onActivate,
  showIcon,
  canRemove,
  isActive,
}) {
  return (
    <div
      className="relative flex min-w-0 flex-col rounded-xl border border-portfolio-border bg-portfolio-elevated p-2.5"
      onClick={() => {
        if (!isActive) onActivate(cat);
      }}
    >
      <div className="mb-1.5 flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-medium leading-snug text-white">{cat}</p>
          <p className={`mt-0.5 text-xs ${over ? 'text-metric-debt' : 'text-portfolio-gray'}`}>
            {formatCurrency(spent)} / {formatCurrency(limit)}
          </p>
        </div>
        {showIcon && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-portfolio-muted">
            <CategoryIcon category={cat} className="text-xs" />
          </span>
        )}
      </div>
      <div className="mb-1.5 h-1 overflow-hidden rounded-full bg-portfolio-muted">
        <div
          className={`h-full rounded-full transition-all ${over ? 'bg-metric-debt' : 'bg-metric-cash'
            }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <input
        type="number"
        value={value}
        onClick={(e) => e.stopPropagation()}
        onFocus={() => onActivate(null)}
        onChange={(e) => onChange(cat, e.target.value)}
        className="mt-auto w-full rounded-lg border border-portfolio-border bg-portfolio-muted px-2 py-1.5 text-sm text-white focus:border-white focus:outline-none focus:ring-2 focus:ring-white/10"
        placeholder="Limit"
        min="0"
      />

      {canRemove && isActive && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/55 backdrop-blur-[1px] animate-fade-in"
          onClick={(e) => {
            e.stopPropagation();
            onActivate(null);
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(cat);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-metric-debt/50 bg-metric-debt/15 px-3 py-2 text-sm font-semibold text-metric-debt transition-colors hover:bg-metric-debt/25 hover:text-red-400"
          >
            <i className="bi bi-trash" aria-hidden="true" />
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

function normalizeBudgetValues(budgets) {
  return Object.fromEntries(
    Object.entries(budgets).map(([key, value]) => [
      key,
      value === '' || value == null ? 0 : Number(value),
    ])
  );
}

function buildPendingBudgets(localBudgets, limitDrafts) {
  const next = { ...normalizeBudgetValues(localBudgets) };
  Object.entries(limitDrafts).forEach(([cat, val]) => {
    if (val !== '' && val != null) next[cat] = Number(val);
  });
  return next;
}

export function BudgetSettings() {
  const { data, updateBudgets, stats } = useApp();
  const [localBudgets, setLocalBudgets] = useState(() => ({ ...data.budgets }));
  const [limitDrafts, setLimitDrafts] = useState({});
  const [newCategory, setNewCategory] = useState('');
  const [saved, setSaved] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    setLocalBudgets({ ...data.budgets });
    setLimitDrafts({});
  }, [data.budgets]);

  const hasChanges = useMemo(() => {
    return (
      JSON.stringify(buildPendingBudgets(localBudgets, limitDrafts)) !==
      JSON.stringify(normalizeBudgetValues(data.budgets))
    );
  }, [localBudgets, limitDrafts, data.budgets]);

  const categories = useMemo(() => getBudgetCategories(localBudgets), [localBudgets]);
  const availableCategories = useMemo(
    () => getAvailableBudgetCategories(localBudgets),
    [localBudgets]
  );

  const handleSave = () => {
    updateBudgets(buildPendingBudgets(localBudgets, limitDrafts));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addCategory = (name) => {
    const trimmed = name.trim();
    if (!trimmed || localBudgets[trimmed] !== undefined) return false;
    setLocalBudgets((prev) => ({ ...prev, [trimmed]: 0 }));
    setNewCategory('');
    return true;
  };

  const handleAddCategory = () => {
    addCategory(newCategory);
  };

  const handleRemoveCategory = (cat) => {
    setActiveCategory((prev) => (prev === cat ? null : prev));
    setLocalBudgets((prev) => {
      const next = { ...prev };
      delete next[cat];
      return next;
    });
    setLimitDrafts((prev) => {
      const next = { ...prev };
      delete next[cat];
      return next;
    });
  };

  return (
    <Card>
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
        Monthly Budgets
      </h2>
      <p className="mb-3 text-xs text-portfolio-gray">
        Add only the categories you want to track
      </p>

      {availableCategories.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {availableCategories.map((cat) => (
            <Button
              key={cat}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => addCategory(cat)}
            >
              + {cat}
            </Button>
          ))}
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
          placeholder="Custom category name"
          className="flex-1 rounded-lg border border-portfolio-border bg-portfolio-elevated px-3 py-2 text-sm text-white placeholder:text-portfolio-gray focus:border-white focus:outline-none focus:ring-2 focus:ring-white/10"
        />
        <button
          type="button"
          onClick={handleAddCategory}
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border border-portfolio-border bg-portfolio-elevated text-white transition-colors hover:border-white hover:bg-portfolio-muted"
          aria-label="Add category"
        >
          <i className="bi bi-plus-lg text-lg" aria-hidden="true" />
        </button>
      </div>

      <div
        className={`grid grid-cols-2 gap-3 ${categories.length >= 6
            ? 'max-h-[17.5rem] overflow-y-auto overscroll-contain pr-0.5'
            : ''
          }`}
      >
        {categories.map((cat) => {
          const spent = stats.categorySpending[cat] || 0;
          const limit = Number(localBudgets[cat]) || 0;
          const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
          const over = spent > limit && limit > 0;

          return (
            <BudgetCard
              key={cat}
              cat={cat}
              spent={spent}
              limit={limit}
              pct={pct}
              over={over}
              value={limitDrafts[cat] ?? ''}
              showIcon={CATEGORIES.includes(cat)}
              canRemove
              isActive={activeCategory === cat}
              onActivate={(name) => setActiveCategory(name)}
              onChange={(name, val) =>
                setLimitDrafts((prev) => ({ ...prev, [name]: val }))
              }
              onRemove={handleRemoveCategory}
            />
          );
        })}

        {categories.length === 0 && (
          <p className="col-span-2 py-6 text-center text-sm text-portfolio-gray">
            No budgets yet — tap a category above to add one
          </p>
        )}
      </div>

      <div className="mt-3">
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className="w-full"
          variant={saved || !hasChanges ? 'secondary' : 'primary'}
        >
          {saved ? 'Saved!' : 'Save Budgets'}
        </Button>
      </div>
    </Card>
  );
}

export function DataManagement() {
  const { exportData, importData, clearData } = useApp();
  const [message, setMessage] = useState('');

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cashflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Data exported!');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          importData(ev.target.result);
          setMessage('Data imported!');
        } catch {
          setMessage('Invalid file format');
        }
        setTimeout(() => setMessage(''), 2000);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClear = () => {
    if (window.confirm('Clear all data? This cannot be undone.')) {
      clearData();
      setMessage('Data cleared');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
        Data Management
      </h2>
      <div className="space-y-2">
        <Button variant="outline" className="w-full" onClick={handleExport}>
          Export JSON
        </Button>
        <Button variant="secondary" className="w-full" onClick={handleImport}>
          Import JSON
        </Button>
        <Button variant="danger" className="w-full" onClick={handleClear}>
          Clear All Data
        </Button>
        {message && (
          <p className="text-center text-sm text-portfolio-light animate-fade-in">{message}</p>
        )}
      </div>
    </Card>
  );
}
