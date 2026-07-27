import { NavLink, useLocation } from 'react-router-dom';

const iconClass = 'pointer-events-none h-5 w-5 shrink-0';

const tabs = [
  {
    to: '/',
    label: 'Home',
    end: true,
    icon: (active) => (
      <svg className={iconClass} viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          className={`transition-opacity duration-150 ${active ? 'opacity-100' : 'opacity-0'}`}
          d="M11.47 3.841a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.061l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 101.061 1.06l8.69-8.689z"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-opacity duration-150 ${active ? 'opacity-0' : 'opacity-100'}`}
          d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
        />
      </svg>
    ),
  },
  {
    to: '/calendar',
    label: 'Calendar',
    icon: (active) => (
      <svg className={iconClass} viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
          className={`transition-opacity duration-150 ${active ? 'opacity-100' : 'opacity-0'}`}
          d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-opacity duration-150 ${active ? 'opacity-0' : 'opacity-100'}`}
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
        />
      </svg>
    ),
  },
  {
    to: '/ai',
    label: 'AI',
    center: true,
    icon: () => (
      <svg className="pointer-events-none h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
        />
      </svg>
    ),
  },
  {
    to: '/history',
    label: 'History',
    icon: () => (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (active) => (
      <svg className={iconClass} viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
          className={`transition-opacity duration-150 ${active ? 'opacity-100' : 'opacity-0'}`}
          d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-opacity duration-150 ${active ? 'opacity-0' : 'opacity-100'}`}
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"
        />
      </svg>
    ),
  },
];

function NavItem({ tab }) {
  if (tab.center) {
    return (
      <NavLink
        to={tab.to}
        className="relative flex h-full flex-col items-center justify-end"
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
              <span className="relative">{tab.icon(active)}</span>
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
      className="relative flex h-full min-w-0 flex-col items-center justify-end"
    >
      {({ isActive: active }) => (
        <>
          <span
            aria-hidden
            className={`absolute top-0 h-0.5 w-8 rounded-full bg-white transition-opacity duration-150 ${
              active ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <span className={`flex h-5 w-5 shrink-0 items-center justify-center ${active ? 'text-white' : 'text-portfolio-gray'}`}>
            {tab.icon(active)}
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
      <div className="bottom-nav-tabs grid min-h-0 flex-1 grid-cols-5 items-end px-1 pt-2">
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
