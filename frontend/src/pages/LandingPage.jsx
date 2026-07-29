import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import AppFooter from '../components/profile/AppFooter';
import RobotViewer from '../components/ai/RobotViewer';

const FEATURES = [
  {
    icon: 'bi-speedometer2',
    title: 'Know your safe-to-spend balance',
    description:
      'See exactly what you can spend after salary, expenses, and upcoming debt — updated in real time.',
  },
  {
    icon: 'bi-wallet2',
    title: 'Track debts & pay-later',
    description: 'Log loans and pay-later purchases, track remaining balances, and never miss a due date.',
  },
  {
    icon: 'bi-stars',
    title: 'Ask Auvia, your AI assistant',
    description: 'Get plain-language answers about your spending, budgets, and savings goals.',
  },
  {
    icon: 'bi-calendar3',
    title: 'Visualize your spending',
    description: 'A daily heatmap and category breakdown show exactly where your money goes each month.',
  },
];

export default function LandingPage() {
  return (
    <div className="bg-black">
      <nav className="flex items-center justify-between px-6 py-5 lg:px-12">
        <div className="flex items-center gap-2.5">
          <img src="/icons/icon.svg" alt="" className="h-8 w-8 rounded-lg" aria-hidden />
          <span className="text-lg font-bold text-white">Cashflow Tracker</span>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/login" className="text-sm font-medium text-white hover:text-portfolio-gray">
            Login
          </Link>
          <Link to="/login">
            <Button variant="outline" size="sm" className="!rounded-none">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      <header className="relative flex min-h-[calc(100vh-4.75rem)] flex-col justify-center px-6 animate-fade-in lg:px-12">
        <div className="lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-white lg:text-6xl">
              Know exactly what you can safely spend
            </h1>
            <p className="mt-5 max-w-lg text-base text-portfolio-gray lg:text-lg">
              Cashflow Tracker brings your salary, expenses, debts, and savings into one clear
              dashboard — so you always know what's safe to spend.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full !rounded-none">
                  Get Started
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full !rounded-none">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          <RobotViewer className="hidden shrink-0 lg:block lg:h-[26rem] lg:max-w-md" />
        </div>

        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-portfolio-gray">
          <span className="text-[10px] uppercase tracking-wide">Scroll to explore</span>
          <i className="bi bi-chevron-down animate-bounce text-lg" aria-hidden="true" />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 pb-10 lg:px-12">
        <section className="grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-portfolio-border bg-portfolio-card p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-portfolio-elevated">
                <i className={`bi ${feature.icon} text-lg text-white`} aria-hidden="true" />
              </span>
              <h2 className="mt-3 font-semibold text-white">{feature.title}</h2>
              <p className="mt-1 text-sm text-portfolio-gray">{feature.description}</p>
            </div>
          ))}
        </section>

        <AppFooter />
      </div>
    </div>
  );
}
