const MAX_CENTS = 999_999_999_99;

export function centsToDisplay(cents) {
  return (Math.max(0, cents) / 100).toFixed(2);
}

export function centsToAmount(cents) {
  return cents / 100;
}

export function amountToCents(amount) {
  return Math.min(MAX_CENTS, Math.round(Number(amount) * 100) || 0);
}

export function appendDigit(cents, digit) {
  const next = cents * 10 + digit;
  return next > MAX_CENTS ? cents : next;
}

export function deleteDigit(cents) {
  return Math.floor(cents / 10);
}

export function parsePastedAmount(text) {
  const cleaned = text.replace(/[^\d.]/g, '');
  if (!cleaned) return 0;
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return 0;
  return amountToCents(value);
}
