import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useRoleStore } from '../hooks/useRole';
import { HeartHandshake, User, ArrowRight } from 'lucide-react';
import { Role } from '../api/types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useRoleStore();
  const [email, setEmail] = useState('donor@sharma.org');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (targetEmail: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await api.login(targetEmail);
      setUser(user);
      if (user.activeRole === 'DONOR') navigate('/donor');
      else if (user.activeRole === 'RIDER') navigate('/rider');
      else if (user.activeRole === 'HELPER') navigate('/helper');
      else if (user.activeRole === 'NGO_OPERATOR') navigate('/site/site_asha');
      else navigate('/admin/console');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogins = [
    { label: 'Wedding Donor', email: 'donor@sharma.org', role: 'DONOR' },
    { label: 'Volunteer Rider', email: 'rider1@volunteer.org', role: 'RIDER' },
    { label: 'Shelter Coordinator', email: 'operator@asha.org', role: 'NGO_OPERATOR' },
    { label: 'System Admin', email: 'admin@lastmileaid.org', role: 'ADMIN' },
  ];

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-teal-700 flex items-center justify-center text-white mx-auto shadow-sm mb-3">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In to LastMile Aid</h1>
        <p className="text-xs text-slate-500 mt-1">Select an account or use quick demo chips below</p>
      </div>

      {/* Quick Login Chips for Evaluators/Demo */}
      <div className="bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl p-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 block mb-2">
          Demo Quick Sign-In (1-Click)
        </span>
        <div className="grid grid-cols-2 gap-2">
          {quickLogins.map((q) => (
            <button
              key={q.email}
              type="button"
              onClick={() => handleLogin(q.email)}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#161C23] border border-teal-300 dark:border-teal-700 text-left hover:bg-teal-100/50 transition text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <div className="font-bold">{q.label}</div>
              <div className="text-[10px] text-slate-400 font-normal truncate">{q.email}</div>
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin(email);
        }}
        className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Registered Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Password
          </label>
          <input
            type="password"
            defaultValue="password123"
            className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {error && <div className="p-2.5 text-xs text-rose-700 bg-rose-50 rounded border border-rose-200">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-sm font-semibold shadow-xs transition"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};
