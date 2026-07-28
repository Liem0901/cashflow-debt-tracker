export function toClientDebt(doc) {
  return {
    id: doc.debtId,
    name: doc.name,
    amount: Number(doc.amount || 0),
    remaining: Number(doc.remaining ?? doc.amount ?? 0),
    dueDate: doc.dueDate,
    category: doc.category || 'Other',
    status: doc.status || 'active',
  };
}

export function toDebtDocument(userId, debt) {
  return {
    userId,
    debtId: debt.id,
    name: debt.name,
    amount: Number(debt.amount || 0),
    remaining: Number(debt.remaining ?? debt.amount ?? 0),
    dueDate: debt.dueDate,
    category: debt.category || 'Other',
    status: debt.status || 'active',
    updatedAt: new Date(),
  };
}
