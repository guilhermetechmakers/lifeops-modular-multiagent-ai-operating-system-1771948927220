import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/main-layout'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

// Public pages
import { LandingPage } from '@/pages/landing'
import { LoginPage } from '@/pages/auth/login'
import { SignupPage } from '@/pages/auth/signup'
import { PasswordResetPage } from '@/pages/auth/password-reset'
import { EmailVerificationPage } from '@/pages/auth/email-verification'
import { TermsPage } from '@/pages/legal/terms'
import { PrivacyPage } from '@/pages/legal/privacy'

// Dashboard pages
import { MasterDashboard } from '@/pages/dashboard/master'
import { ProjectsDashboard } from '@/pages/dashboard/projects'
import { ContentDashboard } from '@/pages/dashboard/content'
import { FinanceDashboard } from '@/pages/dashboard/finance'
import { HealthDashboard } from '@/pages/dashboard/health'
import { CronjobsDashboard } from '@/pages/dashboard/cronjobs'
import { CronjobDetailPage } from '@/pages/dashboard/cronjob-detail'
import { ApprovalsQueuePage } from '@/pages/dashboard/approvals'
import { ApprovalDetailPage } from '@/pages/dashboard/approval-detail'
import { RunHistoryPage } from '@/pages/dashboard/run-history'
import { RunDetailPage } from '@/pages/dashboard/run-detail'
import { AgentConsolePage } from '@/pages/dashboard/agent-console'
import { WorkflowEditorPage } from '@/pages/dashboard/workflow-editor'
import { SettingsPage } from '@/pages/dashboard/settings'
import { BillingPage } from '@/pages/dashboard/billing'
import { OnboardingPage } from '@/pages/onboarding'

// Error pages
import { NotFoundPage } from '@/pages/errors/not-found'
import { ServerErrorPage } from '@/pages/errors/server-error'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'password-reset', element: <PasswordResetPage /> },
      { path: 'verify-email', element: <EmailVerificationPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'onboarding', element: <OnboardingPage /> },
    ],
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard/overview" replace /> },
      { path: 'overview', element: <MasterDashboard /> },
      { path: 'master', element: <MasterDashboard /> },
      { path: 'projects', element: <ProjectsDashboard /> },
      { path: 'content', element: <ContentDashboard /> },
      { path: 'finance', element: <FinanceDashboard /> },
      { path: 'health', element: <HealthDashboard /> },
      { path: 'cronjobs', element: <CronjobsDashboard /> },
      { path: 'cronjobs/:id', element: <CronjobDetailPage /> },
      { path: 'approvals', element: <ApprovalsQueuePage /> },
      { path: 'approvals/:id', element: <ApprovalDetailPage /> },
      { path: 'runs', element: <RunHistoryPage /> },
      { path: 'runs/:id', element: <RunDetailPage /> },
      { path: 'agents', element: <AgentConsolePage /> },
      { path: 'workflows', element: <WorkflowEditorPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'billing', element: <BillingPage /> },
    ],
  },
  { path: '/404', element: <NotFoundPage /> },
  { path: '/500', element: <ServerErrorPage /> },
  { path: '*', element: <NotFoundPage /> },
])
