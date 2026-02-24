/**
 * IntegrationsPanel - Modular connectors for external providers.
 * OAuth flows, connector lifecycle (setup, refresh, revoke).
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plug, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import type { IntegrationConnector } from '@/types/projects'
import { cn } from '@/lib/utils'

const PROVIDER_LABELS: Record<IntegrationConnector['provider'], string> = {
  github: 'GitHub',
  gitlab: 'GitLab',
  plaid: 'Plaid',
  stripe: 'Stripe',
  healthkit: 'HealthKit',
}

const PROVIDER_DESCRIPTIONS: Record<IntegrationConnector['provider'], string> = {
  github: 'Repositories, PRs, issues',
  gitlab: 'Repositories, merge requests',
  plaid: 'Financial data',
  stripe: 'Payments and billing',
  healthkit: 'Health and fitness data',
}

interface IntegrationsPanelProps {
  connectors?: IntegrationConnector[]
  onConnect?: (provider: string) => Promise<void>
  onDisconnect?: (id: string) => Promise<void>
  isLoading?: boolean
}

export function IntegrationsPanel({
  connectors = [],
  onConnect,
  onDisconnect,
  isLoading,
}: IntegrationsPanelProps) {
  const list = Array.isArray(connectors) ? connectors : []

  const PROVIDERS: IntegrationConnector['provider'][] = [
    'github',
    'gitlab',
    'plaid',
    'stripe',
    'healthkit',
  ]

  const getConnectorForProvider = (provider: IntegrationConnector['provider']) =>
    list.find((c) => c.provider === provider)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plug className="h-5 w-5 text-primary" />
          Integrations
        </CardTitle>
        <CardDescription>
          Connect GitHub, GitLab, CI/CD, Plaid, Stripe, HealthKit
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {PROVIDERS.map((provider) => {
            const conn = getConnectorForProvider(provider)
            const isConnected = conn?.status === 'connected'

            return (
              <div
                key={provider}
                className={cn(
                  'flex items-center justify-between p-4 rounded-xl border transition-all duration-200',
                  isConnected
                    ? 'border-success/30 bg-success/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div>
                  <p className="font-semibold">{PROVIDER_LABELS[provider]}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {PROVIDER_DESCRIPTIONS[provider]}
                  </p>
                  {conn && (
                    <Badge
                      variant={
                        conn.status === 'connected'
                          ? 'success'
                          : conn.status === 'error'
                            ? 'destructive'
                            : 'secondary'
                      }
                      className="mt-2 text-xs"
                    >
                      {conn.status === 'connected' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : conn.status === 'error' ? (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {conn.status}
                    </Badge>
                  )}
                </div>
                <div className="shrink-0">
                  {isConnected && conn ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDisconnect?.(conn.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onConnect?.(provider)}
                      disabled={!onConnect}
                    >
                      <Plug className="h-4 w-4" />
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
