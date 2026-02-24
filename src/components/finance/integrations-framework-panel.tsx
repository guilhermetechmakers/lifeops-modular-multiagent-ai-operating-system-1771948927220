/**
 * IntegrationsFrameworkPanel - Connectors with OAuth status and lifecycle actions.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Connector } from '@/types/finance'
import { Skeleton } from '@/components/ui/skeleton'
import { Plug, CheckCircle, XCircle, Settings } from 'lucide-react'
import { toast } from 'sonner'

interface IntegrationsFrameworkPanelProps {
  connectors: Connector[]
  isLoading?: boolean
  onRevoke?: (id: string) => void
  onTest?: (id: string) => void
  onOAuth?: (id: string, provider: string) => Promise<void>
}

export function IntegrationsFrameworkPanel({
  connectors = [],
  isLoading,
  onRevoke,
  onTest,
  onOAuth,
}: IntegrationsFrameworkPanelProps) {
  const items = connectors ?? []

  const handleConnect = async (c: Connector) => {
    if (onOAuth) {
      try {
        await onOAuth(c.id, c.provider)
        toast.success(`Connecting ${c.name}...`)
      } catch {
        toast.error('Failed to initiate OAuth')
      }
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
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
          Integrations Framework
        </CardTitle>
        <CardDescription>
          OAuth connectors for Plaid, Stripe, GitHub, CI/CD, HealthKit
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>No connectors configured</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:border-border/80 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {c.provider.replace('_', ' ')}
                  </p>
                  {c.last_sync && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Last sync: {new Date(c.last_sync).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      c.oauth_status === 'connected'
                        ? 'success'
                        : c.oauth_status === 'expired'
                          ? 'warning'
                          : 'secondary'
                    }
                  >
                    {c.oauth_status === 'connected' ? (
                      <CheckCircle className="h-3 w-3 mr-1 inline" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1 inline" />
                    )}
                    {c.oauth_status}
                  </Badge>
                  {c.oauth_status === 'connected' ? (
                    <>
                      {onTest && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onTest(c.id)}
                        >
                          Test
                        </Button>
                      )}
                      {onRevoke && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRevoke(c.id)}
                        >
                          Revoke
                        </Button>
                      )}
                    </>
                  ) : (
                    onOAuth && (
                      <Button
                        size="sm"
                        onClick={() => handleConnect(c)}
                        className="gap-1"
                      >
                        <Settings className="h-3.5 w-3.5" />
                        Connect
                      </Button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
