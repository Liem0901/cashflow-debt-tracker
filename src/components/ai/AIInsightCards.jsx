import { motion } from 'framer-motion';
import { formatCurrency, formatDate } from '../../utils/formatters';

function InsightCard({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={`rounded-2xl border border-portfolio-border bg-portfolio-card/80 p-4 backdrop-blur-md ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function AIInsightCards({ insights, onQuickAction }) {
  const actions = [
    'Can I afford this?',
    'Analyze my spending',
    'Create a budget',
    'Help me save money',
    'Compare with last month',
    'Monthly report',
  ];

  return (
    <div className="space-y-3 px-4 pb-4">
      <div className="grid grid-cols-2 gap-3">
        <InsightCard delay={0.05}>
          <p className="text-xs font-medium uppercase tracking-wide text-portfolio-gray">
            Financial Health
          </p>
          <p className="mt-2 text-3xl font-bold text-white">
            {insights.healthScore}
            <span className="text-lg text-portfolio-gray"> / 100</span>
          </p>
        </InsightCard>

        <InsightCard delay={0.1}>
          <p className="text-xs font-medium uppercase tracking-wide text-portfolio-gray">
            This month
          </p>
          <p className="mt-2 text-sm leading-snug text-white">
            {insights.spentLess ? (
              <>
                You spent{' '}
                <span className="font-semibold text-metric-cash">
                  {Math.abs(insights.expenseDelta)}% less
                </span>{' '}
                than last month.
              </>
            ) : insights.expenseDelta === 0 ? (
              'Spending is steady vs last month.'
            ) : (
              <>
                Spending is{' '}
                <span className="font-semibold text-metric-debt">
                  {insights.expenseDelta}% higher
                </span>{' '}
                than last month.
              </>
            )}
          </p>
        </InsightCard>

        <InsightCard delay={0.15}>
          <p className="text-xs font-medium uppercase tracking-wide text-portfolio-gray">
            Top category
          </p>
          <p className="mt-2 text-lg font-semibold text-white">{insights.topCategory}</p>
          <p className="text-xs text-portfolio-gray">
            {insights.topCategoryUpcoming > 0 && insights.topCategoryPaid > 0
              ? `${formatCurrency(insights.topCategoryAmount)} total (${formatCurrency(insights.topCategoryPaid)} paid + ${formatCurrency(insights.topCategoryUpcoming)} debts)`
              : insights.topCategoryUpcoming > 0
                ? `${formatCurrency(insights.topCategoryUpcoming)} debts`
                : formatCurrency(insights.topCategoryPaid || insights.topCategoryAmount)}
          </p>
        </InsightCard>

        <InsightCard delay={0.2}>
          <p className="text-xs font-medium uppercase tracking-wide text-portfolio-gray">
            Potential savings
          </p>
          <p className="mt-2 text-lg font-semibold text-metric-cash">
            {formatCurrency(insights.potentialSavings)}/mo
          </p>
        </InsightCard>
      </div>

      {insights.upcomingBills.length > 0 ? (
        <InsightCard delay={0.25}>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-portfolio-gray">
            Upcoming bills
          </p>
          <ul className="space-y-1.5">
            {insights.upcomingBills.map((bill) => (
              <li key={bill.id} className="flex justify-between text-sm">
                <span className="text-portfolio-light">{bill.category}</span>
                <span className="text-white">
                  {formatCurrency(bill.remaining)} · {formatDate(bill.dueDate)}
                </span>
              </li>
            ))}
          </ul>
        </InsightCard>
      ) : null}

      <InsightCard delay={0.3}>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-portfolio-gray">
          Quick actions
        </p>
        <div className="flex flex-wrap gap-2">
          {actions.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => onQuickAction(label)}
              className="rounded-full border border-portfolio-border bg-portfolio-elevated px-3 py-1.5 text-xs text-portfolio-light transition-colors hover:border-white/25 hover:text-white"
            >
              {label}
            </button>
          ))}
        </div>
      </InsightCard>
    </div>
  );
}
