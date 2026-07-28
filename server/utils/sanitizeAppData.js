import { generateId } from './id.js';

function ensureUniqueIds(items, prefix, idKey) {
  const seen = new Set();

  return items.map((item) => {
    if (!item || typeof item !== 'object') return item;

    let id = item[idKey];
    if (!id || seen.has(id)) {
      id = generateId(prefix);
    }

    seen.add(id);
    return id === item[idKey] ? item : { ...item, [idKey]: id };
  });
}

/** Assign missing/duplicate ids before MongoDB unique indexes reject the batch. */
export function sanitizeAppDataForStorage(data) {
  return {
    ...data,
    transactions: ensureUniqueIds(data.transactions || [], 'tx', 'id'),
    debts: ensureUniqueIds(data.debts || [], 'debt', 'id'),
    savingsHistory: ensureUniqueIds(data.savingsHistory || [], 'save', 'id'),
  };
}
