export function formatCurrency(amount) {
  const value = Number(amount) || 0;
  return `RM ${value.toLocaleString('en-MY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getCurrentMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthName(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-MY', {
    month: 'long',
    year: 'numeric',
  });
}

export function isSameMonth(dateStr, monthKey) {
  if (!dateStr) return false;
  return dateStr.startsWith(monthKey);
}

export function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  const diff = target - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function formatCompactCurrency(amount) {
  const value = Number(amount) || 0;
  if (value === 0) return '';
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  }
  return String(Math.round(value));
}

export function parseMonthKey(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  return { year, month: month - 1 };
}

export function shiftMonthKey(monthKey, delta) {
  const { year, month } = parseMonthKey(monthKey);
  const d = new Date(year, month + delta, 1);
  return getCurrentMonthKey(d);
}

export function getCalendarDays(monthKey) {
  const { year, month } = parseMonthKey(monthKey);
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const cells = [];

  for (let i = 0; i < startOffset; i++) {
    cells.push(null);
  }

  for (let day = 1; day <= totalDays; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push(dateStr);
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export function formatDayLabel(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-MY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}
