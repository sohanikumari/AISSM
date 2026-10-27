import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleStore } from '../hooks/useRole';
import { api } from '../api';
import {
  HeartHandshake,
  Truck,
  UserCheck,
  Building2,
  Terminal,
  ArrowRight,
} from 'lucide-react';
import { Role } from '../api/types';

const ROLES = [
  {
    role: 'DONOR' as Role,
    email: 'donor@sharma.org',
    label: 'Food Donor',
    emoji: '🥘',
    sublabel: 'Restaurant · Banquet · Grocery',
    description: 'Post surplus food, set expiry times, track deliveries end-to-end.',
    icon: HeartHandshake,
    gradient: 'from-teal-500 to-emerald-600',
    ring: 'ring-teal-300 dark:ring-teal-700',
    bg: 'bg-teal-50 dark:bg-teal-950/50',
    dest: '/donor',
  },
  {
    role: 'RIDER' as Role,
    email: 'rider1@volunteer.org',
    label: 'Delivery Rider',
    emoji: '🚴',
    sublabel: 'Volunteer · Community Courier',
    description: 'Claim delivery tasks, navigate live, earn volunteer impact credits.',
    icon: Truck,
    gradient: 'from-blue-500 to-indigo-600',
    ring: 'ring-blue-300 dark:ring-blue-700',
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    dest: '/rider',
  },
  {
    role: 'HELPER' as Role,
    email: 'helper1@community.org',
    label: 'Emergency Helper',
    emoji: '🤝',
    sublabel: 'Public Aid · Urgent Dispatch',
    description: 'Handle critical alerts when volunteer riders are unavailable.',
    icon: UserCheck,
    gradient: 'from-orange-500 to-red-500',
    ring: 'ring-orange-300 dark:ring-orange-700',
    bg: 'bg-orange-50 dark:bg-orange-950/50',
    dest: '/helper',
  },
  {
    role: 'NGO_OPERATOR' as Role,
    email: 'operator@asha.org',
    label: 'Shelter Coordinator',
    emoji: '🏠',
    sublabel: 'Food Bank · Care Home · NGO',
    description: 'Manage site capacity, receive food, verify deliveries.',
    icon: Building2,
    gradient: 'from-purple-500 to-violet-600',
    ring: 'ring-purple-300 dark:ring-purple-700',
    bg: 'bg-purple-50 dark:bg-purple-950/50',
    dest: '/site/site_asha',
  },
  {
    role: 'ADMIN' as Role,
    email: 'admin@lastmileaid.org',
    label: 'Platform Admin',
    emoji: '⚙️',
    sublabel: 'System · Simulation · Audit',
    description: 'Run scenario simulations, inspect audit trail, manage platform.',
    icon: Terminal,
    gradient: 'from-slate-500 to-slate-700',
    ring: 'ring-slate-300 dark:ring-slate-600',
    bg: 'bg-slate-50 dark:bg-slate-800/50',
    dest: '/admin/console',
  },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useRoleStore();
  const [loading, setLoading] = React.useState<string | null>(null);

  const enter = async (r: typeof ROLES[0]) => {
    setLoading(r.role);
    try {
      const user = await api.login(r.email);
      setUser(user);
      navigate(r.dest, { replace: true });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center text-white mx-auto shadow-lg mb-2">
          <HeartHandshake className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Welcome to <span className="text-teal-700 dark:text-teal-400">LastMile Aid</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Smart surplus food & emergency-aid coordination. <br className="hidden sm:block" />
          Pick your role to enter the live demo — no login required.
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold">
          🎯 DEMO MODE — All roles are freely accessible
        </div>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ROLES.map((r) => {
          const Icon = r.icon;
          const isLoading = loading === r.role;
          return (
            <button
              key={r.role}
              onClick={() => enter(r)}
              disabled={!!loading}
              className={`
                group relative flex flex-col text-left p-5 rounded-2xl border-2 transition-all duration-200
                ${r.bg} ${r.ring}
                hover:shadow-xl hover:-translate-y-1 hover:ring-2
                disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
              `}
            >
              {/* Icon + gradient badge */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${r.gradient} flex items-center justify-center text-white shadow-md mb-4 text-2xl`}>
                {r.emoji}
              </div>

              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{r.label}</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{r.sublabel}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{r.description}</p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">{r.email.split('@')[0]}</span>
                <span className={`flex items-center gap-1 text-xs font-semibold bg-gradient-to-r ${r.gradient} bg-clip-text text-transparent group-hover:gap-2 transition-all`}>
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70" />
                  ) : (
                    <>Enter <ArrowRight className="w-3.5 h-3.5" /></>
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-400">
        Full authentication can be enforced in production by setting{' '}
        <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">ENFORCE_AUTH = true</code>{' '}
        in <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">RequireAuth.tsx</code>
      </p>
    </div>
  );
};
