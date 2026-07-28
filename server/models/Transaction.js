export function toClientTransaction(doc) {
  const tx = {
    id: doc.txId,
    type: doc.type,
    amount: Number(doc.amount || 0),
    category: doc.category || 'Other',
    description: doc.description || '',
    date: doc.date,
  };

  if (doc.debtId) tx.debtId = doc.debtId;
  if (doc.paymentMethod) tx.paymentMethod = doc.paymentMethod;

  return tx;
}

export function toTransactionDocument(userId, tx) {
  return {
    userId,
    txId: tx.id,
    type: tx.type,
    amount: Number(tx.amount || 0),
    category: tx.category || 'Other',
    description: tx.description || '',
    date: tx.date,
    debtId: tx.debtId || null,
    paymentMethod: tx.paymentMethod || null,
    updatedAt: new Date(),
  };
}
