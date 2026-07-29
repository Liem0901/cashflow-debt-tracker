import { NavLink, useLocation } from 'react-router-dom';
import { AI_BRAND_NAME } from '../../constants/aiBrand';
import { NAV_TABS } from '../../constants/navTabs';

function NavItem({ tab }) {
  if (tab.center) {
    return (
      <NavLink
        to={tab.to}
        className={({ isActive }) =>
          `group relative flex h-full flex-col items-center justify-center transition-transform duration-300 ${
            isActive ? 'scale-105' : 'hover:scale-105'
          }`
        }
        aria-label={AI_BRAND_NAME}
      >
        {({ isActive }) => (
          <>
            <span
              className={`relative -mt-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-lime-500 to-yellow-400 text-white transition-all duration-300 ${
                isActive ? 'ring-2 ring-lime-300/40' : 'group-hover:ring-2 group-hover:ring-lime-300/30'
              }`}
            >
              <i
                className={`${tab.icon} relative z-10 pointer-events-none text-xl text-white`}
                aria-hidden
              />
            </span>
            <span
              className={`mt-1 block h-3.5 w-full truncate text-center text-[10px] font-medium leading-3.5 transition-colors ${
                isActive ? 'text-white' : 'text-portfolio-gray group-hover:text-white'
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
      className="group flex h-full min-w-0 flex-col items-center justify-center"
    >
      {({ isActive: active }) => (
        <>
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center transition-colors ${
              active ? 'text-white' : 'text-portfolio-gray group-hover:text-white'
            }`}
          >
            <i className={`${tab.icon} pointer-events-none text-lg`} aria-hidden />
          </span>
          <span
            className={`mt-1 block h-3.5 w-full truncate text-center text-[10px] font-medium leading-3.5 transition-colors ${
              active ? 'text-white' : 'text-portfolio-gray group-hover:text-white'
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
  const hideOnRoutes = ['/login', '/landing-page'];
  if (hideOnRoutes.some((p) => location.pathname.startsWith(p))) return null;
  if (location.pathname === '/') return null;

  return (
    <nav
      className="bottom-nav safe-area-bottom fixed bottom-0 left-1/2 z-40 flex w-full max-w-lg -translate-x-1/2 flex-col overflow-visible border-t border-white/10 bg-portfolio-card/75 backdrop-blur-2xl lg:hidden"
      aria-label="Main navigation"
    >
      <div className="bottom-nav-tabs grid h-[4.5rem] grid-cols-5 items-center px-1 py-2">
        {NAV_TABS.map((tab) => (
          <NavItem key={tab.to} tab={tab} />
        ))}
      </div>
    </nav>
  );
}
