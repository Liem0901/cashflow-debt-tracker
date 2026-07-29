import { PAYMENT_METHODS } from '../../data/initialData';

export default function PaymentMethodButtons({ selected, onSelect, compact = false }) {
  if (compact) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {PAYMENT_METHODS.map(({ id, label }) => {
          const isSelected = selected === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={`rounded-xl border-2 py-3 text-sm font-semibold uppercase transition-all ${
                isSelected
                  ? 'border-white bg-white text-black'
                  : 'border-portfolio-border bg-portfolio-elevated text-portfolio-gray hover:border-portfolio-gray'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {PAYMENT_METHODS.map(({ id, label, icon }) => {
        const isSelected = selected === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 transition-all ${
              isSelected
                ? 'border-white bg-white text-black scale-[1.02]'
                : 'border-portfolio-border bg-portfolio-elevated text-portfolio-gray hover:border-portfolio-gray'
            }`}
          >
            <i className={`bi ${icon} text-2xl`} aria-hidden="true" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function getPaymentLabel(method) {
  return PAYMENT_METHODS.find((m) => m.id === method)?.label || 'Cash';
}
