import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  getTransactionCategories,
  DEBT_PROVIDERS,
  INCOME_SOURCES,
} from '../../data/initialData';
import { amountToCents, centsToAmount } from '../../utils/amountInput';
import CategoryButtons from './CategoryButtons';
import PaymentMethodButtons from './PaymentMethodButtons';
import Button from '../ui/Button';
import Input, { Select } from '../ui/Input';
import AmountInput from '../ui/AmountInput';

const MODES = [
  { id: 'cash', label: 'Expense' },
  { id: 'income', label: 'Income' },
  { id: 'debt', label: 'Debt' },
];

export default function AddTransaction() {
  const navigate = useNavigate();
  const {
    addCashTransaction,
    addDebtTransaction,
    addIncomeTransaction,
    data,
    selectedCalendarDate,
  } = useApp();
  const categories = useMemo(
    () => getTransactionCategories(data.budgets),
    [data.budgets]
  );

  const [mode, setMode] = useState('cash');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountCents, setAmountCents] = useState(0);
  const [category, setCategory] = useState('Food');
  const [incomeSource, setIncomeSource] = useState(INCOME_SOURCES[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(selectedCalendarDate);
  const [provider, setProvider] = useState(DEBT_PROVIDERS[0]);
  const [dueDate, setDueDate] = useState(selectedCalendarDate);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setDate(selectedCalendarDate);
    setDueDate(selectedCalendarDate);
  }, [selectedCalendarDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = centsToAmount(amountCents);
    if (!numAmount || numAmount <= 0) return;

    setSubmitting(true);

    if (mode === 'cash') {
      addCashTransaction({ amount: numAmount, category, description, date, paymentMethod });
    } else if (mode === 'income') {
      addIncomeTransaction({
        amount: numAmount,
        source: incomeSource,
        description,
        date,
      });
    } else {
      addDebtTransaction({
        amount: numAmount,
        provider,
        category,
        dueDate,
        description,
      });
    }

    setSuccess(true);
    setAmountCents(0);
    setDescription('');
    setSubmitting(false);

    setTimeout(() => {
      setSuccess(false);
      navigate('/');
    }, 800);
  };

  const quickAmounts = [10, 15, 20, 50, 100];
  const submitLabel =
    mode === 'cash' ? 'Add Expense' : mode === 'income' ? 'Add Income' : 'Add Debt';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex rounded-xl bg-portfolio-elevated p-1">
        {MODES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
              mode === id
                ? 'bg-white text-black shadow-sm'
                : 'text-portfolio-gray'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-portfolio-gray">Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium text-portfolio-gray">
            RM
          </span>
          <AmountInput
            cents={amountCents}
            onCentsChange={setAmountCents}
            autoFocus
            className="w-full rounded-2xl border-2 border-portfolio-border bg-portfolio-elevated py-4 pl-14 pr-4 text-2xl font-bold text-white focus:border-white focus:ring-2 focus:ring-white/10"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {quickAmounts.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setAmountCents(amountToCents(q))}
              className="rounded-lg border border-portfolio-border bg-portfolio-elevated px-3 py-1 text-sm font-medium text-portfolio-gray hover:border-white hover:text-white"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {mode === 'cash' && (
        <div>
          <label className="mb-2 block text-sm font-medium text-portfolio-gray">Payment method</label>
          <PaymentMethodButtons compact selected={paymentMethod} onSelect={setPaymentMethod} />
        </div>
      )}

      {mode === 'income' ? (
        <div>
          <label className="mb-2 block text-sm font-medium text-portfolio-gray">Source</label>
          <CategoryButtons
            categories={INCOME_SOURCES}
            selected={incomeSource}
            onSelect={setIncomeSource}
          />
        </div>
      ) : (
        <div>
          <label className="mb-2 block text-sm font-medium text-portfolio-gray">Category</label>
          <CategoryButtons
            categories={categories}
            selected={category}
            onSelect={setCategory}
          />
        </div>
      )}

      {mode === 'debt' && (
        <>
          <Select label="Provider" value={provider} onChange={(e) => setProvider(e.target.value)}>
            {DEBT_PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
          <Input
            label="Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
          <p className="rounded-lg border border-portfolio-border bg-portfolio-elevated px-3 py-2 text-xs text-portfolio-gray">
            This won&apos;t reduce your cash now — it creates a debt obligation due later.
          </p>
        </>
      )}

      {mode !== 'debt' && (
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      )}

      <Input
        label="Description (optional)"
        type="text"
        placeholder={
          mode === 'cash'
            ? 'e.g. Lunch'
            : mode === 'income'
              ? 'e.g. Bank transfer'
              : 'e.g. Shopee order'
        }
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {mode === 'income' && (
        <p className="rounded-lg border border-metric-cash/30 bg-metric-cash/5 px-3 py-2 text-xs text-portfolio-gray">
          Adds to your cash available this month (transfers, side gigs, etc.).
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={submitting || amountCents === 0}
      >
        {success ? '✓ Saved!' : submitLabel}
      </Button>
    </form>
  );
}
