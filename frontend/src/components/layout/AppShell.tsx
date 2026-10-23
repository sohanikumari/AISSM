import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HeartHandshake,
  LayoutDashboard,
  PlusCircle,
  Truck,
  Building2,
  MapPin,
  Award,
  Bell,
  Terminal,
  FileText,
  UserCheck,
  DoorOpen,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useRoleStore } from '../../hooks/useRole';
import { ConnectionIndicator } from '../common/ConnectionIndicator';
import { DemoBanner } from '../common/DemoBanner';
import { Role } from '../../api/types';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, activeRole, setActiveRole } = useRoleStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roleNavItems: Record<Role, { label: string; href: string; icon: any }[]> = {
    DONOR: [
      { label: 'Donor Dashboard', href: '/donor', icon: LayoutDashboard },
      { label: 'Post Donation', href: '/donations/new', icon: PlusCircle },
      { label: 'Open Gate (Walk-in)', href: '/open-gate', icon: DoorOpen },
      { label: 'Shelter Directory', href: '/ngos', icon: Building2 },
      { label: 'Credits & Impact', href: '/credits', icon: Award },
    ],
    RIDER: [
      { label: 'My Dashboard', href: '/rider', icon: LayoutDashboard },
      { label: 'Available Tasks', href: '/tasks', icon: Truck },
      { label: 'Live Map', href: '/map', icon: MapPin },
      { label: 'Credits & Leaderboard', href: '/credits', icon: Award },
    ],
    HELPER: [
      { label: 'Emergency Alerts', href: '/helper', icon: UserCheck },
      { label: 'Available Tasks', href: '/tasks', icon: Truck },
      { label: 'Live Map', href: '/map', icon: MapPin },
      { label: 'Credits & Leaderboard', href: '/credits', icon: Award },
    ],
    NGO_OPERATOR: [
      { label: 'Shelter Operations', href: '/site/site_asha', icon: Building2 },
      { label: 'Shelter Directory', href: '/ngos', icon: Building2 },
      { label: 'Live Map', href: '/map', icon: MapPin },
      { label: 'Credits', href: '/credits', icon: Award },
    ],
    ADMIN: [
      { label: 'Simulation Console', href: '/admin/console', icon: Terminal },
      { label: 'Audit Trail', href: '/admin/audit', icon: FileText },
      { label: 'Available Tasks', href: '/tasks', icon: Truck },
      { label: 'Shelter Operations', href: '/site/site_asha', icon: Building2 },
      { label: 'Live Map', href: '/map', icon: MapPin },
    ],
  };

  const navItems = roleNavItems[activeRole] || roleNavItems.DONOR;

  const handleRoleChange = (role: Role) => {
    setActiveRole(role);
    if (role === 'DONOR') navigate('/donor');
    else if (role === 'RIDER') navigate('/rider');
    else if (role === 'HELPER') navigate('/helper');
    else if (role === 'NGO_OPERATOR') navigate('/site/site_asha');
    else if (role === 'ADMIN') navigate('/admin/console');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0F1419] text-[#14202B] dark:text-[#E8EDF2]">
      <DemoBanner />

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#161C23] border-b border-slate-200 dark:border-slate-800 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-sm">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight text-teal-900 dark:text-teal-400">
                LastMile<span className="text-teal-600">Aid</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ConnectionIndicator status="live" />

            {/* Role Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-500 hidden sm:inline px-1 font-medium">Role:</span>
              {(['DONOR', 'RIDER', 'HELPER', 'NGO_OPERATOR', 'ADMIN'] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={`px-2 py-1 rounded font-medium transition ${
                    activeRole === r
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {r === 'NGO_OPERATOR' ? 'SHELTER' : r}
                </button>
              ))}
            </div>

            <Link
              to="/notifications"
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal-600" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 p-4 border-r border-slate-200 dark:border-slate-800 shrink-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-3">
            {activeRole} Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    active
                      ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-teal-700 dark:text-teal-400' : 'text-slate-500'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <hr className="my-4 border-slate-200 dark:border-slate-800" />

          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-3">
            Quick Views
          </div>
          <div className="space-y-1 text-xs">
            <Link to="/map" className="flex items-center gap-2 px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <MapPin className="w-3.5 h-3.5" /> Full Live Map
            </Link>
            <Link to="/admin/console" className="flex items-center gap-2 px-3 py-1.5 text-teal-700 dark:text-teal-400 font-medium hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-lg">
              <Terminal className="w-3.5 h-3.5" /> Simulation Console
            </Link>
          </div>
        </aside>

        {/* Main Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-64 bg-white dark:bg-[#161C23] h-full p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <span className="font-bold text-base text-teal-800 dark:text-teal-300">Navigation</span>
              <button onClick={() => setMobileMenuOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Icon className="w-4 h-4 text-teal-600" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};
