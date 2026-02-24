/**
 * TimelinePanel - Interactive timeline of agent handoffs and alerts.
 * Filterable by time window; expandable events with details and trace IDs.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GitBranch, AlertTriangle, Flag, Play, ChevronDown, ChevronUp } from 'lucide-react'
import type { TimelineEvent } from '@/types/master-dashboard'

const EVENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  handoff: GitBranch,
  alert: AlertTriangle,
  milestone: Flag,
  run: Play,
}

interface TimelinePanelProps {
  events: TimelineEvent[]
  isLoading?: boolean
}

export function TimelinePanel({ events, isLoading }: TimelinePanelProps) {
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const list = Array.isArray(events) ? events : []
  const filtered = typeFilter
    ? list.filter((e) => (e.type ?? 'run') === typeFilter)
    : list
  const displayEvents = filtered.slice(0, 10)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>Loading events...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>Agent handoffs, alerts, and milestones</CardDescription>
        </div>
        <div className="flex gap-2">
          {(['handoff', 'alert', 'milestone', 'run'] as const).map((t) => (
            <Button
              key={t}
              variant={typeFilter === t ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter(typeFilter === t ? null : t)}
            >
              {t}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No events in selected filter
            </p>
          ) : (
            displayEvents.map((ev) => {
              const Icon = EVENT_ICONS[ev.type ?? 'run'] ?? Play
              const isExpanded = expandedId === ev.id

              return (
                <div
                  key={ev.id}
                  className="rounded-lg border border-border p-3 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg p-2 bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{ev.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ev.timestamp).toLocaleString()}
                        {ev.module && ` • ${ev.module}`}
                      </p>
                      {ev.traceId && (
                        <Link
                          to={`/dashboard/runs?trace=${ev.traceId}`}
                          className="text-xs text-primary hover:underline mt-1 inline-block"
                        >
                          Trace: {ev.traceId}
                        </Link>
                      )}
                      {isExpanded && ev.details && (
                        <p className="text-xs text-muted-foreground mt-2">{ev.details}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {ev.type ?? 'run'}
                    </Badge>
                    {ev.module && (
                      <Badge variant="outline" className="text-xs">
                        {ev.module}
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
        {filtered.length > 10 && (
          <Link to="/dashboard/runs" className="block mt-4">
            <Button variant="ghost" size="sm" className="w-full">
              View all events
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
