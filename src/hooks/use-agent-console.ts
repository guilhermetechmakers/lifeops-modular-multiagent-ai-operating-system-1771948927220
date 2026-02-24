/**
 * Agent Console data hooks - agents list, detail, memory, trace, simulation.
 */

import { useState, useEffect, useCallback } from 'react'
import type {
  Agent,
  MemoryEntry,
  Trace,
  Tool,
  RunSummary,
  MemoryWritePayload,
  SimulationPayload,
  SimulationResult,
  AgentConfigUpdate,
} from '@/types/agent-console'
import {
  fetchAgents,
  fetchAgent,
  fetchAgentMemory,
  writeAgentMemory,
  deleteAgentMemory,
  fetchAgentTrace,
  runSimulation,
  fetchRunSummary,
  fetchTools,
  updateAgentConfig,
  updateAgentPermissions,
} from '@/api/agent-console'

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchAgents()
      setAgents(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load agents'))
      setAgents([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { agents, isLoading, error, refetch: load }
}

/** Alias for useAgents - used by Agent Console page */
export const useAgentConsole = useAgents

export function useAgentDetail(agentId: string | undefined) {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    if (!agentId) {
      setAgent(null)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchAgent(agentId)
      setAgent(data ?? null)
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load agent'))
      setAgent(null)
    } finally {
      setIsLoading(false)
    }
  }, [agentId])

  useEffect(() => {
    load()
  }, [load])

  const updateConfig = useCallback(
    async (config: AgentConfigUpdate) => {
      if (!agentId) return null
      const updated = await updateAgentConfig(agentId, config)
      setAgent(updated ?? null)
      return updated
    },
    [agentId]
  )

  const updatePerms = useCallback(
    async (permissions: Record<string, unknown>) => {
      if (!agentId) return
      await updateAgentPermissions(agentId, permissions)
      load()
    },
    [agentId, load]
  )

  return { agent, isLoading, error, refetch: load, updateConfig, updatePerms }
}

export function useAgentMemory(
  agentId: string | undefined,
  params?: { scope?: string; limit?: number; offset?: number }
) {
  const [entries, setEntries] = useState<MemoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    if (!agentId) {
      setEntries([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      const data = await fetchAgentMemory(agentId, params)
      setEntries(Array.isArray(data) ? data : [])
    } catch {
      setEntries([])
    } finally {
      setIsLoading(false)
    }
  }, [agentId, params?.scope, params?.limit, params?.offset])

  useEffect(() => {
    load()
  }, [load])

  const write = useCallback(
    async (payload: MemoryWritePayload) => {
      if (!agentId) return null
      const entry = await writeAgentMemory(agentId, payload)
      if (entry) load()
      return entry
    },
    [agentId, load]
  )

  const remove = useCallback(
    async (memoryId: string) => {
      if (!agentId) return
      await deleteAgentMemory(agentId, memoryId)
      load()
    },
    [agentId, load]
  )

  return { entries, isLoading, refetch: load, write, remove }
}

export function useAgentTrace(
  agentId: string | undefined,
  params?: { runId?: string; limit?: number }
) {
  const [traces, setTraces] = useState<Trace[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    if (!agentId) {
      setTraces([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      const data = await fetchAgentTrace(agentId, params)
      setTraces(Array.isArray(data) ? data : [])
    } catch {
      setTraces([])
    } finally {
      setIsLoading(false)
    }
  }, [agentId, params?.runId, params?.limit])

  useEffect(() => {
    load()
  }, [load])

  return { traces, isLoading, refetch: load }
}

export function useTools() {
  const [tools, setTools] = useState<Tool[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchTools()
      setTools(Array.isArray(data) ? data : [])
    } catch {
      setTools([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { tools, isLoading, refetch: load }
}

export function useSimulation(agentId: string | undefined) {
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const run = useCallback(
    async (payload: SimulationPayload) => {
      if (!agentId) return null
      setIsRunning(true)
      setError(null)
      setResult(null)
      try {
        const res = await runSimulation(agentId, payload)
        setResult(res)
        return res
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Simulation failed'))
        return null
      } finally {
        setIsRunning(false)
      }
    },
    [agentId]
  )

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { result, isRunning, error, run, reset }
}

/** Alias for useSimulation - used by Agent Detail page */
export const useAgentSimulation = useSimulation

export function useRunSummary(runId: string | undefined) {
  const [summary, setSummary] = useState<RunSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    if (!runId) {
      setSummary(null)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      const data = await fetchRunSummary(runId)
      setSummary(data ?? null)
    } catch {
      setSummary(null)
    } finally {
      setIsLoading(false)
    }
  }, [runId])

  useEffect(() => {
    load()
  }, [load])

  return { summary, isLoading, refetch: load }
}
