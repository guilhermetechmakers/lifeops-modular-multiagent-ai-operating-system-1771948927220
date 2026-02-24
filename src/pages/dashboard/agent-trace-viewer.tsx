/**
 * AgentTraceViewerPage - Interactive timeline of agent-to-agent communications.
 * Filtering, drill-downs, export, navigation to artifacts and run details.
 */

import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import {
  TimelineViewport,
  FilterPanel,
  DetailPanel,
  ExportPanel,
  ActivityLegend,
} from '@/components/agent-trace-viewer'
import { useAgentTrace, useEventDetail } from '@/hooks/use-agent-trace'
import type { Event, EventDetail, TraceFilters } from '@/types/agent-trace'

export function AgentTraceViewerPage() {
  const { id: runId } = useParams<{ id: string }>()
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [detailPanelOpen, setDetailPanelOpen] = useState(false)

  const {
    trace,
    events: filteredEvents,
    agents: agentOptions,
    topics: topicOptions,
    isLoading,
    error,
    filters,
    updateFilters,
  } = useAgentTrace(runId)
  const { detail: fetchedDetail } = useEventDetail(runId, selectedEventId)

  const filteredTrace = useMemo(
    () =>
      trace
        ? { ...trace, events: filteredEvents }
        : null,
    [trace, filteredEvents]
  )

  const handleFiltersChange = (f: TraceFilters) => updateFilters(f)

  const selectedEvent = useMemo(() => {
    const evt = (trace?.events ?? []).find((e) => e.eventId === selectedEventId)
    return evt ?? null
  }, [trace?.events, selectedEventId])

  const detailEvent: EventDetail | null = fetchedDetail ?? selectedEvent

  const handleSelectEvent = (event: Event) => {
    setSelectedEventId(event.eventId)
    setDetailPanelOpen(true)
  }

  const handleExpandEvent = (event: Event) => {
    setSelectedEventId(event.eventId)
    setDetailPanelOpen(true)
  }

  if (!runId) {
    return (
      <div className="space-y-6 animate-in-up">
        <p className="text-muted-foreground">No run selected.</p>
        <Link to="/dashboard/runs">
          <Button variant="outline">Back to Run History</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in-up">
      <div className="flex items-center gap-4">
        <Link to={`/dashboard/runs/${runId}`}>
          <Button variant="ghost" size="icon" aria-label="Back to run detail">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Agent Trace Viewer</h1>
          <p className="text-muted-foreground mt-1">
            Run <code className="font-mono text-sm">{runId}</code> • Timeline of agent communications
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-warning/50 bg-warning/10 px-4 py-2 text-sm text-warning">
          {error} (showing demo data)
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3 space-y-4 order-2 lg:order-1">
          <FilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            agentOptions={agentOptions}
            topicOptions={topicOptions}
          />
          <ActivityLegend />
          <ExportPanel trace={filteredTrace} />
        </aside>

        <main className="lg:col-span-9 order-1 lg:order-2">
          <TimelineViewport
            trace={filteredTrace}
            selectedEventId={selectedEventId}
            onSelectEvent={handleSelectEvent}
            onExpandEvent={handleExpandEvent}
            isLoading={isLoading}
          />
        </main>
      </div>

      <DetailPanel
        event={detailEvent}
        runId={runId}
        open={detailPanelOpen}
        onOpenChange={setDetailPanelOpen}
      />
    </div>
  )
}
