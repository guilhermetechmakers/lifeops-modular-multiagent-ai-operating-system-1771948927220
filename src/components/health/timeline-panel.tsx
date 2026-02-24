/**
 * TimelinePanel - Agent handoffs, run artifacts, logs, explanations.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { GitBranch, Play, FileText, MessageSquare } from 'lucide-react'
import type { TimelineEvent } from '@/types/health'

interface TimelinePanelProps {
  events: TimelineEvent[]
  isLoading?: boolean
}

const TYPE_ICONS = {
  handoff: GitBranch,
  run: Play,
  artifact: FileText,
  log: MessageSquare,
} as const

const TYPE_LABELS = {
  handoff: 'Handoff',
  run: 'Run',
  artifact: 'Artifact',
  log: 'Log',
} as const

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export function TimelinePanel({ events = [], isLoading }: TimelinePanelProps) {
  const items = events ?? []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-40 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
        <CardDescription>Agent handoffs, runs, and artifacts</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No timeline events
          </p>
        ) : (
          <div className="space-y-0 relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-2 bottom-2 w-px bg-border" aria-hidden />
            {items.map((e) => {
              const Icon = TYPE_ICONS[e.type] ?? Play
              const label = TYPE_LABELS[e.type] ?? 'Event'
              return (
                <div key={e.id} className="relative flex gap-4 pl-2 pb-4 last:pb-0">
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card">
                    <Icon className="h-4 w-4 text-primary" aria-hidden />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-primary">{label}</span>
                      <span className="text-xs text-muted-foreground">{formatTime(e.timestamp)}</span>
                    </div>
                    <p className="font-medium text-sm mt-0.5">{e.title}</p>
                    {e.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{e.description}</p>
                    )}
                    {e.runId && (
                      <p className="text-xs text-muted-foreground mt-1">Run: {e.runId}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
