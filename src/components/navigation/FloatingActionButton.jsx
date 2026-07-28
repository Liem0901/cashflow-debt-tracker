import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';

const SPRING = { type: 'spring', stiffness: 400, damping: 30, mass: 0.85 };
const SPRING_SOFT = { type: 'spring', stiffness: 320, damping: 28, mass: 0.9 };

const ACTIONS = [
  {
    id: 'expense',
    title: 'Add Expense',
    description: 'Track cash or card spending',
    mode: 'cash',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.375M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'income',
    title: 'Add Income',
    description: 'Salary, transfer, side income',
    mode: 'income',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'transfer',
    title: 'Add Transfer',
    description: 'Record incoming transfer',
    mode: 'income',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
  {
    id: 'debt-payment',
    title: 'Record Debt Payment',
    description: 'Pay down an existing debt',
    href: '/debts?action=pay',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'scan',
    title: 'Scan Receipt',
    description: 'Fast scan and save records',
    future: true,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
      </svg>
    ),
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

      <div className="pointer-events-none fab-bottom fixed left-1/2 z-50 flex w-[min(32rem,calc(100vw-1.5rem))] -translate-x-1/2 justify-end px-2">
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
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </motion.span>
          </motion.button>
        </div>
      </div>
    </>
  );
}
