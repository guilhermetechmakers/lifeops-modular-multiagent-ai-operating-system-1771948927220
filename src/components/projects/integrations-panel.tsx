/**
 * IntegrationsPanel - Modular connectors for external providers.
 * OAuth flows, connector lifecycle (setup, refresh, revoke).
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plug, XCircle, RefreshCw, ExternalLink } from 'lucide-react'
import { fetchIntegrations, connectIntegration } from '@/api/projects'
import type { IntegrationConnector } from '@/types/projects'
import { toast } from 'sonner'

const PROVIDER_LABELS: Record<string, string> = {
  github: 'GitHub',
  gitlab: 'GitLab',
  plaid: 'Plaid',
  stripe: 'Stripe',
  healthkit: 'HealthKit',
}

interface IntegrationsPanelProps {
  projectId?: string | null
}

export function IntegrationsPanel({ projectId: _projectId }: IntegrationsPanelProps) {
  const [connectors, setConnectors] = useState<IntegrationConnector[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    fetchIntegrations().then((list) => {
      if (!cancelled) {
        setConnectors(Array.isArray(list) ? list : [])
        setIsLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  const handleConnect = async (provider: string) => {
    try {
      const { url } = await connectIntegration(provider)
      toast.success(`Redirecting to ${PROVIDER_LABELS[provider] ?? provider}...`)
      window.open(url, '_blank')
    } catch {
      toast.error('Failed to initiate connection')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in-up">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Plug className="h-6 w-6 text-primary" />
          Integrations
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Connect GitHub, GitLab, CI/CD, Plaid, Stripe, HealthKit
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(connectors ?? []).map((c) => (
          <Card
            key={c.id}
            className={`transition-all duration-300 hover:shadow-card-hover ${c.status === 'connected' ? 'border-success/30' : ''}`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Plug className="h-4 w-4 text-primary" />
                {PROVIDER_LABELS[c.provider] ?? c.provider}
              </CardTitle>
              <Badge
                variant={
                  c.status === 'connected' ? 'success' : c.status === 'error' ? 'destructive' : 'secondary'
                }
              >
                {c.status}
              </Badge>
            </CardHeader>
            <CardContent>
              {c.scopes && c.scopes.length > 0 && (
                <p className="text-xs text-muted-foreground mb-3">
                  Scopes: {c.scopes.join(', ')}
                </p>
              )}
              <div className="flex gap-2">
                {c.status === 'connected' ? (
                  <>
                    <Button variant="outline" size="sm" className="gap-1">
                      <RefreshCw className="h-3 w-3" />
                      Refresh
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive gap-1">
                      <XCircle className="h-3 w-3" />
                      Revoke
                    </Button>
                  </>
                ) : (
                  <Button size="sm" onClick={() => handleConnect(c.provider)} className="gap-1">
                    <ExternalLink className="h-3 w-3" />
                    Connect
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {connectors.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Plug className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center max-w-sm">
              No integrations configured. Connect a provider to sync data.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
