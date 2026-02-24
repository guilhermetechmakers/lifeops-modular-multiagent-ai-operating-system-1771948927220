/**
 * WearablesStatusCard - Last sync, data health, connected devices, data gaps.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Watch, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import type { Wearable } from '@/types/health'
import { cn } from '@/lib/utils'

interface WearablesStatusCardProps {
  wearables: Wearable[]
  isLoading?: boolean
  isSyncing?: boolean
  onSync?: () => Promise<void>
}

function formatRelativeTime(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  } catch {
    return 'Unknown'
  }
}

export function WearablesStatusCard({ wearables = [], isLoading, isSyncing, onSync }: WearablesStatusCardProps) {
  const items = wearables ?? []
  const connected = items.filter((w) => w.connected)
  const hasGaps = items.some((w) => w.dataGaps)
  const lastSync = items.length > 0
    ? items.reduce((acc, w) => {
        const t = new Date(w.lastSync).getTime()
        return t > acc ? t : acc
      }, 0)
    : 0

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Watch className="h-5 w-5 text-primary" />
            Wearables
          </CardTitle>
          <CardDescription>Connected devices and sync status</CardDescription>
        </div>
        {onSync && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSync()}
            disabled={isSyncing}
            aria-label="Sync wearables"
          >
            <RefreshCw className={cn('h-4 w-4', isSyncing && 'animate-pulse')} />
            {isSyncing ? 'Syncing...' : 'Sync'}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status summary */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={connected.length > 0 ? 'success' : 'secondary'} className="gap-1">
            {connected.length > 0 ? <CheckCircle className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
            {connected.length} connected
          </Badge>
          {lastSync > 0 && (
            <Badge variant="secondary">Last sync: {formatRelativeTime(new Date(lastSync).toISOString())}</Badge>
          )}
          {hasGaps && (
            <Badge variant="warning">Data gaps</Badge>
          )}
        </div>

        {/* Device list */}
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No wearables connected. Connect HealthKit or Google Fit to sync.
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((w) => (
              <div
                key={w.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border',
                  w.connected ? 'border-success/30 bg-success/5' : 'border-border'
                )}
              >
                <div className="flex items-center gap-2">
                  <Watch className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{w.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {w.dataGaps && <Badge variant="warning" className="text-xs">Gaps</Badge>}
                  <Badge variant={w.connected ? 'success' : 'secondary'}>
                    {w.connected ? 'Connected' : 'Disconnected'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatRelativeTime(w.lastSync)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
