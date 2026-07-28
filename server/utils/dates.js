/** UTC timestamp helpers — store BSON Date in MongoDB, ISO strings in API/client. */

export function utcNow() {
  return new Date();
}

export function toUtcIso(value) {
  if (value == null || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function toUtcDate(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function monthKeyFromTimestamp(value) {
  const iso = toUtcIso(value);
  return iso ? iso.slice(0, 7) : null;
}

export function normalizeSavingsEntryForClient(entry) {
  if (!entry || typeof entry !== 'object') return entry;
  const date = toUtcIso(entry.date);
  return {
    id: entry.id,
    type: entry.type,
    amount: Number(entry.amount) || 0,
    month: entry.month || monthKeyFromTimestamp(date),
    note: entry.note || '',
    date,
  };
}

export function normalizeSavingsEntryForStorage(entry) {
  if (!entry || typeof entry !== 'object') return entry;
  const date = toUtcDate(entry.date) || utcNow();
  return {
    id: entry.id,
    type: entry.type,
    amount: Number(entry.amount) || 0,
    month: entry.month || monthKeyFromTimestamp(date),
    note: entry.note || '',
    date,
  };
}

export function normalizeSavingsHistoryForClient(history = []) {
  if (!Array.isArray(history)) return [];
  return history.map(normalizeSavingsEntryForClient);
}

export function normalizeArchivedMonthForClient(archive) {
  if (!archive || typeof archive !== 'object') return archive;
  return {
    ...archive,
    archivedAt: toUtcIso(archive.archivedAt),
  };
}

export function normalizeArchivedMonthForStorage(archive) {
  if (!archive || typeof archive !== 'object') return archive;
  return {
    ...archive,
    archivedAt: toUtcDate(archive.archivedAt) || utcNow(),
  };
}

export function normalizeArchivedMonthsForClient(archivedMonths = []) {
  if (!Array.isArray(archivedMonths)) return [];
  return archivedMonths.map(normalizeArchivedMonthForClient);
}

export function normalizeArchivedMonthsForStorage(archivedMonths = []) {
  if (!Array.isArray(archivedMonths)) return [];
  return archivedMonths.map(normalizeArchivedMonthForStorage);
}

export function prepareUserSettingsForStorage(settings = {}) {
  return {
    ...settings,
    archivedMonths: normalizeArchivedMonthsForStorage(settings.archivedMonths),
  };
}

export function prepareUserSettingsForClient(settings = {}) {
  return {
    ...settings,
    archivedMonths: normalizeArchivedMonthsForClient(settings.archivedMonths),
  };
}
