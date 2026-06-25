import { useState } from 'react';
import Card from '../ui/Card';
import SalaryMonthModal from './SalaryMonthModal';
import { formatCurrency, getMonthName } from '../../utils/formatters';

export default function SalaryCard({
  salary,
  viewMonth,
  currentMonth,
  onViewMonthChange,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const isCurrentMonth = viewMonth === currentMonth;

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="w-full text-left transition-transform active:scale-[0.99]"
      >
        <Card
          className="border-portfolio-white bg-portfolio-black transition-colors hover:border-portfolio-light"
          animate
        >
          <p className="text-sm font-medium text-portfolio-gray">Monthly Salary</p>
          <p className="text-amount mt-1 text-3xl font-bold text-white">{formatCurrency(salary)}</p>
          <p className="mt-2 text-sm font-medium text-portfolio-light">{getMonthName(viewMonth)}</p>
          <p className="mt-1 text-[10px] uppercase tracking-wide text-portfolio-gray">
            {isCurrentMonth ? 'Tap to change month' : 'Viewing another month · tap to change'}
          </p>
        </Card>
      </button>

      {modalOpen && (
        <SalaryMonthModal
          initialMonth={viewMonth}
          currentMonth={currentMonth}
          onConfirm={onViewMonthChange}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
