import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import ExpenseCalendar, { MonthSummary } from '../components/calendar/ExpenseCalendar';
import DayDetail from '../components/calendar/DayDetail';
import {
  getDailyExpenses,
  getTransactionsForDate,
} from '../utils/calculations';
import {
  getMonthName,
  shiftMonthKey,
  todayISO,
} from '../utils/formatters';

export default function CalendarPage() {
  const { data } = useApp();
  const [viewMonth, setViewMonth] = useState(data.currentMonth);
  const [selectedDate, setSelectedDate] = useState(todayISO());

  const dailyExpenses = useMemo(
    () => getDailyExpenses(data.transactions, viewMonth),
    [data.transactions, viewMonth]
  );

  const dayTransactions = useMemo(
    () => getTransactionsForDate(data.transactions, selectedDate),
    [data.transactions, selectedDate]
  );

  return (
    <div className="page-padding space-y-4 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Calendar</h1>
          <p className="text-sm text-portfolio-gray">Daily cash expenses</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMonth((m) => shiftMonthKey(m, -1))}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-portfolio-border bg-portfolio-card text-portfolio-gray shadow-card hover:border-white hover:text-white"
            aria-label="Previous month"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setViewMonth((m) => shiftMonthKey(m, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-portfolio-border bg-portfolio-card text-portfolio-gray shadow-card hover:border-white hover:text-white"
            aria-label="Next month"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </header>

      <div className="text-center">
        <h2 className="text-lg font-semibold text-white">{getMonthName(viewMonth)}</h2>
      </div>

      <MonthSummary dailyExpenses={dailyExpenses} />

      <ExpenseCalendar
        monthKey={viewMonth}
        dailyExpenses={dailyExpenses}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <DayDetail dateStr={selectedDate} transactions={dayTransactions} />
    </div>
  );
}
