import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import AmountInput from '../ui/AmountInput';
import { centsToAmount } from '../../utils/amountInput';
import { formatCurrency } from '../../utils/formatters';

export default function CanIBuySimulator({ safeBalance }) {
  const [amountCents, setAmountCents] = useState(0);
  const [result, setResult] = useState(null);

  const handleCheck = () => {
    const purchase = centsToAmount(amountCents);
    if (!purchase || purchase <= 0) return;

    const newBalance = safeBalance - purchase;
    setResult({
      purchase,
      newBalance,
      canBuy: newBalance >= 0,
    });
  };

  return (
    <Card animate>
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-portfolio-gray">
        Can I Buy This?
      </h2>
      <p className="mb-3 text-xs text-portfolio-gray">Simulate a purchase impact on your safe balance</p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-portfolio-gray">
            RM
          </span>
          <AmountInput
            cents={amountCents}
            onCentsChange={setAmountCents}
            onValueChange={() => setResult(null)}
            className="w-full rounded-xl border border-portfolio-border bg-portfolio-elevated py-2.5 pl-10 pr-3 text-white focus:border-white focus:ring-2 focus:ring-white/10"
          />
        </div>
        <Button onClick={handleCheck} size="md" disabled={amountCents === 0}>
          Check
        </Button>
      </div>
      {result && (
        <div
          className={`mt-3 rounded-xl border p-3 text-sm animate-slide-up ${
            result.canBuy
              ? 'border-portfolio-gray bg-portfolio-elevated text-portfolio-light'
              : 'border-white bg-portfolio-black text-white'
          }`}
        >
          {result.canBuy ? (
            <>
              <p className="font-semibold">Yes, you can afford it!</p>
              <p className="mt-1 text-xs text-portfolio-gray">
                After RM {result.purchase}, safe balance: {formatCurrency(result.newBalance)}
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold">Not recommended</p>
              <p className="mt-1 text-xs text-portfolio-gray">
                You&apos;d be {formatCurrency(Math.abs(result.newBalance))} over budget
              </p>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
