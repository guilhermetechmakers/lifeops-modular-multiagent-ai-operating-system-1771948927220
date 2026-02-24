/**
 * RunHistoryPanel - Historical runs with status, duration, results, filters.
 */

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { History, Search, ExternalLink, TrendingUp } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { RunHistoryDetail } from '@/types/project-detail'

export interface RunHistoryPanelProps {
  projectId: string
  runs: RunHistoryDetail[]
  onRefresh: () => void
}

export function RunHistoryPanel({ projectId: _projectId, runs, onRefresh: _onRefresh }: RunHistoryPanelProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredRuns = useMemo(() => {
    let list = runs ?? []
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          r.resultSummary?.toLowerCase().includes(q) ||
          r.traceId?.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') list = list.filter((r) => r.status === statusFilter)
    return list
  }, [runs, search, statusFilter])

  const chartData = useMemo(() => {
    const byDate: Record<string, { success: number; failure: number; total: number }> = {}
    ;(runs ?? []).forEach((r) => {
      const d = r.runDate ? r.runDate.slice(0, 10) : 'unknown'
      if (!byDate[d]) byDate[d] = { success: 0, failure: 0, total: 0 }
      byDate[d].total++
      if (r.status === 'success') byDate[d].success++
      else if (r.status === 'failure') byDate[d].failure++
    })
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v, successRate: v.total > 0 ? (v.success / v.total) * 100 : 0 }))
  }, [runs])

  const getStatusVariant = (s: RunHistoryDetail['status']) => {
    if (s === 'success') return 'success'
    if (s === 'failure') return 'destructive'
    return 'secondary'
  }

  const formatDuration = (ms?: number) => {
    if (ms == null) return '-'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Run History
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Historical runs, status, duration, results, traceability
        </p>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-medium">Run Success Rate</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(var(--success))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="rgb(var(--success))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" opacity={0.5} />
                  <XAxis dataKey="date" stroke="rgb(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="rgb(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(var(--card))',
                      border: '1px solid rgb(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Success Rate']}
                  />
                  <Area
                    type="monotone"
                    dataKey="successRate"
                    stroke="rgb(var(--success))"
                    fill="url(#successGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search runs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search runs"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failure">Failure</SelectItem>
            <SelectItem value="running">Running</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(filteredRuns ?? []).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <History className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center max-w-sm">
              No run history yet. Automation runs will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(filteredRuns ?? []).map((r) => (
            <Card
              key={r.id}
              className="transition-all duration-300 hover:shadow-card-hover hover:border-primary/20"
            >
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">
                    {r.resultSummary ?? `Run ${r.id}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {r.runDate ? new Date(r.runDate).toLocaleString() : '-'} • {formatDuration(r.durationMs)}
                    {r.traceId && ` • ${r.traceId}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge>
                  <Button variant="ghost" size="icon-sm" aria-label="View run">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
