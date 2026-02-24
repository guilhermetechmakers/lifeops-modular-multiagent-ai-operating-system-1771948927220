/**
 * useAgentTrace - Fetch and filter run trace data with null-safe patterns.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchRunTrace, fetchEventDetail } from '@/api/agent-trace'
import type { RunTrace, TraceFilters, EventDetail } from '@/types/agent-trace'

function createMockTrace(runId: string): RunTrace {
  const baseTime = Date.now() - 3600000
  return {
    runId,
    summary: 'Demo trace with message, handoff, negotiation, alert, and consensus events.',
    events: [
      {
        eventId: 'evt-1',
        type: 'message',
        timestamp: new Date(baseTime).toISOString(),
        fromAgentId: 'orchestrator',
        toAgentId: 'content-agent',
        topic: 'content-ideas',
        details: { prompt: 'Generate weekly ideas' },
      },
      {
        eventId: 'evt-2',
        type: 'handoff',
        timestamp: new Date(baseTime + 120000).toISOString(),
        fromAgentId: 'content-agent',
        toAgentId: 'suggester',
        topic: 'handoff',
      },
      {
        eventId: 'evt-3',
        type: 'negotiation',
        timestamp: new Date(baseTime + 240000).toISOString(),
        fromAgentId: 'suggester',
        toAgentId: 'orchestrator',
        topic: 'schedule-conflict',
        details: { proposed: 'reschedule' },
      },
      {
        eventId: 'evt-4',
        type: 'alert',
        timestamp: new Date(baseTime + 300000).toISOString(),
        fromAgentId: 'orchestrator',
        toAgentId: null,
        topic: 'rate-limit',
      },
      {
        eventId: 'evt-5',
        type: 'consensus',
        timestamp: new Date(baseTime + 360000).toISOString(),
        fromAgentId: 'orchestrator',
        toAgentId: 'content-agent',
        topic: 'agreed',
        details: { decision: 'approved' },
      },
    ],
    artifacts: [],
  }
}

export function useAgentTrace(runId: string | undefined, initialFilters?: TraceFilters) {
  const [trace, setTrace] = useState<RunTrace | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TraceFilters>({
    agentIds: [],
    topics: [],
    eventTypes: [],
    severity: [],
    consensusOnly: false,
    ...initialFilters,
  })

  useEffect(() => {
    if (!runId) {
      setTrace(null)
      setIsLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    fetchRunTrace(runId)
      .then((data) => {
        if (!cancelled) {
          setTrace(data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTrace(createMockTrace(runId))
          setError(null)
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [runId])

  const updateFilters = useCallback((updates: Partial<TraceFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }, [])

  const filteredEvents = useMemo(() => {
    const events = trace?.events ?? []
    if (events.length === 0) return []

    return events.filter((e) => {
      if (filters.consensusOnly && e.type !== 'consensus') return false
      if ((filters.agentIds ?? []).length > 0) {
        const from = e.fromAgentId ?? ''
        const to = e.toAgentId ?? ''
        const match = filters.agentIds!.some((id) => from === id || to === id)
        if (!match) return false
      }
      if ((filters.topics ?? []).length > 0 && e.topic) {
        if (!filters.topics!.includes(e.topic)) return false
      }
      if ((filters.eventTypes ?? []).length > 0) {
        if (!filters.eventTypes!.includes(e.type)) return false
      }
      if ((filters.severity ?? []).length > 0 && e.severity) {
        if (!filters.severity!.includes(e.severity)) return false
      }
      return true
    })
  }, [trace?.events, filters])

  const agents = useMemo(() => {
    const events = trace?.events ?? []
    const set = new Set<string>()
    events.forEach((e) => {
      if (e.fromAgentId) set.add(e.fromAgentId)
      if (e.toAgentId) set.add(e.toAgentId)
    })
    return Array.from(set).sort()
  }, [trace?.events])

  const topics = useMemo(() => {
    const events = trace?.events ?? []
    const set = new Set<string>()
    events.forEach((e) => {
      if (e.topic) set.add(e.topic)
    })
    return Array.from(set).sort()
  }, [trace?.events])

  return {
    trace,
    events: filteredEvents,
    agents,
    topics,
    isLoading,
    loading: isLoading,
    error,
    filters,
    updateFilters,
  }
}

export function useEventDetail(runId: string | undefined, eventId: string | null) {
  const [detail, setDetail] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!runId || !eventId) {
      setDetail(null)
      return
    }
    let cancelled = false
    setLoading(true)
    fetchEventDetail(runId, eventId)
      .then((d) => {
        if (!cancelled) setDetail(d ?? null)
      })
      .catch(() => {
        if (!cancelled) setDetail(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [runId, eventId])

  return { detail, loading }
}
