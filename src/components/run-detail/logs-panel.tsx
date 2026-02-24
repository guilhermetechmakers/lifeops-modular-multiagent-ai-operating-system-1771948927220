/**
 * LogsPanel - Log viewer with paged logs.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { RunLog } from '@/types/runs'

export interface LogsPanelProps {
  logs?: RunLog[] | null
  isLoading?: boolean
}

const LEVEL_CLASSES: Record<string, string> = {
  info: 'text-foreground',
  warn: 'text-warning',
  error: 'text-destructive',
  debug: 'text-muted-foreground',
}

function formatLogTime(iso?: string): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    })
  } catch {
    return iso
  }
}

export function LogsPanel({ logs, isLoading }: LogsPanelProps) {
  const items = Array.isArray(logs) ? logs : []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
          <CardDescription>Run execution logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 font-mono text-xs">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-5 rounded bg-muted/30 animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
          <CardDescription>Run execution logs</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No logs for this run.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs</CardTitle>
        <CardDescription>Run execution logs</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="rounded-lg bg-muted/20 border border-border p-4 font-mono text-xs overflow-x-auto max-h-[300px] overflow-y-auto"
          role="log"
          aria-label="Run logs"
        >
          {(items ?? []).map((log, i) => (
            <div
              key={log.id ?? i}
              className={cn(
                'py-1 border-b border-border/50 last:border-0',
                LEVEL_CLASSES[log.level ?? 'info'] ?? LEVEL_CLASSES.info
              )}
            >
              <span className="text-muted-foreground mr-2">
                [{formatLogTime(log.timestamp)}]
              </span>
              <span className="uppercase font-medium mr-2">{log.level ?? 'info'}</span>
              {log.message}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
