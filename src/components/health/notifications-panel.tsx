/**
 * NotificationsPanel - Pending approvals, safety alerts, system health hints.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Bell, CheckSquare, AlertTriangle, Activity, Info } from 'lucide-react'
import type { HealthNotification } from '@/types/health'
import { cn } from '@/lib/utils'

interface NotificationsPanelProps {
  notifications: HealthNotification[]
  isLoading?: boolean
}

const TYPE_ICONS = {
  approval: CheckSquare,
  safety: AlertTriangle,
  health: Activity,
  system: Info,
} as const

const TYPE_COLORS = {
  approval: 'text-primary',
  safety: 'text-warning',
  health: 'text-success',
  system: 'text-muted-foreground',
} as const

function formatTime(iso: string): string {
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
    return ''
  }
}

export function NotificationsPanel({ notifications = [], isLoading }: NotificationsPanelProps) {
  const items = notifications ?? []
  const unread = items.filter((n) => !n.read)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-40 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notifications
          {unread.length > 0 && (
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              ({unread.length} unread)
            </span>
          )}
        </CardTitle>
        <CardDescription>Pending approvals, safety alerts, system hints</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No notifications
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {items.map((n) => {
              const Icon = TYPE_ICONS[n.type] ?? Bell
              const colorClass = TYPE_COLORS[n.type] ?? 'text-muted-foreground'
              return (
                <div
                  key={n.id}
                  className={cn(
                    'p-3 rounded-lg border border-border',
                    !n.read && 'border-primary/30 bg-primary/5'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', colorClass)} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatTime(n.timestamp)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
