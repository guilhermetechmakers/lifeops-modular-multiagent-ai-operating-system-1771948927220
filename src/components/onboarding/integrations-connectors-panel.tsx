/**
 * IntegrationsConnectorsPanel - UI for each provider with OAuth status and connect/disconnect.
 * Providers: GitHub, CI/CD, Plaid, Stripe, HealthKit.
 */

import { useState } from 'react'
import { useOnboardingData, useConnectProvider } from '@/hooks/use-onboarding'
import { IntegrationCard } from './integration-card'
import { OAuthFlowModal } from './oauth-flow-modal'

export function IntegrationsConnectorsPanel() {
  const { connectors, loadConnectors } = useOnboardingData()
  const { connect, disconnect } = useConnectProvider()
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null)
  const [oauthModalOpen, setOAuthModalOpen] = useState(false)

  const list = Array.isArray(connectors) && connectors.length > 0 ? connectors : [
    { id: 'gh', provider_key: 'github', user_id: '', status: 'not_connected' as const, connected_at: null, last_used_at: null, display_name: 'GitHub' },
    { id: 'ci', provider_key: 'cicd', user_id: '', status: 'not_connected' as const, connected_at: null, last_used_at: null, display_name: 'CI/CD' },
    { id: 'pl', provider_key: 'plaid', user_id: '', status: 'not_connected' as const, connected_at: null, last_used_at: null, display_name: 'Plaid' },
    { id: 'st', provider_key: 'stripe', user_id: '', status: 'not_connected' as const, connected_at: null, last_used_at: null, display_name: 'Stripe' },
    { id: 'hk', provider_key: 'healthkit', user_id: '', status: 'not_connected' as const, connected_at: null, last_used_at: null, display_name: 'HealthKit' },
  ]

  const handleConnect = async (providerId: string) => {
    setConnectingProvider(providerId)
    setOAuthModalOpen(true)
    await connect(providerId)
    setOAuthModalOpen(false)
    setConnectingProvider(null)
    loadConnectors()
  }

  const handleDisconnect = (providerId: string) => {
    disconnect(providerId)
  }

  return (
    <>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Connect your accounts. Each integration uses OAuth for secure access.
        </p>
        <div className="grid gap-4 md:grid-cols-2" role="list" aria-label="Integration connectors">
          {(list ?? []).map((connector) => (
            <IntegrationCard
              key={connector.id}
              connector={connector}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              disabled={connectingProvider !== null}
            />
          ))}
        </div>
      </div>

      <OAuthFlowModal
        open={oauthModalOpen}
        onOpenChange={setOAuthModalOpen}
        providerName={connectingProvider ? (connectingProvider.charAt(0).toUpperCase() + connectingProvider.slice(1)) : ''}
        isLoading={connectingProvider !== null}
      />
    </>
  )
}
