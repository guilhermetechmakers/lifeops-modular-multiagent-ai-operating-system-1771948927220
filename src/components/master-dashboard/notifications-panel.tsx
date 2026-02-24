/**
 * NotificationsPanel - Summary of notifications, delivery channels, templating status.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Bell, Webhook, Smartphone } from 'lucide-react'
import type { Notification } from '@/types/master-dashboard'

const CHANNEL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  'in-app': Bell,
  webhook: Webhook,
  push: Smartphone,
}

interface NotificationsPanelProps {
  notifications: Notification[]
  isLoading?: boolean
}

export function NotificationsPanel({ notifications, isLoading }: NotificationsPanelProps) {
  const list = Array.isArray(notifications) ? notifications : []
  const displayList = list.slice(0, 5)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Delivery channels and status</CardDescription>
      </CardHeader>
      <CardContent>
        {displayList.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No notifications</p>
        ) : (
          <div className="space-y-3">
            {displayList.map((n) => {
              const Icon = CHANNEL_ICONS[n.channel] ?? Bell
              return (
                <div
                  key={n.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg p-2 bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm capitalize">{n.channel}</p>
                      <p className="text-xs text-muted-foreground">
                        {n.lastSent ? new Date(n.lastSent).toLocaleString() : 'Never sent'}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      n.status === 'sent' ? 'success' : n.status === 'failed' ? 'destructive' : 'secondary'
                    }
                    className="text-xs"
                  >
                    {n.status ?? 'unknown'}
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
