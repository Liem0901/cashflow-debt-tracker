import AddTransaction from './AddTransaction';

const TITLES = {
  cash: { title: 'Add transaction', subtitle: 'Quick entry — amount, category, date' },
  income: { title: 'Add income', subtitle: 'Salary, transfer, or side income' },
  debt: { title: 'Add debt', subtitle: 'Pay-later or loan obligation' },
};

export default function AddTransactionModal({ mode = 'cash', source, onClose }) {
  const copy = TITLES[mode] || TITLES.cash;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="flex max-h-[min(90dvh,100%)] w-full max-w-lg min-w-0 flex-col overflow-hidden rounded-2xl border border-portfolio-border bg-portfolio-card shadow-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-portfolio-border p-4 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">{copy.title}</h2>
              <p className="text-xs text-portfolio-gray">{copy.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-portfolio-gray hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="min-w-0 overflow-y-auto overflow-x-hidden p-4 pt-3">
          <AddTransaction initialMode={mode} initialSource={source} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
