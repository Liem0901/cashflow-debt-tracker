import { motion } from 'framer-motion';
import robotAi from '../icons/robot_ai.png';

export default function AILandingHero({ onPrimaryAction }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-4 py-4">
      <div className="flex w-full max-w-md flex-col items-center">
        <motion.img
          src={robotAi}
          alt="Financial assistant robot"
          className="w-full max-w-[20rem] object-contain"
          initial={{ opacity: 0, y: 16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        />

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="-mt-10 w-full px-2 text-center"
        >
          <h2 className="text-xl font-bold leading-snug text-white">
            Hello! I&apos;m your Financial Assistant
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-portfolio-gray">
            Ask me anything about your budget, spending, debts, or savings. I can analyze your
            transactions and help you plan ahead.
          </p>
        </motion.div>

        <motion.button
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.16 }}
          onClick={() => onPrimaryAction('Analyze my spending')}
          className="mt-5 flex items-center gap-2 rounded-full border border-portfolio-border bg-portfolio-card/80 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:border-white/25 hover:bg-portfolio-elevated"
        >
          <svg className="h-4 w-4 text-portfolio-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
            />
          </svg>
          Analyze my spending
        </motion.button>
      </div>
    </div>
  );
}
