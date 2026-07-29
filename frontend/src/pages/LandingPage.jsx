import { lazy, Suspense, useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import AppFooter from '../components/profile/AppFooter';
import ErrorBoundary from '../components/ui/ErrorBoundary';

const RobotViewer = lazy(() => import('../components/ai/RobotViewer'));

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
    href: '/ai',
  },
  {
    icon: 'bi-calendar3',
    title: 'Visualize your spending',
    description: 'A daily heatmap and category breakdown show exactly where your money goes each month.',
  },
];

const featureCardClass =
  'group flex h-full flex-col rounded-2xl border border-portfolio-border bg-portfolio-card p-4 transition-all duration-300 hover:border-lime-400/40 hover:bg-gradient-to-br hover:from-emerald-500/10 hover:via-lime-500/5 hover:to-yellow-400/10 hover:shadow-[0_0_24px_rgba(132,204,22,0.15)] sm:p-5';

function FeatureCard({ feature }) {
  const content = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center sm:h-10 sm:w-10">
        <i className={`bi ${feature.icon} text-base text-white sm:text-lg`} aria-hidden="true" />
      </span>
      <h2 className="mt-2.5 text-base font-semibold leading-snug text-white transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-yellow-400 group-hover:bg-clip-text group-hover:text-transparent sm:mt-3 sm:min-h-12">
        {feature.title}
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-portfolio-gray transition-colors duration-300 group-hover:text-portfolio-light sm:mt-2">
        {feature.description}
      </p>
    </>
  );

  if (feature.href) {
    return (
      <Link to={feature.href} className={featureCardClass}>
        {content}
      </Link>
    );
  }

  return <div className={featureCardClass}>{content}</div>;
}

export default function LandingPage() {
  const featuresRef = useRef(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="landing-bg min-h-screen">
      <div className="landing-bg-content">
      <nav className="safe-area-top-header flex items-center justify-between px-4 pb-4 sm:px-6 sm:pb-5 lg:px-12 lg:pt-5">
        <div className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="" className="h-8 w-8 rounded-lg" aria-hidden />
          <span className="text-base font-bold text-white sm:text-lg">Cashflow Tracker</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-5">
          <Link to="/login" className="text-sm font-bold text-white hover:text-portfolio-gray">
            Login
          </Link>
          <Link to="/login">
            <Button variant="primary" size="sm" className="!rounded-none font-bold">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      <header className="relative flex min-h-[calc(100vh-4rem)] flex-col justify-center px-4 animate-fade-in sm:min-h-[calc(100vh-4.75rem)] sm:px-6 lg:px-12">
        <div className="lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white lg:text-6xl">
              Know exactly what you can safely spend
            </h1>
            <p className="mt-4 max-w-lg text-sm text-portfolio-gray sm:mt-5 sm:text-base lg:text-lg">
              Cashflow Tracker brings your salary, expenses, debts, and savings into one clear
              dashboard — so you always know what's safe to spend.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:items-stretch sm:gap-3">
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="glassPrimary" className="h-12 w-full !rounded-none font-bold">
                  Get Started
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="glass" className="h-12 w-full !rounded-none font-bold">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          <ErrorBoundary fallback={<div className="hidden shrink-0 lg:block lg:h-[26rem] lg:max-w-md" />}>
            <Suspense fallback={<div className="hidden shrink-0 lg:block lg:h-[26rem] lg:max-w-md" />}>
              <RobotViewer className="hidden shrink-0 lg:block lg:h-[26rem] lg:max-w-md" />
            </Suspense>
          </ErrorBoundary>
        </div>

        <button
          type="button"
          onClick={scrollToFeatures}
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-portfolio-gray transition-colors hover:text-white"
          aria-label="Scroll to explore features"
        >
          <span className="text-[10px] uppercase tracking-wide">Scroll to explore</span>
          <i className="bi bi-chevron-down animate-bounce text-lg" aria-hidden="true" />
        </button>
      </header>

      <div ref={featuresRef} className="mx-auto max-w-5xl scroll-mt-6 px-4 pb-8 sm:px-6 sm:pb-10 lg:px-12">
        <section className="grid gap-3 pb-8 sm:grid-cols-2 sm:gap-4 sm:pb-12 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </section>

        <AppFooter />
      </div>
      </div>
    </div>
  );
}
