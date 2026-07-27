export function validateAppData(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return ['AppData must be an object'];
  }

  if (!Array.isArray(data.transactions)) {
    errors.push('AppData transactions must be an array');
  }

  if (!Array.isArray(data.debts)) {
    errors.push('AppData debts must be an array');
  }

  if (data.archivedMonths != null && !Array.isArray(data.archivedMonths)) {
    errors.push('AppData archivedMonths must be an array');
  }

  if (data.budgets != null && (typeof data.budgets !== 'object' || Array.isArray(data.budgets))) {
    errors.push('AppData budgets must be an object');
  }

  return errors;
}
