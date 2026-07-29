import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import ExpenseCalendar, { MonthSummary } from '../components/calendar/ExpenseCalendar';
import DayDetail from '../components/calendar/DayDetail';
import {
  getDailyExpenses,
  getDailyUnpaidDates,
  getTransactionsForDate,
} from '../utils/calculations';
import {
  alignDateToMonth,
  getMonthName,
  isSameMonth,
  shiftMonthKey,
} from '../utils/formatters';

export default function CalendarPage() {
  const { data, selectedCalendarDate, setSelectedCalendarDate } = useApp();
  const [viewMonth, setViewMonth] = useState(
    () => selectedCalendarDate.slice(0, 7) || data.currentMonth
  );

  const dailyExpenses = useMemo(
    () => getDailyExpenses(data.transactions, viewMonth, 'all', data.debts),
    [data.transactions, data.debts, viewMonth]
  );

  const dailyUnpaid = useMemo(
    () => getDailyUnpaidDates(data.transactions, viewMonth, data.debts),
    [data.transactions, data.debts, viewMonth]
  );

  const dayTransactions = useMemo(
    () => getTransactionsForDate(data.transactions, selectedCalendarDate, data.debts),
    [data.transactions, data.debts, selectedCalendarDate]
  );

  const changeMonth = (delta) => {
    setViewMonth((month) => {
      const nextMonth = shiftMonthKey(month, delta);
      setSelectedCalendarDate((date) => alignDateToMonth(date, nextMonth));
      return nextMonth;
    });
  };

  const selectDate = (dateStr) => {
    setSelectedCalendarDate(dateStr);
    const month = dateStr.slice(0, 7);
    if (!isSameMonth(dateStr, viewMonth)) {
      setViewMonth(month);
    }
  };

  return (
    <div className="page-padding space-y-4 animate-fade-in">
      <header>
        <h1 className="text-xl font-bold text-white">Calendar</h1>
        <p className="text-sm text-portfolio-gray">Daily expenses & pay-later</p>
      </header>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-portfolio-border bg-portfolio-card text-portfolio-gray shadow-card hover:border-white hover:text-white"
          aria-label="Previous month"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-white">{getMonthName(viewMonth)}</h2>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-portfolio-border bg-portfolio-card text-portfolio-gray shadow-card hover:border-white hover:text-white"
          aria-label="Next month"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <MonthSummary dailyExpenses={dailyExpenses} />

      <ExpenseCalendar
        monthKey={viewMonth}
        dailyExpenses={dailyExpenses}
        dailyUnpaid={dailyUnpaid}
        selectedDate={selectedCalendarDate}
        onSelectDate={selectDate}
      />

      <DayDetail
        dateStr={selectedCalendarDate}
        transactions={dayTransactions}
        debts={data.debts}
      />
    </div>
  );
}
