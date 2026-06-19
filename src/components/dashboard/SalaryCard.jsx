import Card from '../ui/Card';
import { formatCurrency, getMonthName } from '../../utils/formatters';

export default function SalaryCard({ salary, monthKey }) {
  return (
    <Card className="border-portfolio-white bg-portfolio-black" animate>
      <p className="text-sm font-medium text-portfolio-gray">Monthly Salary</p>
      <p className="text-amount mt-1 text-3xl font-bold text-white">{formatCurrency(salary)}</p>
      <p className="mt-2 text-sm text-portfolio-light">{getMonthName(monthKey)}</p>
    </Card>
  );
}
