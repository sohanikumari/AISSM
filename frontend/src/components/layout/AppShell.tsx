import React, { useState, useCallback } from 'react';
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
  LogOut,
  User,
} from 'lucide-react';
import { useRoleStore } from '../../hooks/useRole';
import { ConnectionIndicator } from '../common/ConnectionIndicator';
import { DemoBanner } from '../common/DemoBanner';
import { Role } from '../../api/types';
import { useRealtimeEvent } from '../../hooks/useRealtimeEvent';
import { useExpiryWatcher } from '../../hooks/useExpiryWatcher';
import { ExpiryAlertBar } from '../common/ExpiryAlertBar';

/** Toast item type */
interface ToastItem {
  id: string;
  title: string;
  body: string;
  urgent?: boolean;
}

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, activeRole, setActiveRole, logout, isAuthenticated } = useRoleStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  const showToast = useCallback((title: string, body: string, urgent = false) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
    setToasts((prev) => [...prev, { id, title, body, urgent }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, urgent ? 10000 : 6000);
  }, []);

  const dismissToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Mount global expiry watcher (runs every 30s in background)
  useExpiryWatcher();

  // Listen for new delivery tasks
  const handleTaskAvailable = useCallback(
    (data: any) => {
      setUnreadCount((c) => c + 1);
      showToast(
        data.title || `🚚 New delivery task available`,
        data.body || `${data.quantity} ${data.unit} → ${data.siteName}. Claim it now!`,
      );
    },
    [showToast],
  );

  // Listen for new donations (shown to rider/helper as info)
  const handleDonationCreated = useCallback(
    (data: any) => {
      if (activeRole === 'RIDER' || activeRole === 'HELPER') {
        showToast(
          `📦 New donation posted`,
          `${data.donorName} shared ${data.quantity} ${data.unit} of ${data.category?.replace(/_/g, ' ')}`,
        );
      }
    },
    [showToast, activeRole],
  );

  // Expiry alerts — task
  const handleTaskExpiring = useCallback(
    (data: any) => {
      const mins = Math.ceil(data.secondsLeft / 60);
      const isCrit = data.level === 'CRITICAL';
      setUnreadCount((c) => c + 1);
      showToast(
        isCrit
          ? `🔴 CRITICAL — task expires in ${mins}m!`
          : `⚠️ Task expiring in ${mins}m`,
        `${data.quantity} ${data.unit} → ${data.siteName} · ${data.category.replace(/_/g, ' ')}`,
        isCrit,
      );
    },
    [showToast],
  );

  // Expiry alerts — donation
  const handleDonationExpiring = useCallback(
    (data: any) => {
      const mins = Math.ceil(data.secondsLeft / 60);
      const isCrit = data.level === 'CRITICAL';
      setUnreadCount((c) => c + 1);
      showToast(
        isCrit
          ? `🔴 CRITICAL — donation expires in ${mins}m!`
          : `⚠️ Donation expiring in ${mins}m`,
        `${data.quantity} ${data.unit} of ${data.category.replace(/_/g, ' ')} from ${data.donorName}`,
        isCrit,
      );
    },
    [showToast],
  );

  useRealtimeEvent('task.available', handleTaskAvailable);
  useRealtimeEvent('donation.created', handleDonationCreated);
  useRealtimeEvent('task.expiring_soon', handleTaskExpiring);
  useRealtimeEvent('donation.expiring_soon', handleDonationExpiring);

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
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#161C23]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 px-4 py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center text-white shadow-sm shadow-teal-700/20 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-teal-950 dark:text-teal-300">
                LastMile<span className="text-teal-600 dark:text-teal-400">Aid</span>
              </span>
            </Link>

            <Link
              to="/ngos"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 border border-teal-200/80 dark:border-teal-800/80 hover:bg-teal-100 transition"
            >
              <Building2 className="w-3.5 h-3.5 text-teal-600" /> Shelter Aid Hub
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ConnectionIndicator status="live" />

            {/* Role Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
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

            {/* Notification Bell */}
            <Link
              to="/notifications"
              onClick={() => setUnreadCount(0)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative"
              title="Notifications"
            >
              <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-teal-600 dark:text-teal-400' : ''}`} />
              {unreadCount > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 shadow animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal-600" />
              )}
            </Link>

            {/* User Avatar / Logout Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title={currentUser?.displayName || 'Account'}
              >
                <div className="w-7 h-7 rounded-full bg-teal-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {currentUser?.displayName?.[0]?.toUpperCase() || '?'}
                </div>
                <span className="hidden md:inline text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
                  {currentUser?.displayName || 'Guest'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden md:block" />
              </button>

              {userMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#1C2430] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{currentUser?.displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-300">
                        {activeRole}
                      </span>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/notifications"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <Bell className="w-3.5 h-3.5" /> Notifications
                      </Link>
                      <Link
                        to="/credits"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <Award className="w-3.5 h-3.5" /> My Credits
                      </Link>
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-800 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
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
          <ExpiryAlertBar />
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

      {/* Toast Notification Stack */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="flex items-start gap-3 bg-white dark:bg-[#1C2430] border border-teal-200 dark:border-teal-800 rounded-xl shadow-xl px-4 py-3 animate-[slideIn_0.25s_ease-out]"
            >
              <div className="mt-0.5 w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-teal-700 dark:text-teal-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">{toast.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">{toast.body}</p>
                <Link
                  to="/tasks"
                  onClick={() => dismissToast(toast.id)}
                  className="text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline mt-1 inline-block"
                >
                  View tasks →
                </Link>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
