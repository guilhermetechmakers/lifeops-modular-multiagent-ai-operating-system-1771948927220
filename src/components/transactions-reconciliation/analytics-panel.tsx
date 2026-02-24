/**
 * AnalyticsPanel - Lightweight charts for reconciliation progress and anomaly distribution.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import type { ReconciliationMetrics } from '@/types/transactions-reconciliation'

const STATUS_COLORS = {
  unreconciled: 'rgb(var(--warning))',
  matched: 'rgb(var(--success))',
  archived: 'rgb(var(--muted-foreground))',
}

export interface AnalyticsPanelProps {
  metrics: ReconciliationMetrics | null
  isLoading?: boolean
  className?: string
}

export function AnalyticsPanel({
  metrics,
  isLoading,
  className,
}: AnalyticsPanelProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!metrics) return null

  const statusData = [
    { name: 'Unreconciled', value: metrics.unreconciled, color: STATUS_COLORS.unreconciled },
    { name: 'Matched', value: metrics.matched, color: STATUS_COLORS.matched },
    { name: 'Archived', value: metrics.archived, color: STATUS_COLORS.archived },
  ].filter((d) => d.value > 0)

  const categoryData = (metrics.byCategory ?? []).filter((c) => c.count > 0)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Reconciliation Overview</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {metrics.total} total · {metrics.anomalyCount} anomalies
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {statusData.length > 0 && (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(var(--card))',
                    border: '1px solid rgb(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {categoryData.length > 0 && (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
              >
                <XAxis type="number" stroke="rgb(var(--muted-foreground))" />
                <YAxis
                  type="category"
                  dataKey="categoryName"
                  width={70}
                  stroke="rgb(var(--muted-foreground))"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(var(--card))',
                    border: '1px solid rgb(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="rgb(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {statusData.length === 0 && categoryData.length === 0 && (
          <div className="py-8 text-center text-muted-foreground text-sm">
            No data to display
          </div>
        )}
      </CardContent>
    </Card>
  )
}
