/**
 * RecoverySleepCard - Recovery score, sleep quality, wearable data visualization.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Activity, Moon } from 'lucide-react'
import type { RecoveryMetrics, SleepData } from '@/types/health'

interface RecoverySleepCardProps {
  recovery: RecoveryMetrics[]
  sleep: SleepData[]
  isLoading?: boolean
}

const CHART_COLORS = [
  'rgb(var(--primary))',
  'rgb(var(--success))',
  'rgb(var(--warning))',
]

export function RecoverySleepCard({ recovery = [], sleep = [], isLoading }: RecoverySleepCardProps) {
  const recoveryList = recovery ?? []
  const sleepList = sleep ?? []
  const latest = recoveryList[0]
  const sleepChartData = sleepList.length > 0
    ? [
        { name: 'Light', value: sleepList[0]?.stages?.light ?? 0, color: CHART_COLORS[0] },
        { name: 'Deep', value: sleepList[0]?.stages?.deep ?? 0, color: CHART_COLORS[1] },
        { name: 'REM', value: sleepList[0]?.stages?.REM ?? 0, color: CHART_COLORS[2] },
      ].filter((d) => d.value > 0)
    : []

  const lineData = recoveryList
    .slice(0, 7)
    .reverse()
    .map((r, i) => ({
      day: `Day ${i + 1}`,
      hrV: r.hrV,
      restingHR: r.restingHR,
      recovery: r.recoveryScore,
    }))

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[240px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Recovery & Sleep
        </CardTitle>
        <CardDescription>HRV, resting HR, sleep duration and quality</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick stats */}
        {latest && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border border-border bg-secondary/30">
              <p className="text-xs text-muted-foreground">Recovery</p>
              <p className="text-xl font-bold text-success">{latest.recoveryScore}</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-secondary/30">
              <p className="text-xs text-muted-foreground">HRV</p>
              <p className="text-xl font-bold">{latest.hrV}</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-secondary/30">
              <p className="text-xs text-muted-foreground">Resting HR</p>
              <p className="text-xl font-bold">{latest.restingHR} bpm</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-secondary/30">
              <p className="text-xs text-muted-foreground">Sleep</p>
              <p className="text-xl font-bold">{latest.sleepDurationHours.toFixed(1)}h</p>
            </div>
          </div>
        )}

        {/* Line chart */}
        {lineData.length > 0 && (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                <XAxis dataKey="day" stroke="rgb(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="rgb(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'rgb(var(--card))',
                    border: '1px solid rgb(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line type="monotone" dataKey="recovery" stroke="rgb(var(--success))" strokeWidth={2} name="Recovery" dot={{ fill: 'rgb(var(--success))' }} />
                <Line type="monotone" dataKey="hrV" stroke="rgb(var(--primary))" strokeWidth={2} name="HRV" dot={{ fill: 'rgb(var(--primary))' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Sleep stages pie */}
        {sleepChartData.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Sleep Stages (last night)
            </h4>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sleepChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {sleepChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {!latest && recoveryList.length === 0 && sleepList.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">No recovery or sleep data</p>
        )}
      </CardContent>
    </Card>
  )
}
