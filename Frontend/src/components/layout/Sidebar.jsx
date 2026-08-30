import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Compass,
  Users,
  User,
  LayoutDashboard,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import { formatCollege } from '../../utils/helpers';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/discover', label: 'Discover', icon: Compass },
    { to: '/teams', label: 'Teams', icon: Users },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-slate-200 bg-white h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
        <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-subtle group-hover:bg-slate-800 transition-colors">
            <span className="font-bold text-sm tracking-wider">SG</span>
          </div>
          <div>
            <span className="font-semibold text-sm text-slate-900 tracking-tight block">SanGam</span>
            <span className="text-[10px] text-slate-400 font-medium block leading-none">Student Workspace</span>
          </div>
        </NavLink>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
        <div className="px-2 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Section: Profile & Settings */}
      <div className="p-3 border-t border-slate-100 space-y-1 bg-slate-50/50">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
              isActive
                ? 'bg-slate-200/60 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`
          }
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>Settings</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50/70 transition-all duration-150 text-left"
        >
          <LogOut className="w-4 h-4 shrink-0 text-slate-400 hover:text-rose-600" />
          <span>Sign Out</span>
        </button>

        {/* User Card Pill */}
        {user && (
          <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center gap-2.5 px-2">
            <Avatar name={user.name} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-slate-900 truncate">
                {user.name}
              </div>
              <div className="text-[11px] text-slate-500 truncate" title={user.college}>
                {user.college || 'Student'}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
