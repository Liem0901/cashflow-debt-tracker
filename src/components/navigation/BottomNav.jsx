import { NavLink, useLocation } from 'react-router-dom';

const tabs = [
  {
    to: '/',
    label: 'Home',
    end: true,
    icon: 'bi bi-house-door-fill',
  },
  {
    to: '/calendar',
    label: 'Calendar',
    icon: 'bi bi-calendar3',
  },
  {
    to: '/ai',
    label: 'AI',
    center: true,
    icon: 'bi bi-stars',
  },
  {
    to: '/history',
    label: 'History',
    icon: 'bi bi-list-ul',
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: 'bi bi-person-fill',
  },
];

function NavItem({ tab }) {
  if (tab.center) {
    return (
      <NavLink
        to={tab.to}
        className="relative flex h-full flex-col items-center justify-center"
        aria-label="AI Assistant"
      >
        {({ isActive: active }) => (
          <>
            <span
              className={`relative -mt-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-glow-ai ${
                active
                  ? 'bg-gradient-to-br from-violet-500 via-fuchsia-500 to-amber-400 text-white'
                  : 'bg-gradient-to-br from-violet-600/90 to-fuchsia-600/90 text-white'
              }`}
            >
              <span
                aria-hidden
                className={`absolute inset-0 rounded-full bg-gradient-to-br from-violet-400/40 to-fuchsia-400/40 blur-md transition-opacity duration-150 ${
                  active ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <i className={`${tab.icon} relative z-10 pointer-events-none text-xl text-white`} aria-hidden />
            </span>
            <span
              className={`mt-1 block h-3.5 w-full truncate text-center text-[10px] font-medium leading-3.5 ${
                active ? 'text-white' : 'text-portfolio-gray'
              }`}
            >
              {tab.label}
            </span>
          </>
        )}
      </NavLink>
    );
  }

  return (
    <NavLink
      to={tab.to}
      end={tab.end}
      className="flex h-full min-w-0 flex-col items-center justify-center"
    >
      {({ isActive: active }) => (
        <>
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center ${
              active ? 'text-white' : 'text-portfolio-gray'
            }`}
          >
            <i className={`${tab.icon} pointer-events-none text-lg`} aria-hidden />
          </span>
          <span
            className={`mt-1 block h-3.5 w-full truncate text-center text-[10px] font-medium leading-3.5 ${
              active ? 'text-white' : 'text-portfolio-gray'
            }`}
          >
            {tab.label}
          </span>
        </>
      )}
    </NavLink>
  );
}

export default function BottomNav() {
  const location = useLocation();
  const hideOnRoutes = ['/login'];
  if (hideOnRoutes.some((p) => location.pathname.startsWith(p))) return null;

  return (
    <nav
      className="bottom-nav glass-nav fixed bottom-3 left-1/2 z-40 flex w-[min(32rem,calc(100vw-1.5rem))] -translate-x-1/2 flex-col overflow-visible rounded-3xl border border-white/10 shadow-nav"
      aria-label="Main navigation"
    >
      <div className="bottom-nav-tabs grid min-h-0 flex-1 grid-cols-5 items-center px-1 py-2">
        {tabs.map((tab) => (
          <NavItem key={tab.to} tab={tab} />
        ))}
      </div>
      <div
        className="shrink-0"
        style={{ height: 'calc(env(safe-area-inset-bottom, 0px) + 0.5rem)' }}
        aria-hidden
      />
    </nav>
  );
}
