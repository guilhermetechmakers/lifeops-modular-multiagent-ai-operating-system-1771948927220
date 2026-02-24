/**
 * DiffsPanel - Display diffs between inputs/outputs and previous states.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { RunDiff } from '@/types/runs'

export interface DiffsPanelProps {
  diffs?: RunDiff[] | null
  isLoading?: boolean
}

export function DiffsPanel({ diffs, isLoading }: DiffsPanelProps) {
  const items = Array.isArray(diffs) ? diffs : []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Diffs</CardTitle>
          <CardDescription>Changes from previous state</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-24 rounded-lg bg-muted/30 animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Diffs</CardTitle>
          <CardDescription>Changes from previous state</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No diffs for this run.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diffs</CardTitle>
        <CardDescription>Changes from previous state</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(items ?? []).map((d) => (
            <div
              key={d.id}
              className="rounded-lg border border-border overflow-hidden"
            >
              <div className="px-3 py-2 bg-muted/30 text-sm font-medium text-muted-foreground">
                {d.path || '—'}
              </div>
              <pre
                className={cn(
                  'p-4 text-xs overflow-x-auto font-mono whitespace-pre-wrap',
                  'bg-muted/20'
                )}
              >
                {d.diff || '—'}
              </pre>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
