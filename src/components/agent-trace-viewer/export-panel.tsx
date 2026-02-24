/**
 * ExportPanel - JSON and human-readable report export.
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileJson, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RunTrace, Event } from '@/types/agent-trace'

export interface ExportPanelProps {
  trace: RunTrace | null
  runId?: string
  className?: string
}

function formatTimestamp(ts: string): string {
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return ts
  }
}

function generateHumanReport(runId: string, events: Event[]): string {
  const lines: string[] = [
    `# Agent Trace Report`,
    `Run ID: ${runId}`,
    `Generated: ${new Date().toISOString()}`,
    ``,
    `## Events (${events.length})`,
    ``,
  ]
  const safeEvents = Array.isArray(events) ? events : []
  safeEvents.forEach((e, i) => {
    const from = e.fromAgentId ?? '—'
    const to = e.toAgentId ?? '—'
    lines.push(`### ${i + 1}. ${e.type} (${e.eventId})`)
    lines.push(`Time: ${formatTimestamp(e.timestamp)}`)
    lines.push(`From: ${from} → To: ${to}`)
    if (e.topic) lines.push(`Topic: ${e.topic}`)
    if (e.details && Object.keys(e.details).length > 0) {
      lines.push(`Details: ${JSON.stringify(e.details)}`)
    }
    lines.push(``)
  })
  return lines.join('\n')
}

export function ExportPanel({
  trace,
  runId: runIdProp,
  className,
}: ExportPanelProps) {
  const [exporting, setExporting] = useState<'json' | 'report' | null>(null)
  const runId = runIdProp ?? trace?.runId ?? ''
  const safeEvents = Array.isArray(trace?.events) ? trace.events : []
  const hasData = trace != null && safeEvents.length > 0

  const handleExportJson = () => {
    if (!hasData) return
    setExporting('json')
    try {
      const payload = {
        runId,
        summary: trace?.summary ?? '',
        events: safeEvents,
        artifacts: trace?.artifacts ?? [],
        exportedAt: new Date().toISOString(),
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `trace-${runId}-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(null)
    }
  }

  const handleExportReport = () => {
    if (!hasData) return
    setExporting('report')
    try {
      const report = generateHumanReport(runId, safeEvents)
      const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `trace-${runId}-report-${Date.now()}.txt`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(null)
    }
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={handleExportJson}
          disabled={!hasData || exporting !== null}
        >
          <FileJson className="h-4 w-4" />
          Export as JSON
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={handleExportReport}
          disabled={!hasData || exporting !== null}
        >
          <FileText className="h-4 w-4" />
          Export Report (TXT)
        </Button>
      </CardContent>
    </Card>
  )
}
