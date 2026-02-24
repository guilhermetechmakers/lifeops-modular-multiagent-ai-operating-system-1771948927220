/**
 * CronjobsHealthIndicator - System health status for cronjobs.
 */

import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CronjobsHealthIndicatorProps {
  status?: 'healthy' | 'degraded' | 'unhealthy'
  cronjobsActive?: number
  cronjobsPaused?: number
  isLoading?: boolean
}

export function CronjobsHealthIndicator({
  status = 'healthy',
  cronjobsActive = 0,
  cronjobsPaused = 0,
  isLoading,
}: CronjobsHealthIndicatorProps) {
  const statusConfig = {
    healthy: {
      icon: CheckCircle2,
      label: 'Healthy',
      className: 'text-success',
      bgClassName: 'bg-success/10 border-success/30',
    },
    degraded: {
      icon: AlertTriangle,
      label: 'Degraded',
      className: 'text-warning',
      bgClassName: 'bg-warning/10 border-warning/30',
    },
    unhealthy: {
      icon: AlertTriangle,
      label: 'Unhealthy',
      className: 'text-destructive',
      bgClassName: 'bg-destructive/10 border-destructive/30',
    },
  }

  const config = statusConfig[status] ?? statusConfig.healthy
  const Icon = config.icon

  if (isLoading) {
    return (
      <Card className="border border-border">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted/30 animate-pulse" />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-24 bg-muted/30 rounded animate-pulse" />
              <div className="h-2 w-16 bg-muted/30 rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('border', config.bgClassName)}>
      <CardContent className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-1.5 rounded-lg', config.bgClassName)}>
            <Icon className={cn('h-5 w-5', config.className)} />
          </div>
          <div>
            <p className="font-medium text-sm">{config.label}</p>
            <p className="text-xs text-muted-foreground">
              {cronjobsActive} active{cronjobsPaused > 0 ? ` • ${cronjobsPaused} paused` : ''}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
