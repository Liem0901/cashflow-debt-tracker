import { NavLink } from 'react-router-dom';
import AppLogo from './AppLogo';
import SyncBadge from './SyncBadge';
import { NAV_TABS } from '../../constants/navTabs';

function SidebarLink({ to, label, icon, end, center }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? center
              ? 'border-transparent bg-gradient-to-br from-violet-500/80 via-fuchsia-500/80 to-amber-400/80 text-white'
              : 'border-white/10 bg-white/10 text-white backdrop-blur-sm'
            : 'border-transparent text-portfolio-gray hover:bg-white/5 hover:text-white'
        }`
      }
    >
      <i className={`${icon} text-base`} aria-hidden />
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden shrink-0 border-r border-white/10 bg-portfolio-card/60 backdrop-blur-2xl lg:flex lg:w-64 lg:flex-col">
      <div className="p-4">
        <AppLogo />
        <SyncBadge />
      </div>
      <nav className="flex flex-col gap-1 px-3" aria-label="Main navigation">
        {NAV_TABS.map((tab) => (
          <SidebarLink key={tab.to} {...tab} />
        ))}
      </nav>
    </aside>
  );
}
