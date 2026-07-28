import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';

const RobotViewer = lazy(() => import('./RobotViewer'));

export default function AILandingHero({ onPrimaryAction }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-4 py-2">
      <div className="flex w-full max-w-md min-h-0 flex-col items-center">
        <motion.div
          className="mb-1 flex w-full shrink-0 justify-center"
          initial={{ opacity: 0, y: 12, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Suspense
            fallback={
              <div className="h-[min(34vh,13rem)] w-full max-w-[15rem] animate-pulse rounded-2xl bg-portfolio-elevated/40" />
            }
          >
            <RobotViewer />
          </Suspense>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 }}
          className="w-full shrink-0 px-2 text-center"
        >
          <h2 className="text-lg font-bold leading-snug text-white sm:text-xl">
            Hello! I&apos;m your Financial Assistant
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-portfolio-gray sm:text-sm">
            Ask me anything about your budget, spending, debts, or savings. I can analyze your
            transactions and help you plan ahead.
          </p>
        </motion.div>

        <motion.button
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12 }}
          onClick={() => onPrimaryAction('Analyze my spending')}
          className="mt-3 flex shrink-0 items-center gap-2 rounded-full border border-portfolio-border bg-portfolio-card/80 px-5 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:border-white/25 hover:bg-portfolio-elevated"
        >
          <i className="bi bi-bar-chart-line text-portfolio-gray" aria-hidden />
          Analyze my spending
        </motion.button>
      </div>
    </div>
  );
}
