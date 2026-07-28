import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SavingsCelebration.css';

const CONFETTI_COLORS = ['#fcd34d', '#fbbf24', '#fde68a', '#ffffff', '#f59e0b', '#fef3c7'];

function buildParticles(count = 32) {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    left: `${8 + Math.random() * 84}%`,
    delay: `${Math.random() * 0.35}s`,
    duration: `${1.4 + Math.random() * 1.1}s`,
    drift: `${-40 + Math.random() * 80}px`,
    spin: `${180 + Math.random() * 540}deg`,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    size: `${4 + Math.random() * 5}px`,
    height: `${6 + Math.random() * 8}px`,
  }));
}

export function ConfettiBurst({ active }) {
  const particles = useMemo(() => (active ? buildParticles() : []), [active]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="savings-confetti motion-reduce:hidden" aria-hidden>
      {particles.map((piece) => (
        <span
          key={piece.id}
          className="savings-confetti__piece"
          style={{
            left: piece.left,
            width: piece.size,
            height: piece.height,
            backgroundColor: piece.color,
            '--delay': piece.delay,
            '--duration': piece.duration,
            '--drift': piece.drift,
            '--spin': piece.spin,
          }}
        />
      ))}
    </div>
  );
}

export function GoalReachedBanner({ show }) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className="mt-3 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 px-3 py-2 text-center"
        >
          <p className="text-sm font-semibold text-amber-200">Goal reached!</p>
          <p className="text-xs text-portfolio-gray">You hit your savings target — nice work.</p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function useSavingsGoalCelebration(balance, goal) {
  const [burst, setBurst] = useState(false);
  const prevBalanceRef = useRef(balance);
  const goalReached = goal > 0 && balance >= goal;

  useEffect(() => {
    const wasBelow = prevBalanceRef.current < goal;
    const nowReached = goal > 0 && balance >= goal;

    if (wasBelow && nowReached) {
      setBurst(true);
      const timer = window.setTimeout(() => setBurst(false), 2600);
      prevBalanceRef.current = balance;
      return () => window.clearTimeout(timer);
    }

    prevBalanceRef.current = balance;
    return undefined;
  }, [balance, goal]);

  return { goalReached, burst };
}
