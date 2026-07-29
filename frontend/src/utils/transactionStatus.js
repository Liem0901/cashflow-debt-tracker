export function getTransactionPaidStatus(tx, debts = []) {
  if (tx.type === 'income') return null;
  if (tx.type === 'cash') return tx.paidStatus === 'unpaid' ? 'unpaid' : 'paid';

  if (tx.debtId) {
    const debt = debts.find((d) => d.id === tx.debtId);
    return debt?.status === 'paid' ? 'paid' : 'unpaid';
  }

  return tx.paidStatus === 'paid' ? 'paid' : 'unpaid';
}

export function getTransactionStatusBadge(status) {
  if (status === 'paid') {
    return {
      label: 'Paid',
      className:
        'border-metric-cash/50 bg-metric-cash/10 text-metric-cash',
    };
  }

  return {
    label: 'Unpaid',
    className:
      'border-metric-debt/50 bg-metric-debt/10 text-metric-debt',
  };
}
