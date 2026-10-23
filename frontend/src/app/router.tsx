import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';

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

export const router = createBrowserRouter([
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
  {
    path: '/donor',
    element: <AppShell><DonorDashboard /></AppShell>,
  },
  {
    path: '/donations/new',
    element: <AppShell><CreateDonationPage /></AppShell>,
  },
  {
    path: '/donations/:id',
    element: <AppShell><DonationDetailPage /></AppShell>,
  },
  {
    path: '/rider',
    element: <AppShell><RiderDashboard /></AppShell>,
  },
  {
    path: '/tasks',
    element: <AppShell><AvailableTasksPage /></AppShell>,
  },
  {
    path: '/tasks/:id',
    element: <AppShell><TaskDetailPage /></AppShell>,
  },
  {
    path: '/map',
    element: <AppShell><LiveMapPage /></AppShell>,
  },
  {
    path: '/ngos',
    element: <AppShell><NgoDirectoryPage /></AppShell>,
  },
  {
    path: '/site/:id',
    element: <AppShell><ShelterOperationsPage /></AppShell>,
  },
  {
    path: '/open-gate',
    element: <AppShell><OpenGatePage /></AppShell>,
  },
  {
    path: '/helper',
    element: <AppShell><EmergencyHelperPage /></AppShell>,
  },
  {
    path: '/credits',
    element: <AppShell><CreditsLeaderboardPage /></AppShell>,
  },
  {
    path: '/notifications',
    element: <AppShell><NotificationsPage /></AppShell>,
  },
  {
    path: '/admin/console',
    element: <AppShell><AdminConsolePage /></AppShell>,
  },
  {
    path: '/admin/audit',
    element: <AppShell><AdminAuditPage /></AppShell>,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
