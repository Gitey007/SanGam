import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Compass,
  Users,
  User,
  LayoutDashboard,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/discover', label: 'Discover', icon: Compass },
    { to: '/teams', label: 'Teams', icon: Users },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Brand */}
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
            SG
          </div>
          <span className="font-semibold text-sm text-slate-900">SanGam</span>
        </NavLink>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-2">
          {user && (
            <NavLink to="/profile">
              <Avatar name={user.name} size="xs" />
            </NavLink>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 space-y-1 animate-in fade-in slide-in-from-top-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-2 mt-2 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
