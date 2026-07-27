import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { amountToCents, centsToAmount } from '../../utils/amountInput';
import { formatCurrency, formatDate } from '../../utils/formatters';
import AmountInput from '../ui/AmountInput';
import Button from '../ui/Button';

export default function PayDebtModal({ debt, onClose }) {
  const { payDebt } = useApp();
  const [amountCents, setAmountCents] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const remainingCents = amountToCents(debt.remaining);

  const quickAmounts = useMemo(() => {
    const remaining = debt.remaining;
    const candidates = [
      remaining,
      Math.ceil(remaining / 2),
      10,
      20,
      50,
      100,
    ];
    return [...new Set(candidates.filter((q) => q > 0 && q <= remaining))].slice(0, 5);
  }, [debt.remaining]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = centsToAmount(amountCents);
    if (!numAmount || numAmount <= 0) return;

    setSubmitting(true);
    payDebt(debt.id, numAmount);
    setSuccess(true);
    setSubmitting(false);

    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="flex max-h-[min(90dvh,100%)] w-full max-w-lg min-w-0 flex-col overflow-hidden rounded-2xl border border-portfolio-border bg-portfolio-card shadow-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-portfolio-border p-4 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Record payment</h2>
              <p className="text-xs text-portfolio-gray">
                {debt.name} · due {formatDate(debt.dueDate)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-portfolio-gray hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="min-w-0 space-y-5 overflow-y-auto overflow-x-hidden p-4 pt-3"
        >
          <div className="rounded-xl border border-portfolio-border bg-portfolio-elevated px-3 py-3 text-center">
            <p className="text-xs text-portfolio-gray">Remaining balance</p>
            <p className="text-xl font-bold text-white">{formatCurrency(debt.remaining)}</p>
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
                  {q === debt.remaining ? 'Full' : q}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting || amountCents === 0 || amountCents > remainingCents}
          >
            {success ? '✓ Saved!' : 'Record payment'}
          </Button>
        </form>
      </div>
    </div>
  );
}
