import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/initialData';
import { amountToCents, centsToAmount } from '../../utils/amountInput';
import { getTransactionCalendarDate } from '../../utils/calculations';
import { getTransactionPaidStatus } from '../../utils/transactionStatus';
import CategoryButtons from './CategoryButtons';
import PaymentMethodButtons from './PaymentMethodButtons';
import Button from '../ui/Button';
import Input from '../ui/Input';
import AmountInput from '../ui/AmountInput';

const PAYMENT_STATUSES = [
  {
    id: 'paid',
    label: 'Paid',
    selectedClass: 'border-metric-cash bg-metric-cash/10 text-metric-cash',
  },
  {
    id: 'unpaid',
    label: 'Unpaid',
    selectedClass: 'border-metric-debt bg-metric-debt/10 text-metric-debt',
  },
];

function PaymentStatusButtons({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {PAYMENT_STATUSES.map(({ id, label, selectedClass }) => {
        const isSelected = selected === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`rounded-xl border-2 py-3 text-sm font-semibold uppercase transition-all ${
              isSelected
                ? selectedClass
                : 'border-portfolio-border bg-portfolio-elevated text-portfolio-gray hover:border-portfolio-gray'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default function EditTransactionModal({ transaction, onClose }) {
  const {
    data,
    updateTransaction,
    deleteTransaction,
    markDebtPaid,
    markDebtUnpaid,
  } = useApp();
  const [amountCents, setAmountCents] = useState(0);
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paidStatus, setPaidStatus] = useState('paid');

  useEffect(() => {
    if (!transaction) return;
    setAmountCents(amountToCents(transaction.amount));
    setCategory(transaction.category);
    setDescription(transaction.description || '');
    setDate(getTransactionCalendarDate(transaction, data.debts));
    setPaymentMethod(
      transaction.paymentMethod || (transaction.type === 'cash' ? 'cash' : '')
    );
    setPaidStatus(getTransactionPaidStatus(transaction, data.debts));
  }, [transaction, data.debts]);

  if (!transaction) return null;

  const isCash = transaction.type === 'cash';
  const hasLinkedDebt = !isCash && Boolean(transaction.debtId);

  const handleSave = (e) => {
    e.preventDefault();
    const numAmount = centsToAmount(amountCents);
    if (!numAmount || numAmount <= 0) return;

    updateTransaction(transaction.id, {
      amount: numAmount,
      category,
      description,
      date,
      ...(isCash
        ? { paymentMethod: paymentMethod || 'cash' }
        : paymentMethod
          ? { paymentMethod }
          : {}),
    });

    if (hasLinkedDebt) {
      if (paidStatus === 'paid') {
        markDebtPaid(transaction.debtId);
      } else {
        markDebtUnpaid(transaction.debtId);
      }
    }

    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Delete this transaction?')) {
      deleteTransaction(transaction.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div
        className="w-full max-w-lg rounded-2xl border border-portfolio-border bg-portfolio-card p-4 shadow-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Edit expense</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-portfolio-gray hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-portfolio-gray">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-portfolio-gray">
                RM
              </span>
              <AmountInput
                cents={amountCents}
                onCentsChange={setAmountCents}
                className="w-full rounded-xl border border-portfolio-border bg-portfolio-elevated py-2 pl-11 pr-3 text-lg font-bold text-white focus:border-white focus:ring-2 focus:ring-white/10"
              />
            </div>
          </div>

          {isCash ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-portfolio-gray">
                Payment method
              </label>
              <PaymentMethodButtons
                compact
                selected={paymentMethod}
                onSelect={setPaymentMethod}
              />
            </div>
          ) : (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-portfolio-gray">Status</label>
                {hasLinkedDebt ? (
                  <PaymentStatusButtons selected={paidStatus} onSelect={setPaidStatus} />
                ) : (
                  <p className="text-xs text-portfolio-gray">
                    No linked debt record — status cannot be changed.
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-portfolio-gray">
                  Payment method
                </label>
                <PaymentMethodButtons
                  compact
                  selected={paymentMethod}
                  onSelect={setPaymentMethod}
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-portfolio-gray">Category</label>
            <CategoryButtons
              categories={CATEGORIES}
              selected={category}
              onSelect={setCategory}
            />
          </div>

          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <Input
            label="Description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={handleDelete}>
              Delete
            </Button>
            <Button type="submit" className="flex-1">
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
