import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import Button from '../ui/Button';
import AmountInput from '../ui/AmountInput';
import { getSalaryForMonth, hasSalaryOverride } from '../../utils/calculations';
import { amountToCents, centsToAmount } from '../../utils/amountInput';
import { getMonthName, shiftMonthKey } from '../../utils/formatters';

function MonthNavButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-portfolio-border bg-portfolio-elevated text-portfolio-gray transition-colors hover:border-white hover:text-white"
      aria-label={label}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {label === 'Previous month' ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        )}
      </svg>
    </button>
  );
}

export default function SalaryMonthModal({ initialMonth, currentMonth, onConfirm, onClose }) {
  const { data, updateSalary } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [amountCents, setAmountCents] = useState(0);

  useEffect(() => {
    setSelectedMonth(initialMonth);
  }, [initialMonth]);

  useEffect(() => {
    setAmountCents(amountToCents(getSalaryForMonth(data, selectedMonth)));
  }, [data, selectedMonth]);

  const isCurrentMonth = selectedMonth === currentMonth;
  const isSaved = hasSalaryOverride(data, selectedMonth);

  const handleConfirm = () => {
    const numAmount = centsToAmount(amountCents);
    if (!numAmount || numAmount <= 0) return;

    updateSalary(numAmount, data.paydayDate || 25, selectedMonth);
    onConfirm(selectedMonth);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg min-w-0 rounded-2xl border border-portfolio-border bg-portfolio-card p-4 shadow-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Choose month</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-portfolio-gray hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <MonthNavButton
            label="Previous month"
            onClick={() => setSelectedMonth((m) => shiftMonthKey(m, -1))}
          />
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-base font-semibold text-white">
              {getMonthName(selectedMonth)}
            </p>
            {!isCurrentMonth && (
              <p className="mt-0.5 text-[10px] uppercase tracking-wide text-portfolio-gray">
                {selectedMonth > currentMonth ? 'Future month' : 'Past month'}
              </p>
            )}
          </div>
          <MonthNavButton
            label="Next month"
            onClick={() => setSelectedMonth((m) => shiftMonthKey(m, 1))}
          />
        </div>

        <div className="mb-4 min-w-0 rounded-xl border border-portfolio-border bg-portfolio-elevated px-3 py-3 text-center">
          <p className="text-xs text-portfolio-gray">Salary</p>
          <div className="mt-1 flex justify-center overflow-x-auto">
            <div className="inline-flex max-w-full items-baseline justify-center gap-1.5">
              <span className="text-amount shrink-0 text-2xl font-bold text-portfolio-gray">RM</span>
              <AmountInput
                cents={amountCents}
                onCentsChange={setAmountCents}
                sizeToContent
                minWidthCh={4}
                className="text-amount max-w-full min-w-0 bg-transparent text-left text-2xl font-bold text-white focus:outline-none"
              />
            </div>
          </div>
          {!isSaved && (
            <p className="mt-2 text-[10px] text-portfolio-gray">Carried over — tap to edit</p>
          )}
        </div>

        <div className="flex gap-2">
          {!isCurrentMonth && (
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setSelectedMonth(currentMonth)}
            >
              This month
            </Button>
          )}
          <Button
            type="button"
            className="flex-1"
            onClick={handleConfirm}
            disabled={amountCents === 0}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
