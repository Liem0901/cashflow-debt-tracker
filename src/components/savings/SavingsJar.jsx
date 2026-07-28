import { formatCurrency } from '../../utils/formatters';
import { getSavingsProgress } from '../../utils/savings';
import ShinyCoin from './ShinyCoin';
import './SavingsJar.css';

function JarFluid({ fillPercent, goalReached = false }) {
  const fillHeight = `${Math.max(14, Math.min(100, fillPercent))}%`;

  return (
    <div
      className="absolute inset-x-0 bottom-0 overflow-hidden transition-[height] duration-700 ease-out motion-reduce:transition-none"
      style={{ height: fillHeight }}
    >
      <div
        className={`jar-fluid__body absolute inset-0 bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400/95 ${
          goalReached ? 'brightness-110' : ''
        }`}
      />

      <div className="jar-fluid__waves motion-reduce:hidden" aria-hidden>
        <div className="jar-fluid__wave jar-fluid__wave--back" />
        <div className="jar-fluid__wave jar-fluid__wave--front" />
      </div>
    </div>
  );
}

export default function SavingsJar({ balance, goal, progress, goalReached = false }) {
  const fillPercent = progress ?? getSavingsProgress(balance, goal);

  return (
    <div className={`flex flex-col items-center py-2 ${goalReached ? 'jar-goal-reached' : ''}`}>
      <div className="relative h-44 w-36">
        <div className="jar-shell absolute inset-x-3 bottom-0 top-6 overflow-hidden rounded-b-[2rem] rounded-t-2xl border-2 border-amber-400/40 bg-portfolio-elevated/80 transition-shadow duration-500">
          <JarFluid fillPercent={fillPercent} goalReached={goalReached} />
        </div>
        <div className="absolute left-1/2 top-0 flex h-8 w-14 -translate-x-1/2 items-end justify-center">
          <div className="h-3 w-10 rounded-t-lg border-2 border-b-0 border-amber-400/40 bg-portfolio-elevated/80" />
        </div>
        <div className="absolute -right-1 top-16">
          <ShinyCoin />
        </div>
      </div>
      <p className="mt-4 text-3xl font-bold text-white">{formatCurrency(balance)}</p>
      <p className={`mt-1 text-sm ${goalReached ? 'font-medium text-amber-200' : 'text-portfolio-gray'}`}>
        {goalReached ? 'Goal reached — jar is full!' : `${fillPercent}% of ${formatCurrency(goal)} goal`}
      </p>
    </div>
  );
}