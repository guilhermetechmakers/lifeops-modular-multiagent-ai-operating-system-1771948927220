/**
 * AnomaliesPanel - Queue of flagged transactions with severity and triage actions.
 */

import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Anomaly } from '@/types/finance'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnomaliesPanelProps {
  anomalies: Anomaly[]
  isLoading?: boolean
  onTriage?: (id: string, action: 'resolve' | 'assign') => void
}

const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-warning/20 text-warning',
  high: 'bg-destructive/20 text-destructive',
  critical: 'bg-destructive text-white',
}

export function AnomaliesPanel({
  anomalies = [],
  isLoading,
  onTriage,
}: AnomaliesPanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const items = anomalies ?? []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Anomalies
          </CardTitle>
          <CardDescription>Flagged transactions requiring triage</CardDescription>
        </div>
        {items.length > 0 && (
          <Link to="/dashboard/approvals">
            <Button variant="ghost" size="sm">
              View queue
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>No anomalies detected</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:border-warning/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">
                    {a.transaction?.merchant ?? 'Unknown'} —{' '}
                    {a.transaction
                      ? new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(Math.abs(a.transaction.amount))
                      : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(a.detected_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(
                      'capitalize',
                      SEVERITY_COLORS[a.severity] ?? SEVERITY_COLORS.medium
                    )}
                  >
                    {a.severity}
                  </Badge>
                  {onTriage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onTriage(a.id, 'resolve')}
                    >
                      Resolve
                    </Button>
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
