import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, DEBT_PROVIDERS } from '../../data/initialData';
import { todayISO } from '../../utils/formatters';
import { amountToCents, centsToAmount } from '../../utils/amountInput';
import CategoryButtons from './CategoryButtons';
import PaymentMethodButtons from './PaymentMethodButtons';
import Button from '../ui/Button';
import Input, { Select } from '../ui/Input';
import AmountInput from '../ui/AmountInput';

export default function AddTransaction() {
  const navigate = useNavigate();
  const { addCashTransaction, addDebtTransaction } = useApp();

  const [mode, setMode] = useState('cash');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountCents, setAmountCents] = useState(0);
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayISO());
  const [provider, setProvider] = useState(DEBT_PROVIDERS[0]);
  const [dueDate, setDueDate] = useState(todayISO());
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = centsToAmount(amountCents);
    if (!numAmount || numAmount <= 0) return;

    setSubmitting(true);

    if (mode === 'cash') {
      addCashTransaction({ amount: numAmount, category, description, date, paymentMethod });
    } else {
      addDebtTransaction({
        amount: numAmount,
        provider,
        category,
        dueDate,
        description,
        date,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex rounded-xl bg-portfolio-elevated p-1">
        <button
          type="button"
          onClick={() => setMode('cash')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
            mode === 'cash'
              ? 'bg-white text-black shadow-sm'
              : 'text-portfolio-gray'
          }`}
        >
          Cash Expense
        </button>
        <button
          type="button"
          onClick={() => setMode('debt')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
            mode === 'debt'
              ? 'bg-white text-black shadow-sm'
              : 'text-portfolio-gray'
          }`}
        >
          Pay Later / Debt
        </button>
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
          <PaymentMethodButtons selected={paymentMethod} onSelect={setPaymentMethod} />
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-portfolio-gray">Category</label>
        <CategoryButtons
          categories={CATEGORIES}
          selected={category}
          onSelect={setCategory}
        />
      </div>

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
            label="Due Date"
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

      {mode === 'cash' && (
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
        placeholder={mode === 'cash' ? 'e.g. Lunch' : 'e.g. Shopee order'}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={submitting || amountCents === 0}
      >
        {success ? '✓ Saved!' : mode === 'cash' ? 'Add Expense' : 'Add Debt'}
      </Button>
    </form>
  );
}
