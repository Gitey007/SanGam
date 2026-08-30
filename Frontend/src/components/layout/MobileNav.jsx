import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, Users, User } from 'lucide-react';

export const MobileNav = () => {
  const tabs = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/discover', label: 'Discover', icon: Compass },
    { to: '/teams', label: 'Teams', icon: Users },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xs border-t border-slate-200 safe-area-bottom">
      <div className="grid grid-cols-4 h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                  isActive
                    ? 'text-slate-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-700'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
