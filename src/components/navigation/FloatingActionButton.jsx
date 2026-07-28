import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@mdi/react';
import {
  mdiCashMinus,
  mdiCashPlus,
  mdiSwapHorizontal,
  mdiCheckCircleOutline,
  mdiPlus,
} from '@mdi/js';
import { useApp } from '../../context/AppContext';

const SPRING = { type: 'spring', stiffness: 400, damping: 30, mass: 0.85 };
const SPRING_SOFT = { type: 'spring', stiffness: 320, damping: 28, mass: 0.9 };

function MdiIcon({ path, className = 'h-5 w-5' }) {
  return <Icon path={path} className={className} size={1} />;
}

const ACTIONS = [
  {
    id: 'expense',
    title: 'Add Expense',
    description: 'Track cash or card spending',
    mode: 'cash',
    icon: <MdiIcon path={mdiCashMinus} />,
  },
  {
    id: 'income',
    title: 'Add Income',
    description: 'Salary, transfer, side income',
    mode: 'income',
    icon: <MdiIcon path={mdiCashPlus} />,
  },
  {
    id: 'transfer',
    title: 'Add Transfer',
    description: 'Record incoming transfer',
    mode: 'income',
    icon: <MdiIcon path={mdiSwapHorizontal} />,
  },
  {
    id: 'debt-payment',
    title: 'Record Debt Payment',
    description: 'Pay down an existing debt',
    href: '/debts?action=pay',
    icon: <MdiIcon path={mdiCheckCircleOutline} />,
  },
];

const menuVariants = {
  closed: {
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
  open: {
    transition: { staggerChildren: 0.055, delayChildren: 0.04 },
  },
};

const itemVariants = {
  closed: {
    opacity: 0,
    y: 18,
    scale: 0.88,
    x: 6,
    transition: SPRING_SOFT,
  },
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    x: 0,
    transition: SPRING_SOFT,
  },
};

export default function FloatingActionButton() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { openAddTransaction } = useApp();

  const hiddenRoutes = ['/ai', '/login'];
  if (hiddenRoutes.some((r) => location.pathname.startsWith(r))) return null;

  const handleAction = (action) => {
    setOpen(false);
    if (action.future) return;
    if (action.href) {
      navigate(action.href);
      return;
    }
    openAddTransaction({
      mode: action.mode,
      source: action.id === 'transfer' ? 'Transfer' : undefined,
    });
  };

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[3px]"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      <div className="pointer-events-none fixed right-4 z-50 bottom-[calc(5.5rem+env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto flex flex-col items-end gap-2.5">
          <AnimatePresence mode="popLayout">
            {open ? (
              <motion.div
                key="fab-menu"
                variants={menuVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="flex flex-col items-end gap-2.5"
              >
                {ACTIONS.map((action) => (
                  <motion.button
                    key={action.id}
                    type="button"
                    variants={itemVariants}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleAction(action)}
                    disabled={action.future}
                    className={`flex w-[min(17.5rem,calc(100vw-3rem))] origin-bottom-right items-center gap-3 rounded-2xl border border-white/10 bg-portfolio-card/95 px-3.5 py-2.5 text-left shadow-card backdrop-blur-xl ${
                      action.future ? 'opacity-60' : 'hover:border-white/20 active:bg-portfolio-elevated/80'
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-portfolio-elevated text-white">
                      {action.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-white">{action.title}</span>
                      <span className="block truncate text-xs text-portfolio-gray">
                        {action.description}
                      </span>
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>

          <motion.button
            type="button"
            aria-label={open ? 'Close add menu' : 'Open add menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={`relative flex h-14 w-14 items-center justify-center rounded-full text-black transition-shadow duration-300 ${
              open
                ? 'bg-white shadow-[0_6px_24px_rgba(255,255,255,0.22)]'
                : 'bg-gradient-to-br from-white via-portfolio-light to-zinc-300 shadow-glow-fab'
            }`}
            whileTap={{ scale: 0.94 }}
            animate={{
              rotate: open ? 45 : 0,
              scale: open ? 0.96 : 1,
            }}
            transition={SPRING}
          >
            <motion.span
              animate={{ opacity: open ? 0.85 : 1 }}
              transition={{ duration: 0.15 }}
            >
              <MdiIcon path={mdiPlus} className="h-7 w-7" />
            </motion.span>
          </motion.button>
        </div>
      </div>
    </>
  );
}
