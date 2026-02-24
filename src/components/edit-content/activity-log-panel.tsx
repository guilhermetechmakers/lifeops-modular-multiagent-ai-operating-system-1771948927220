/**
 * ActivityLogPanel - Agent actions with timestamps, diffs, run artifacts.
 * Filters by agent, action type, and date.
 */

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Activity } from 'lucide-react'
import type { ActivityLogEntry } from '@/types/content-dashboard'

export interface ActivityLogPanelProps {
  activity?: ActivityLogEntry[]
  loading?: boolean
  disabled?: boolean
}

const ACTION_TYPES = ['all', 'edit', 'transition', 'comment', 'suggestion', 'version', 'schedule', 'publish']

export function ActivityLogPanel({
  activity = [],
  loading,
  disabled,
}: ActivityLogPanelProps) {
  const [filterAgent, setFilterAgent] = useState('')
  const [filterActionType, setFilterActionType] = useState<string>('all')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  const list = useMemo(() => {
    return (activity ?? []).filter((a) => {
      if (filterAgent && !a.actorId.toLowerCase().includes(filterAgent.toLowerCase())) return false
      if (filterActionType && filterActionType !== 'all') {
        const actionLower = (a.action ?? '').toLowerCase()
        if (!actionLower.includes(filterActionType.toLowerCase())) return false
      }
      if (filterDateFrom) {
        const ts = new Date(a.timestamp).getTime()
        const from = new Date(filterDateFrom).setHours(0, 0, 0, 0)
        if (ts < from) return false
      }
      if (filterDateTo) {
        const ts = new Date(a.timestamp).getTime()
        const to = new Date(filterDateTo).setHours(23, 59, 59, 999)
        if (ts > to) return false
      }
      return true
    })
  }, [activity, filterAgent, filterActionType, filterDateFrom, filterDateTo])

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Activity Log
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Filter by agent..."
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="w-40"
            disabled={disabled}
            aria-label="Filter by agent"
          />
          <Select value={filterActionType} onValueChange={setFilterActionType} disabled={disabled}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Action type" />
            </SelectTrigger>
            <SelectContent>
              {ACTION_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === 'all' ? 'All types' : t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            placeholder="From"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="w-36"
            disabled={disabled}
            aria-label="Filter from date"
          />
          <Input
            type="date"
            placeholder="To"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="w-36"
            disabled={disabled}
            aria-label="Filter to date"
          />
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground py-4">Loading activity...</div>
        ) : list.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No activity yet. Actions on this content will appear here.
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {list.map((a) => (
              <div
                key={a.id}
                className="flex flex-col gap-1 rounded-lg border border-border p-3 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{a.action}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(a.timestamp).toLocaleString()}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{a.actorId}</span>
                {a.details && (
                  <p className="text-xs text-muted-foreground mt-1">{a.details}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
