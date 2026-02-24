/**
 * SubscriptionsPanel - Registry with status, churn risk, renewal dates, alert indicators.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Subscription } from '@/types/finance'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, AlertTriangle } from 'lucide-react'

interface SubscriptionsPanelProps {
  subscriptions: Subscription[]
  isLoading?: boolean
}

export function SubscriptionsPanel({ subscriptions = [], isLoading }: SubscriptionsPanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-56 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const items = subscriptions ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscriptions</CardTitle>
        <CardDescription>
          Registry with status, churn risk, renewal dates
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>No subscriptions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:border-border/80 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">{s.product}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Renews {new Date(s.renewal_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      s.status === 'active'
                        ? 'success'
                        : s.status === 'paused'
                          ? 'warning'
                          : 'secondary'
                    }
                  >
                    {s.status}
                  </Badge>
                  {s.churn_score > 0.25 && (
                    <span
                      className="flex items-center gap-0.5 text-warning text-xs"
                      title="Churn risk"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <span className="font-semibold text-sm min-w-[70px] text-right">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(s.next_billing_amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
