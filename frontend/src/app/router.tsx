import React from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { RequireAuth } from '../components/auth/RequireAuth';

import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DonorDashboard } from '../pages/DonorDashboard';
import { CreateDonationPage } from '../pages/CreateDonationPage';
import { DonationDetailPage } from '../pages/DonationDetailPage';
import { RiderDashboard } from '../pages/RiderDashboard';
import { AvailableTasksPage } from '../pages/AvailableTasksPage';
import { TaskDetailPage } from '../pages/TaskDetailPage';
import { LiveMapPage } from '../pages/LiveMapPage';
import { NgoDirectoryPage } from '../pages/NgoDirectoryPage';
import { ShelterOperationsPage } from '../pages/ShelterOperationsPage';
import { OpenGatePage } from '../pages/OpenGatePage';
import { EmergencyHelperPage } from '../pages/EmergencyHelperPage';
import { CreditsLeaderboardPage } from '../pages/CreditsLeaderboardPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { AdminConsolePage } from '../pages/AdminConsolePage';
import { AdminAuditPage } from '../pages/AdminAuditPage';

/** Shorthand: wraps a page in AppShell + RequireAuth */
const Protected = ({ children }: { children: React.ReactNode }) => (
  <AppShell>
    <RequireAuth>{children}</RequireAuth>
  </AppShell>
);

export const router = createHashRouter([
  // ── Public routes (no login required) ─────────────────────────────────────
  {
    path: '/',
    element: <AppShell><LandingPage /></AppShell>,
  },
  {
    path: '/login',
    element: <AppShell><LoginPage /></AppShell>,
  },
  {
    path: '/register',
    element: <AppShell><RegisterPage /></AppShell>,
  },

  // ── Donor section ──────────────────────────────────────────────────────────
  {
    path: '/donor',
    element: <Protected><DonorDashboard /></Protected>,
  },
  {
    path: '/donations/new',
    element: <Protected><CreateDonationPage /></Protected>,
  },
  {
    path: '/donations/:id',
    element: <Protected><DonationDetailPage /></Protected>,
  },
  {
    path: '/open-gate',
    element: <Protected><OpenGatePage /></Protected>,
  },

  // ── Rider section ──────────────────────────────────────────────────────────
  {
    path: '/rider',
    element: <Protected><RiderDashboard /></Protected>,
  },
  {
    path: '/tasks',
    element: <Protected><AvailableTasksPage /></Protected>,
  },
  {
    path: '/tasks/:id',
    element: <Protected><TaskDetailPage /></Protected>,
  },

  // ── Helper section ─────────────────────────────────────────────────────────
  {
    path: '/helper',
    element: <Protected><EmergencyHelperPage /></Protected>,
  },

  // ── Shared authenticated routes ────────────────────────────────────────────
  {
    path: '/map',
    element: <Protected><LiveMapPage /></Protected>,
  },
  {
    path: '/ngos',
    element: <Protected><NgoDirectoryPage /></Protected>,
  },
  {
    path: '/site/:id',
    element: <Protected><ShelterOperationsPage /></Protected>,
  },
  {
    path: '/credits',
    element: <Protected><CreditsLeaderboardPage /></Protected>,
  },
  {
    path: '/notifications',
    element: <Protected><NotificationsPage /></Protected>,
  },

  // ── Admin section (ADMIN role required) ────────────────────────────────────
  {
    path: '/admin/console',
    element: (
      <AppShell>
        <RequireAuth requiredRole="ADMIN">
          <AdminConsolePage />
        </RequireAuth>
      </AppShell>
    ),
  },
  {
    path: '/admin/audit',
    element: (
      <AppShell>
        <RequireAuth requiredRole="ADMIN">
          <AdminAuditPage />
        </RequireAuth>
      </AppShell>
    ),
  },

  // ── Fallback ───────────────────────────────────────────────────────────────
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
