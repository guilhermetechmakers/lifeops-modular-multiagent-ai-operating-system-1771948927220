/**
 * TodayOverviewCard - Quick stats: steps, active minutes, sleep, HRV, resting HR.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Activity, Footprints, Moon, Heart, Zap } from 'lucide-react'
import type { TodayOverview } from '@/types/health'
import { cn } from '@/lib/utils'

interface TodayOverviewCardProps {
  data: TodayOverview | null
  isLoading?: boolean
}

const METRICS = [
  { key: 'steps', label: 'Steps', icon: Footprints, format: (v: number) => v.toLocaleString(), color: 'text-primary' },
  { key: 'activeMinutes', label: 'Active min', icon: Zap, format: (v: number) => String(v), color: 'text-warning' },
  { key: 'sleepHours', label: 'Sleep (hrs)', icon: Moon, format: (v: number) => v.toFixed(1), color: 'text-primary' },
  { key: 'hrV', label: 'HRV', icon: Activity, format: (v: number) => String(v), color: 'text-success' },
  { key: 'restingHR', label: 'Resting HR', icon: Heart, format: (v: number) => `${v} bpm`, color: 'text-muted-foreground' },
] as const

export function TodayOverviewCard({ data, isLoading }: TodayOverviewCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const d = data ?? { steps: 0, activeMinutes: 0, sleepHours: 0, hrV: 0, restingHR: 0 }

  return (
    <Card className="transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Today&apos;s Overview
        </CardTitle>
        <CardDescription>Key metrics at a glance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {METRICS.map((m) => {
            const value = d[m.key as keyof TodayOverview]
            const numVal = typeof value === 'number' ? value : 0
            const Icon = m.icon
            return (
              <div
                key={m.key}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-secondary/30"
              >
                <Icon className={cn('h-5 w-5 mb-1', m.color)} aria-hidden />
                <p className="text-2xl font-bold">{m.format(numVal)}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
