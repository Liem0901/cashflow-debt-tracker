/** UTC timestamp helpers — ISO strings in client state and API payloads. */

export function utcNowIso() {
  return new Date().toISOString();
}

export function toUtcIso(value) {
  if (value == null || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function monthKeyFromTimestamp(value) {
  const iso = toUtcIso(value);
  return iso ? iso.slice(0, 7) : null;
}

export function normalizeSavingsEntry(entry) {
  if (!entry || typeof entry !== 'object') return entry;
  const date = toUtcIso(entry.date) || utcNowIso();
  return {
    id: entry.id,
    type: entry.type,
    amount: Number(entry.amount) || 0,
    month: entry.month || monthKeyFromTimestamp(date),
    note: entry.note || '',
    date,
  };
}

export function normalizeSavingsHistory(history = []) {
  if (!Array.isArray(history)) return [];
  return history.map(normalizeSavingsEntry);
}

export function normalizeArchivedMonth(archive) {
  if (!archive || typeof archive !== 'object') return archive;
  return {
    ...archive,
    archivedAt: toUtcIso(archive.archivedAt) || utcNowIso(),
  };
}

export function normalizeArchivedMonths(archivedMonths = []) {
  if (!Array.isArray(archivedMonths)) return [];
  return archivedMonths.map(normalizeArchivedMonth);
}
