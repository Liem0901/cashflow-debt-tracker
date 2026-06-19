import { useMemo } from 'react';
import Card from '../ui/Card';
import {
  formatCompactCurrency,
  formatCurrency,
  getCalendarDays,
  todayISO,
} from '../../utils/formatters';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getHeatClass(amount, maxAmount, hasUnpaid) {
  if (!amount) return '';
  if (hasUnpaid) {
    if (maxAmount <= 0) return 'bg-metric-debt/20 text-metric-debt';
    const ratio = amount / maxAmount;
    if (ratio >= 0.75) return 'bg-metric-debt/35 text-metric-debt';
    if (ratio >= 0.4) return 'bg-metric-debt/25 text-metric-debt';
    return 'bg-metric-debt/15 text-metric-debt';
  }
  if (maxAmount <= 0) return 'bg-portfolio-muted text-portfolio-light';
  const ratio = amount / maxAmount;
  if (ratio >= 0.75) return 'bg-white text-black';
  if (ratio >= 0.4) return 'bg-portfolio-light text-black';
  return 'bg-portfolio-muted text-white';
}

function getCellClass({ amount, maxAmount, hasUnpaid, isToday, isSelected }) {
  if (isSelected) {
    return 'border-white bg-white text-black ring-2 ring-white/30';
  }
  if (isToday) {
    return hasUnpaid
      ? 'border-metric-debt/50 bg-metric-debt/15 text-white'
      : 'border-portfolio-light bg-portfolio-elevated text-white';
  }
  if (amount) {
    const heatClass = getHeatClass(amount, maxAmount, hasUnpaid);
    const borderClass = hasUnpaid ? 'border-metric-debt/30' : 'border-transparent';
    return `${borderClass} ${heatClass}`;
  }
  if (hasUnpaid) {
    return 'border-metric-debt/30 bg-metric-debt/10 text-metric-debt';
  }
  return 'border-transparent bg-portfolio-elevated/50 text-portfolio-gray';
}

export default function ExpenseCalendar({
  monthKey,
  dailyExpenses,
  dailyUnpaid = {},
  selectedDate,
  onSelectDate,
}) {
  const cells = useMemo(() => getCalendarDays(monthKey), [monthKey]);
  const maxAmount = useMemo(
    () => Math.max(0, ...Object.values(dailyExpenses)),
    [dailyExpenses]
  );
  const today = todayISO();

  return (
    <Card animate className="!p-3">
      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-portfolio-gray"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((dateStr, index) => {
          if (!dateStr) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const amount = dailyExpenses[dateStr] || 0;
          const hasUnpaid = Boolean(dailyUnpaid[dateStr]);
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const cellClass = getCellClass({
            amount,
            maxAmount,
            hasUnpaid,
            isToday,
            isSelected,
          });

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              className={`flex aspect-square flex-col items-center justify-center rounded-xl border transition-all ${cellClass}`}
            >
              <span className="text-sm font-semibold">
                {Number(dateStr.split('-')[2])}
              </span>
              {amount > 0 && (
                <span className="mt-0.5 text-[9px] font-bold leading-none">
                  {formatCompactCurrency(amount)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-portfolio-border pt-3 text-xs text-portfolio-gray">
        <span>Tap a day for details</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded bg-metric-debt/25 ring-1 ring-metric-debt/40" />
            <span className="mr-1">Unpaid</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded bg-portfolio-muted ring-1 ring-portfolio-border" />
            <span className="mr-1">Low</span>
            <span className="h-2.5 w-2.5 rounded bg-white" />
            <span>High</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function MonthSummary({ dailyExpenses }) {
  const total = Object.values(dailyExpenses).reduce((sum, n) => sum + n, 0);
  const activeDays = Object.values(dailyExpenses).filter((n) => n > 0).length;
  const avg = activeDays > 0 ? total / activeDays : 0;

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="rounded-xl border border-portfolio-border bg-portfolio-card p-3 shadow-card">
        <p className="text-[10px] font-medium uppercase text-portfolio-gray">Month total</p>
        <p className="mt-0.5 text-sm font-bold text-white">{formatCurrency(total)}</p>
      </div>
      <div className="rounded-xl border border-portfolio-border bg-portfolio-card p-3 shadow-card">
        <p className="text-[10px] font-medium uppercase text-portfolio-gray">Active days</p>
        <p className="mt-0.5 text-sm font-bold text-white">{activeDays}</p>
      </div>
      <div className="rounded-xl border border-portfolio-border bg-portfolio-card p-3 shadow-card">
        <p className="text-[10px] font-medium uppercase text-portfolio-gray">Daily avg</p>
        <p className="mt-0.5 text-sm font-bold text-white">{formatCurrency(avg)}</p>
      </div>
    </div>
  );
}
