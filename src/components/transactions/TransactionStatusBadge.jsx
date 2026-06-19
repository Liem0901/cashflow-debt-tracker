import { getTransactionPaidStatus, getTransactionStatusBadge } from '../../utils/transactionStatus';

export default function TransactionStatusBadge({ transaction, debts = [] }) {
  const status = getTransactionPaidStatus(transaction, debts);
  const badge = getTransactionStatusBadge(status);

  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}
