export function flattenApiError(error) {
  const parts = [];
  let current = error;

  while (current) {
    if (current.message) parts.push(String(current.message));
    current = current.cause;
  }

  return parts.join(' — ') || 'Unknown error';
}
