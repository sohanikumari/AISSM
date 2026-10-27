import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRoleStore } from '../../hooks/useRole';
import { Role } from '../../api/types';

interface RequireAuthProps {
  children: React.ReactNode;
  requiredRole?: Role;
}

/**
 * Auth guard — currently in DEMO MODE (ENFORCE_AUTH = false).
 * Set ENFORCE_AUTH = true to require login for all protected routes.
 *
 * When demo mode is on:
 *  - All routes are freely accessible without login
 *  - Login / logout / session persistence still work fully
 *  - Role-based access control for ADMIN routes is still applied
 */
const ENFORCE_AUTH = false; // ← flip to `true` to enforce login

export const RequireAuth: React.FC<RequireAuthProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, currentUser, activeRole } = useRoleStore();
  const location = useLocation();

  // In demo mode, skip the authentication check entirely
  if (!ENFORCE_AUTH) {
    // Still enforce role-specific pages even in demo mode (e.g. ADMIN-only)
    if (requiredRole && currentUser && !currentUser.roles.includes(requiredRole)) {
      const homeMap: Record<Role, string> = {
        DONOR: '/donor',
        RIDER: '/rider',
        HELPER: '/helper',
        NGO_OPERATOR: '/site/site_asha',
        ADMIN: '/admin/console',
      };
      return <Navigate to={homeMap[activeRole] || '/'} replace />;
    }
    return <>{children}</>;
  }

  // ── Full auth enforcement (when ENFORCE_AUTH = true) ──────────────────────
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !currentUser.roles.includes(requiredRole)) {
    const homeMap: Record<Role, string> = {
      DONOR: '/donor',
      RIDER: '/rider',
      HELPER: '/helper',
      NGO_OPERATOR: '/site/site_asha',
      ADMIN: '/admin/console',
    };
    return <Navigate to={homeMap[activeRole] || '/'} replace />;
  }

  return <>{children}</>;
};
