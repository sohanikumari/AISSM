import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useRoleStore } from '../hooks/useRole';
import { HeartHandshake } from 'lucide-react';
import { Role } from '../api/types';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useRoleStore();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('RIDER');
  const [helperOptIn, setHelperOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await api.register({
        displayName,
        email,
        role,
        helperOptIn,
      });
      setUser(user);
      if (role === 'DONOR') navigate('/donor');
      else if (role === 'RIDER') navigate('/rider');
      else if (role === 'NGO_OPERATOR') navigate('/site/site_asha');
      else navigate('/tasks');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-teal-700 flex items-center justify-center text-white mx-auto shadow-sm mb-3">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Community Account</h1>
        <p className="text-xs text-slate-500 mt-1">Join as a food donor, delivery volunteer, or verified shelter</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Full Name or Organization
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-teal-500"
            placeholder="e.g. Green Leaf Cafe or Volunteer Name"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Email Address
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
            Primary Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-teal-500"
          >
            <option value="DONOR">Donor (Restaurant, Banquet, Grocery, Host)</option>
            <option value="RIDER">Volunteer Delivery Rider</option>
            <option value="HELPER">Emergency Public Helper</option>
            <option value="NGO_OPERATOR">Shelter / Food Bank Coordinator</option>
          </select>
        </div>

        <label className="flex items-start gap-2 pt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={helperOptIn}
            onChange={(e) => setHelperOptIn(e.target.checked)}
            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 mt-0.5"
          />
          <span className="text-xs text-slate-600 dark:text-slate-300">
            Opt in to receive urgent nearby emergency helper alerts when volunteer riders are short.
          </span>
        </label>

        {error && <div className="p-2.5 text-xs text-rose-700 bg-rose-50 rounded border border-rose-200">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-sm font-semibold shadow-xs transition"
        >
          {loading ? 'Registering...' : 'Complete Sign Up'}
        </button>

        <div className="text-center pt-2">
          <Link to="/login" className="text-xs text-teal-700 hover:underline">
            Already have an account? Sign in
          </Link>
        </div>
      </form>
    </div>
  );
};
