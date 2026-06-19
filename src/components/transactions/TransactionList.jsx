import { useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getPaymentLabel } from './PaymentMethodButtons';
import CategoryIcon from './CategoryIcon';
import EditTransactionModal from './EditTransactionModal';

export default function TransactionList({
  transactions,
  emptyMessage = 'No transactions yet',
  editable = false,
}) {
  const [editing, setEditing] = useState(null);

  if (transactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-portfolio-gray">{emptyMessage}</p>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {transactions.map((tx) => (
          <button
            key={tx.id}
            type="button"
            onClick={() => editable && setEditing(tx)}
            className={`flex w-full items-center justify-between rounded-xl border border-portfolio-border bg-portfolio-elevated px-3 py-2.5 text-left transition-colors ${
              editable ? 'hover:border-white active:bg-portfolio-muted' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-portfolio-muted text-lg">
                <CategoryIcon category={tx.category} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {tx.description || tx.category}
                </p>
                <p className="text-xs text-portfolio-gray">
                  {tx.category} · {formatDate(tx.date)}
                  {tx.type === 'cash' && (
                    <span> · {getPaymentLabel(tx.paymentMethod)}</span>
                  )}
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-amount font-semibold text-white">{formatCurrency(tx.amount)}</p>
              <span className="inline-block rounded-full border border-portfolio-border px-2 py-0.5 text-[10px] font-medium uppercase text-portfolio-gray">
                {tx.type}
              </span>
            </div>
          </button>
        ))}
      </div>

      {editable && (
        <EditTransactionModal transaction={editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}
