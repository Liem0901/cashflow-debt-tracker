import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SavingsJar from '../components/savings/SavingsJar';
import {
  ConfettiBurst,
  GoalReachedBanner,
  useSavingsGoalCelebration,
} from '../components/savings/SavingsCelebration';
import { formatCurrency, getMonthName } from '../utils/formatters';
import { getSavingsProgress } from '../utils/savings';

const TYPE_LABELS = {
  auto: 'Auto saved',
  deposit: 'Deposit',
  withdraw: 'Withdrawal',
};

function HistoryRow({ entry }) {
  const isWithdraw = entry.type === 'withdraw';
  const sign = isWithdraw ? '−' : '+';

  return (
    <div className="flex items-center justify-between gap-3 border-b border-portfolio-border py-3 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">
          {entry.month ? getMonthName(entry.month) : TYPE_LABELS[entry.type] || 'Savings'}
        </p>
        <p className="truncate text-xs text-portfolio-gray">
          {entry.note || TYPE_LABELS[entry.type]}
        </p>
      </div>
      <span
        className={`shrink-0 text-sm font-semibold ${
          isWithdraw ? 'text-metric-expense' : 'text-metric-cash'
        }`}
      >
        {sign}
        {formatCurrency(entry.amount)}
      </span>
    </div>
  );
}

export default function SavingsPage() {
  const {
    data,
    stats,
    depositSavings,
    withdrawSavings,
    updateSavingsGoal,
  } = useApp();

  const balance = Number(data.savingsBalance) || 0;
  const goal = Number(data.savingsGoal) || 5000;
  const progress = getSavingsProgress(balance, goal);
  const pendingThisMonth = Math.max(0, stats.safeBalance);
  const { goalReached, burst } = useSavingsGoalCelebration(balance, goal);

  const [mode, setMode] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [goalInput, setGoalInput] = useState(String(goal));
  const [editingGoal, setEditingGoal] = useState(false);

  const history = data.savingsHistory || [];

  const resetForm = () => {
    setMode(null);
    setAmount('');
    setNote('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) return;

    if (mode === 'deposit') depositSavings(value, note);
    if (mode === 'withdraw') withdrawSavings(value, note);
    resetForm();
  };

  const handleGoalSave = () => {
    updateSavingsGoal(goalInput);
    setEditingGoal(false);
  };

  return (
    <div className="page-padding space-y-4 animate-fade-in">
      <ConfettiBurst active={burst} />

      <header>
        <h1 className="text-xl font-bold text-white">Savings</h1>
        <p className="text-sm text-portfolio-gray">Your accumulated coin jar</p>
      </header>

      <Card animate>
        <SavingsJar balance={balance} goal={goal} progress={progress} goalReached={goalReached} />
        <GoalReachedBanner show={goalReached} />

        {pendingThisMonth > 0 ? (
          <p className="mt-2 text-center text-xs text-portfolio-gray">
            {formatCurrency(pendingThisMonth)} safe to spend this month — added automatically when
            the month ends.
          </p>
        ) : null}

        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            className="flex-1"
            onClick={() => {
              setMode('deposit');
              setAmount('');
              setNote('');
            }}
          >
            Deposit
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => {
              setMode('withdraw');
              setAmount('');
              setNote('');
            }}
            disabled={balance <= 0}
          >
            Withdraw
          </Button>
        </div>
      </Card>

      {mode ? (
        <Card>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
            {mode === 'deposit' ? 'Add to savings' : 'Withdraw from savings'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              label="Amount (RM)"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
            />
            <Input
              label="Note (optional)"
              type="text"
              placeholder={mode === 'deposit' ? 'Bonus, gift…' : 'Used for…'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Confirm
              </Button>
              <Button type="button" variant="ghost" className="flex-1" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
            Savings goal
          </h2>
          {!editingGoal ? (
            <button
              type="button"
              className="text-xs text-white underline-offset-2 hover:underline"
              onClick={() => {
                setGoalInput(String(goal));
                setEditingGoal(true);
              }}
            >
              Edit
            </button>
          ) : null}
        </div>
        {editingGoal ? (
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              step="100"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className="flex-1"
            />
            <Button type="button" size="sm" onClick={handleGoalSave}>
              Save
            </Button>
          </div>
        ) : (
          <p className="text-sm text-portfolio-light">{formatCurrency(goal)}</p>
        )}
      </Card>

      <Card>
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
          History
        </h2>
        {history.length === 0 ? (
          <p className="py-6 text-center text-sm text-portfolio-gray">
            No savings yet. Leftover safe-to-spend amounts are added when each month ends, or
            deposit manually.
          </p>
        ) : (
          <div>
            {history.map((entry) => (
              <HistoryRow key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
