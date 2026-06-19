import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input, { Select } from '../ui/Input';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, DEBT_PROVIDERS } from '../../data/initialData';
import { formatCurrency, formatDate, todayISO } from '../../utils/formatters';

export function SalarySettings() {
  const { data, updateSalary } = useApp();
  const [salary, setSalary] = useState(String(data.salary));
  const [payday, setPayday] = useState(String(data.paydayDate || 25));
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSalary(salary, payday);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
        Salary Settings
      </h2>
      <div className="space-y-3">
        <Input
          label="Monthly Salary (net)"
          type="number"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          min="0"
        />
        <Input
          label="Payday (day of month)"
          type="number"
          value={payday}
          onChange={(e) => setPayday(e.target.value)}
          min="1"
          max="31"
        />
        <Button onClick={handleSave} className="w-full" variant={saved ? 'secondary' : 'primary'}>
          {saved ? 'Saved!' : 'Save Salary'}
        </Button>
      </div>
    </Card>
  );
}

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

export function BudgetSettings() {
  const { data, updateBudgets, stats } = useApp();
  const [budgets, setBudgets] = useState({ ...data.budgets });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateBudgets(budgets);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
        Monthly Budgets
      </h2>
      <div className="space-y-3">
        {Object.keys(budgets).map((cat) => {
          const spent = stats.categorySpending[cat] || 0;
          const limit = Number(budgets[cat]) || 0;
          const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
          const over = spent > limit && limit > 0;

          return (
            <div key={cat}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium text-white">{cat}</span>
                <span className={over ? 'text-white' : 'text-portfolio-gray'}>
                  {formatCurrency(spent)} / {formatCurrency(limit)}
                </span>
              </div>
              <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-portfolio-muted">
                <div
                  className={`h-full rounded-full transition-all ${over ? 'bg-white' : 'bg-portfolio-gray'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <input
                type="number"
                value={budgets[cat]}
                onChange={(e) => setBudgets({ ...budgets, [cat]: e.target.value })}
                className="w-full rounded-lg border border-portfolio-border bg-portfolio-elevated px-3 py-2 text-sm text-white"
                placeholder="Budget limit"
              />
            </div>
          );
        })}
        <Button onClick={handleSave} className="w-full" variant={saved ? 'secondary' : 'primary'}>
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
