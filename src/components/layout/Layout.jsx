import { NavLink, Outlet, useLocation } from 'react-router-dom';

function HomeIcon({ active }) {
  return (
    <svg className="h-6 w-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
      {active ? (
        <path d="M11.47 3.841a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.061l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 101.061 1.06l8.69-8.689z" />
      ) : null}
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function CalendarIcon({ active }) {
  return (
    <svg className="h-6 w-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
      {active ? (
        <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      )}
    </svg>
  );
}

function HistoryIcon({ active }) {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function ProfileIcon({ active }) {
  return (
    <svg className="h-6 w-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
      {active ? (
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
      )}
    </svg>
  );
}

function NavTab({ to, label, icon: Icon, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] font-medium transition-colors ${
          isActive ? 'text-white' : 'text-portfolio-gray'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon active={isActive} />
          {label}
        </>
      )}
    </NavLink>
  );
}

function CenterAddButton() {
  const location = useLocation();
  const isActive = location.pathname === '/add';

  return (
    <NavLink
      to="/add"
      className="flex flex-1 flex-col items-center"
      aria-label="Add transaction"
    >
      <span
        className={`-mt-6 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95 ${
          isActive
            ? 'bg-portfolio-light text-black ring-2 ring-white'
            : 'bg-white text-black hover:bg-portfolio-light'
        }`}
      >
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </span>
      <span className={`mt-1 text-[10px] font-medium ${isActive ? 'text-white' : 'text-portfolio-gray'}`}>
        Add
      </span>
    </NavLink>
  );
}

export default function Layout() {
  return (
    <div className="mx-auto min-h-screen max-w-lg bg-black">
      <main className="min-h-screen">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-lg border-t border-portfolio-border bg-portfolio-card shadow-nav safe-area-bottom">
        <div className="flex items-end justify-around px-1 pb-2 pt-1">
          <NavTab to="/" label="Home" icon={HomeIcon} end />
          <NavTab to="/calendar" label="Calendar" icon={CalendarIcon} />
          <CenterAddButton />
          <NavTab to="/history" label="History" icon={HistoryIcon} />
          <NavTab to="/profile" label="Profile" icon={ProfileIcon} />
        </div>
      </nav>
    </div>
  );
}
