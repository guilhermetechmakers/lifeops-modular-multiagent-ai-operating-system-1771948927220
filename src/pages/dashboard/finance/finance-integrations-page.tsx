/**
 * FinanceIntegrationsPage - Integrations Framework panel.
 * Connectors with OAuth status and lifecycle actions.
 */

import { useFinanceDashboard } from '@/hooks/use-finance-dashboard'
import { IntegrationsFrameworkPanel } from '@/components/finance'

export function FinanceIntegrationsPage() {
  const { connectors, isLoading, initOAuth } = useFinanceDashboard()

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-1">
          OAuth connectors for Plaid, Stripe, GitHub, CI/CD, HealthKit
        </p>
      </div>

      <IntegrationsFrameworkPanel
        connectors={connectors ?? []}
        isLoading={isLoading}
        onOAuth={initOAuth}
      />
    </div>
  )
}
