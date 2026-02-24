/**
 * MetricsDashboard - Charts for agent health, latency, LLM cost, integrations, system resources.
 * Neon accents, dark background, tooltips with exact values.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { SystemMetric } from '@/types/master-dashboard'

interface MetricsDashboardProps {
  metrics: SystemMetric[]
  isLoading?: boolean
}

const CHART_COLORS = {
  primary: 'rgb(var(--primary))',
  success: 'rgb(var(--success))',
  warning: 'rgb(var(--warning))',
  destructive: 'rgb(var(--destructive))',
  muted: 'rgb(var(--muted-foreground) / 0.3)',
}

function CustomTooltip(props: { active?: boolean; payload?: Array<{ value?: number; name?: string }>; label?: string }) {
  const { active, payload, label } = props
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-card text-sm">
      <p className="font-medium text-muted-foreground mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-foreground">
          {p.name}: <span className="font-semibold">{typeof p.value === 'number' ? p.value.toFixed(2) : String(p.value ?? '')}</span>
        </p>
      ))}
    </div>
  )
}

export function MetricsDashboard({ metrics, isLoading }: MetricsDashboardProps) {
  const list = Array.isArray(metrics) ? metrics : []
  const chartData = list
    .slice(-12)
    .map((m) => ({
      name: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cpu: m.cpu ?? 0,
      memory: m.memory ?? 0,
      latency: m.latencyMs ?? 0,
      throughput: m.throughput ?? 0,
      errorRate: m.errorRate ?? 0,
    }))

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="h-[300px] animate-pulse">
          <CardHeader>
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="h-4 w-48 bg-muted rounded mt-2" />
          </CardHeader>
          <CardContent>
            <div className="h-[220px] bg-muted/30 rounded-lg" />
          </CardContent>
        </Card>
        <Card className="h-[300px] animate-pulse">
          <CardHeader>
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="h-4 w-48 bg-muted rounded mt-2" />
          </CardHeader>
          <CardContent>
            <div className="h-[220px] bg-muted/30 rounded-lg" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>System Resources</CardTitle>
          <CardDescription>CPU and memory utilization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.success} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={CHART_COLORS.success} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.muted} />
                <XAxis dataKey="name" stroke={CHART_COLORS.muted} fontSize={12} />
                <YAxis stroke={CHART_COLORS.muted} fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="cpu" stroke={CHART_COLORS.primary} fill="url(#cpuGrad)" strokeWidth={2} name="CPU %" />
                <Area type="monotone" dataKey="memory" stroke={CHART_COLORS.success} fill="url(#memGrad)" strokeWidth={2} name="Memory %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latency & Throughput</CardTitle>
          <CardDescription>Orchestration latency (ms) and throughput</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.muted} />
                <XAxis dataKey="name" stroke={CHART_COLORS.muted} fontSize={12} />
                <YAxis stroke={CHART_COLORS.muted} fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="latency" stroke={CHART_COLORS.primary} strokeWidth={2} dot={{ fill: CHART_COLORS.primary }} name="Latency (ms)" />
                <Line type="monotone" dataKey="throughput" stroke={CHART_COLORS.success} strokeWidth={2} dot={{ fill: CHART_COLORS.success }} name="Throughput" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Error Rate</CardTitle>
          <CardDescription>System error rate over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.muted} />
                <XAxis dataKey="name" stroke={CHART_COLORS.muted} fontSize={12} />
                <YAxis stroke={CHART_COLORS.muted} fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="errorRate" fill={CHART_COLORS.destructive} radius={[4, 4, 0, 0]} name="Error %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
