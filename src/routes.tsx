import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/main-layout'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProjectsLayout } from '@/components/layout/projects-layout'
import { ContentLayout } from '@/components/layout/content-layout'

// Public pages
import { LandingPage } from '@/pages/landing'
import { LoginPage } from '@/pages/auth/login'
import { SignupPage } from '@/pages/auth/signup'
import { PasswordResetPage } from '@/pages/auth/password-reset'
import { PasswordResetCompletePage } from '@/pages/auth/password-reset-complete'
import { EmailVerificationPage } from '@/pages/auth/email-verification'
import { TermsPage } from '@/pages/legal/terms'
import { PrivacyPage } from '@/pages/legal/privacy'
import { HelpDocumentationPage } from '@/pages/help'
import { PricingPage } from '@/pages/pricing'

// Dashboard pages
import { MasterDashboard } from '@/pages/dashboard/master'
import { ProjectsDashboard } from '@/pages/dashboard/projects'
import { ProjectDetailPage } from '@/pages/dashboard/project-detail'
import {
  ProjectsRoadmapsPage,
  ProjectsTicketsPage,
  ProjectsPRsReleasesPage,
  ProjectsCITriggersPage,
  ProjectsTemplatesPage,
  ProjectsIntegrationsPage,
  ProjectsArtifactsPage,
} from '@/pages/dashboard/projects-section-pages'
import {
  ContentDashboardPage,
  ContentListLibraryPage,
  ContentMasterDashboardPage,
  ContentMemoryPage,
  ContentCreatePage,
  ContentEditPage,
} from '@/pages/dashboard/content'
import { FinanceLayout } from '@/components/layout/finance-layout'
import {
  FinanceDashboardPage,
  FinanceIntegrationsPage,
  TransactionsReconciliationPage,
} from '@/pages/dashboard/finance'
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
import { SetupWizardPage } from '@/pages/onboarding/setup-wizard'

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
      { path: 'password-reset/complete', element: <PasswordResetCompletePage /> },
      { path: 'verify-email', element: <EmailVerificationPage /> },
      { path: 'verify', element: <EmailVerificationPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'help', element: <HelpDocumentationPage /> },
      { path: 'help/:category', element: <HelpDocumentationPage /> },
      { path: 'help/:category/:doc', element: <HelpDocumentationPage /> },
      { path: 'pricing', element: <PricingPage /> },
      { path: 'onboarding', element: <Navigate to="/onboarding/setup-wizard" replace /> },
      { path: 'onboarding/setup-wizard', element: <SetupWizardPage /> },
    ],
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard/overview" replace /> },
      { path: 'overview', element: <MasterDashboard /> },
      { path: 'master', element: <MasterDashboard /> },
      {
        path: 'projects',
        element: <ProjectsLayout />,
        children: [
          { index: true, element: <ProjectsDashboard /> },
          { path: 'roadmaps', element: <ProjectsRoadmapsPage /> },
          { path: 'tickets', element: <ProjectsTicketsPage /> },
          { path: 'prs-releases', element: <ProjectsPRsReleasesPage /> },
          { path: 'ci-triggers', element: <ProjectsCITriggersPage /> },
          { path: 'templates', element: <ProjectsTemplatesPage /> },
          { path: 'integrations', element: <ProjectsIntegrationsPage /> },
          { path: ':id', element: <ProjectDetailPage /> },
          { path: ':id/roadmaps', element: <ProjectsRoadmapsPage /> },
          { path: ':id/tickets', element: <ProjectsTicketsPage /> },
          { path: ':id/prs-releases', element: <ProjectsPRsReleasesPage /> },
          { path: ':id/ci-triggers', element: <ProjectsCITriggersPage /> },
          { path: ':id/templates', element: <ProjectsTemplatesPage /> },
          { path: ':id/integrations', element: <ProjectsIntegrationsPage /> },
          { path: ':id/artifacts', element: <ProjectsArtifactsPage /> },
        ],
      },
      {
        path: 'content',
        element: <ContentLayout />,
        children: [
          { index: true, element: <ContentDashboardPage /> },
          { path: 'create', element: <ContentCreatePage /> },
          { path: 'create/:id', element: <ContentCreatePage /> },
          { path: 'library', element: <ContentListLibraryPage /> },
          { path: 'master', element: <ContentMasterDashboardPage /> },
          { path: 'memory', element: <ContentMemoryPage /> },
          { path: ':id/edit', element: <ContentEditPage /> },
        ],
      },
      {
        path: 'finance',
        element: <FinanceLayout />,
        children: [
          { index: true, element: <FinanceDashboardPage /> },
          { path: 'integrations', element: <FinanceIntegrationsPage /> },
          { path: 'transactions-reconciliation', element: <TransactionsReconciliationPage /> },
        ],
      },
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
