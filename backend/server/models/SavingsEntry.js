import {
  normalizeSavingsEntryForClient,
  normalizeSavingsEntryForStorage,
} from '../utils/dates.js';

export function toClientSavingsEntry(doc) {
  return normalizeSavingsEntryForClient({
    id: doc.entryId,
    type: doc.type,
    amount: doc.amount,
    month: doc.month,
    note: doc.note,
    date: doc.date,
  });
}

export function toSavingsEntryDocument(userId, entry) {
  const normalized = normalizeSavingsEntryForStorage(entry);
  return {
    userId,
    entryId: normalized.id,
    type: normalized.type,
    amount: normalized.amount,
    month: normalized.month,
    note: normalized.note,
    date: normalized.date,
    updatedAt: new Date(),
  };
}
