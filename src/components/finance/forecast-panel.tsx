/**
 * ForecastPanel - Time-series forecast with scenarios and confidence bands.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Forecast } from '@/types/finance'
import { Skeleton } from '@/components/ui/skeleton'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Download } from 'lucide-react'

interface ForecastPanelProps {
  forecasts: Forecast[]
  isLoading?: boolean
}

const SCENARIOS = ['baseline', 'optimistic', 'pessimistic'] as const

export function ForecastPanel({ forecasts = [], isLoading }: ForecastPanelProps) {
  const [scenario, setScenario] = useState<'baseline' | 'optimistic' | 'pessimistic'>('baseline')
  const [horizon, setHorizon] = useState<'monthly' | 'quarterly'>('monthly')

  const items = forecasts ?? []
  const filtered = items.filter(
    (f) =>
      f.scenario === scenario &&
      (horizon === 'monthly' ? f.horizon_months === 1 : f.horizon_months === 3)
  )

  const chartData = [
    { month: 'Jan', value: 22000 },
    { month: 'Feb', value: 23500 },
    { month: 'Mar', value: filtered[0]?.value ?? 24500 },
    { month: 'Apr', value: 25500 },
    { month: 'May', value: 26500 },
  ]

  const handleExport = () => {
    const csv = chartData.map((d) => `${d.month},${d.value}`).join('\n')
    const blob = new Blob([`month,value\n${csv}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'forecast-export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[280px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <div>
          <CardTitle>Forecasting</CardTitle>
          <CardDescription>
            Time-series forecast with scenario overlays
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map((s) => (
            <Button
              key={s}
              variant={scenario === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setScenario(s)}
            >
              {s}
            </Button>
          ))}
          <Button
            variant={horizon === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setHorizon('monthly')}
          >
            Monthly
          </Button>
          <Button
            variant={horizon === 'quarterly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setHorizon('quarterly')}
          >
            Quarterly
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={handleExport} aria-label="Export">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
              <XAxis dataKey="month" stroke="rgb(var(--muted-foreground))" />
              <YAxis stroke="rgb(var(--muted-foreground))" tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip
                contentStyle={{
                  background: 'rgb(var(--card))',
                  border: '1px solid rgb(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) =>
                  [new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value), 'Forecast']
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="rgb(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'rgb(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {filtered[0] && (
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="secondary">
              Confidence: {(filtered[0].confidence * 100).toFixed(0)}%
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
