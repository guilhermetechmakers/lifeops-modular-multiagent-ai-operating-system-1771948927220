/**
 * Agent Console Detail Page - Full operational cockpit for a single agent.
 */

import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Bot } from 'lucide-react'
import { AgentDetailSection } from '@/components/agent-console'
import {
  useAgentDetail,
  useAgentMemory,
  useAgentTrace,
  useTools,
  useSimulation,
} from '@/hooks/use-agent-console'
import { toast } from 'sonner'

function formatRelativeTime(iso: string): string {
  const d = new Date(iso)
  const now = Date.now()
  const diff = now - d.getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

function statusVariant(
  status: string
): 'success' | 'secondary' | 'warning' | 'destructive' {
  switch (status) {
    case 'online':
      return 'success'
    case 'paused':
      return 'warning'
    case 'error':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export function AgentConsoleDetailPage() {
  const { agentId } = useParams()
  const [configSaving, setConfigSaving] = useState(false)
  const [permissionsSaving, setPermissionsSaving] = useState(false)

  const { agent, isLoading, error, refetch, updateConfig, updatePerms } =
    useAgentDetail(agentId)
  const { entries: memoryEntries, isLoading: memoryLoading, write: writeMemory, remove: removeMemory } =
    useAgentMemory(agentId)
  const { traces } = useAgentTrace(agentId)
  const { tools, isLoading: toolsLoading } = useTools()
  const { result: simulationResult, isRunning: simulationRunning, run: runSimulation, reset: resetSimulation } =
    useSimulation(agentId)

  const handleDeleteMemory = async (memoryId: string) => {
    try {
      await removeMemory(memoryId)
      toast.success('Memory entry deleted')
    } catch {
      toast.error('Failed to delete memory')
    }
  }

  const handleSaveConfig = async (config: Parameters<typeof updateConfig>[0]) => {
    setConfigSaving(true)
    try {
      await updateConfig(config)
      toast.success('Config saved')
    } catch {
      toast.error('Failed to save config')
    } finally {
      setConfigSaving(false)
    }
  }

  const handleSavePermissions = async (
    perms: Parameters<typeof updatePerms>[0]
  ) => {
    setPermissionsSaving(true)
    try {
      await updatePerms(perms)
      toast.success('Permissions saved')
    } catch {
      toast.error('Failed to save permissions')
    } finally {
      setPermissionsSaving(false)
    }
  }

  const handleMemoryWrite = async (payload: {
    key: string
    value: unknown
    scope: string
    ttl?: number
  }) => {
    try {
      const entry = await writeMemory(payload)
      if (entry) toast.success('Memory entry written')
      else toast.error('Failed to write memory')
    } catch {
      toast.error('Failed to write memory')
    }
  }

  const handleRunSimulation = async (payload: {
    promptTemplate?: string
    inputPayload?: Record<string, unknown>
  }) => {
    const res = await runSimulation(payload)
    if (res) toast.success('Simulation completed')
    else toast.error('Simulation failed')
    return res
  }

  if (isLoading && !agent) {
    return (
      <div className="space-y-8 animate-in-up">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-muted/30 animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted/30 rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted/30 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-96 bg-muted/30 rounded-xl animate-pulse" />
          <div className="lg:col-span-4 h-48 bg-muted/30 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="space-y-8 animate-in-up">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/agents">
            <Button variant="ghost" size="icon" aria-label="Back to agents">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <Card className="border-destructive/50">
          <CardContent className="py-8">
            <p className="text-destructive">
              {error?.message ?? 'Agent not found'}
            </p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
              <Link to="/dashboard/agents">
                <Button>Back to Agents</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusLabel =
    agent.status.charAt(0).toUpperCase() + agent.status.slice(1)

  return (
    <div className="space-y-8 animate-in-up">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/agents">
            <Button variant="ghost" size="icon" aria-label="Back to agents">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="rounded-xl p-2.5 bg-primary/10">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold truncate">{agent.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant={statusVariant(agent.status)}>{statusLabel}</Badge>
              <span>{formatRelativeTime(agent.last_activity)}</span>
              <span className="text-sm">
                {agent.automation_level.replace(/-/g, ' ')}
              </span>
              {agent.cost_control?.spent != null && (
                <span className="text-sm">
                  ${agent.cost_control.spent} spent
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Detail Section with Tabs */}
      <AgentDetailSection
        agent={agent}
        memoryEntries={memoryEntries}
        memoryLoading={memoryLoading}
        onMemoryWrite={handleMemoryWrite}
        onDeleteMemory={handleDeleteMemory}
        traces={traces}
        tools={tools}
        toolsLoading={toolsLoading}
        onRunSimulation={handleRunSimulation}
        onStopSimulation={resetSimulation}
        simulationResult={simulationResult}
        simulationRunning={simulationRunning}
        onSaveConfig={(config) => config && void handleSaveConfig(config)}
        configSaving={configSaving}
        onSavePermissions={(perms) => perms && void handleSavePermissions(perms)}
        permissionsSaving={permissionsSaving}
        runId={simulationResult?.runId}
      />
    </div>
  )
}
