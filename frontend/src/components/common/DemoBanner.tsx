import React from 'react';
import { Sparkles, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DemoBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white text-xs px-4 py-1.5 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-teal-300" />
        <span className="font-semibold tracking-wide uppercase text-[10px] bg-teal-700/80 px-1.5 py-0.5 rounded text-teal-200">
          Demo Environment
        </span>
        <span className="hidden sm:inline text-teal-100">
          Seeded with PRD baseline scenarios (180-meal donation, FEFO dispatch, shelter rerouting, idempotent credits).
        </span>
      </div>
      <Link
        to="/admin/console"
        className="flex items-center gap-1 font-semibold text-teal-200 hover:text-white underline text-xs"
      >
        <Terminal className="w-3.5 h-3.5" />
        Admin Simulation Console
      </Link>
    </div>
  );
};
