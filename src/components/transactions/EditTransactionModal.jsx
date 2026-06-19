import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/initialData';
import { amountToCents, centsToAmount } from '../../utils/amountInput';
import CategoryButtons from './CategoryButtons';
import PaymentMethodButtons from './PaymentMethodButtons';
import Button from '../ui/Button';
import Input from '../ui/Input';
import AmountInput from '../ui/AmountInput';

export default function EditTransactionModal({ transaction, onClose }) {
  const { updateTransaction, deleteTransaction } = useApp();
  const [amountCents, setAmountCents] = useState(0);
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    if (!transaction) return;
    setAmountCents(amountToCents(transaction.amount));
    setCategory(transaction.category);
    setDescription(transaction.description || '');
    setDate(transaction.date);
    setPaymentMethod(transaction.paymentMethod || 'cash');
  }, [transaction]);

  if (!transaction) return null;

  const isCash = transaction.type === 'cash';

  const handleSave = (e) => {
    e.preventDefault();
    const numAmount = centsToAmount(amountCents);
    if (!numAmount || numAmount <= 0) return;

    updateTransaction(transaction.id, {
      amount: numAmount,
      category,
      description,
      date,
      ...(isCash ? { paymentMethod } : {}),
    });
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
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-portfolio-border bg-portfolio-card p-4 shadow-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
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

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-portfolio-gray">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-portfolio-gray">
                RM
              </span>
              <AmountInput
                cents={amountCents}
                onCentsChange={setAmountCents}
                className="w-full rounded-xl border border-portfolio-border bg-portfolio-elevated py-3 pl-14 pr-4 text-xl font-bold text-white focus:border-white focus:ring-2 focus:ring-white/10"
              />
            </div>
          </div>

          {isCash && (
            <div>
              <label className="mb-2 block text-sm font-medium text-portfolio-gray">
                Payment method
              </label>
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

          {!isCash && (
            <p className="text-xs text-portfolio-gray">
              Debt obligations are managed separately in Profile → Debt Management.
            </p>
          )}

          <div className="flex gap-2 pt-2">
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
