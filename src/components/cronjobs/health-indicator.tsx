/**
 * HealthIndicator - System health status for cronjobs.
 */

import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HealthIndicatorProps {
  status: 'healthy' | 'degraded' | 'unhealthy'
  cronjobsActive: number
  cronjobsPaused: number
  isLoading?: boolean
}

const STATUS_CONFIG = {
  healthy: {
    icon: CheckCircle,
    label: 'Healthy',
    className: 'text-success',
    bgClassName: 'bg-success/20',
  },
  degraded: {
    icon: AlertTriangle,
    label: 'Degraded',
    className: 'text-warning',
    bgClassName: 'bg-warning/20',
  },
  unhealthy: {
    icon: XCircle,
    label: 'Unhealthy',
    className: 'text-destructive',
    bgClassName: 'bg-destructive/20',
  },
}

export function HealthIndicator({
  status,
  cronjobsActive,
  cronjobsPaused,
  isLoading,
}: HealthIndicatorProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.healthy
  const Icon = config.icon

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
            <div className="space-y-1">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn('rounded-lg p-2', config.bgClassName)}>
            <Icon className={cn('h-5 w-5', config.className)} />
          </div>
          <div>
            <p className="font-medium text-sm">{config.label}</p>
            <p className="text-xs text-muted-foreground">
              {cronjobsActive} active • {cronjobsPaused} paused
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
