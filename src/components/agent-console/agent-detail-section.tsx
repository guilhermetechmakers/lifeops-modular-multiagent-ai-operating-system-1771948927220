/**
 * Agent Detail Section - Tabs for Config, Permissions, Memory, Simulation.
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Lock, Database, Play } from 'lucide-react'
import { ConfigTab } from './config-tab'
import { PermissionsTab } from './permissions-tab'
import { MemorySnapshotViewer } from './memory-snapshot-viewer'
import { RunSimulationPanel } from './run-simulation-panel'
import { OrchestrationToolsInspector } from './orchestration-tools-inspector'
import { MasterUtilities } from './master-utilities'
import type {
  Agent,
  MemoryEntry,
  Trace,
  Tool,
  SimulationPayload,
  SimulationResult,
  MemoryWritePayload,
} from '@/types/agent-console'

export interface AgentDetailSectionProps {
  agent: Agent
  memoryEntries: MemoryEntry[]
  memoryLoading?: boolean
  onMemoryWrite?: (payload: MemoryWritePayload) => void | Promise<unknown>
  onDeleteMemory?: (memoryId: string) => void | Promise<unknown>
  traces: Trace[]
  tools: Tool[]
  toolsLoading?: boolean
  onRunSimulation?: (payload: SimulationPayload) => Promise<SimulationResult | null>
  onStopSimulation?: () => void
  simulationResult?: SimulationResult | null
  simulationRunning?: boolean
  onSaveConfig?: (config: Partial<Agent['config']>) => void | Promise<unknown>
  configSaving?: boolean
  onSavePermissions?: (perms: Partial<Agent['permissions']>) => void | Promise<unknown>
  permissionsSaving?: boolean
  runId?: string
  defaultTab?: 'config' | 'permissions' | 'memory' | 'simulation'
}

export function AgentDetailSection({
  agent,
  memoryEntries,
  memoryLoading,
  onMemoryWrite,
  onDeleteMemory,
  traces,
  tools,
  toolsLoading,
  onRunSimulation,
  onStopSimulation,
  simulationResult,
  simulationRunning,
  onSaveConfig,
  configSaving,
  onSavePermissions,
  permissionsSaving,
  runId,
  defaultTab = 'config',
}: AgentDetailSectionProps) {
  const handoffCount = (traces ?? []).filter((t) => t.type === 'handoff').length
  const negotiationCount = (traces ?? []).filter((t) => t.type === 'negotiation').length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 space-y-6">
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="config" className="gap-2">
              <Settings className="h-4 w-4" />
              Config
            </TabsTrigger>
            <TabsTrigger value="permissions" className="gap-2">
              <Lock className="h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="memory" className="gap-2">
              <Database className="h-4 w-4" />
              Memory
            </TabsTrigger>
            <TabsTrigger value="simulation" className="gap-2">
              <Play className="h-4 w-4" />
              Simulation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config">
            <ConfigTab
              config={agent.config}
              onSave={onSaveConfig}
              isSaving={configSaving}
            />
          </TabsContent>

          <TabsContent value="permissions">
            <PermissionsTab
              permissions={agent.permissions}
              onSave={onSavePermissions}
              isSaving={permissionsSaving}
            />
          </TabsContent>

          <TabsContent value="memory">
            <MemorySnapshotViewer
              entries={memoryEntries}
              isLoading={memoryLoading}
              onWrite={onMemoryWrite}
              onDelete={onDeleteMemory}
              canWrite
              canDelete={!!onDeleteMemory}
            />
          </TabsContent>

          <TabsContent value="simulation">
            {onRunSimulation && (
              <RunSimulationPanel
                agentId={agent.id}
                onRun={onRunSimulation}
                isRunning={simulationRunning}
                result={simulationResult}
                onStop={onStopSimulation}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <OrchestrationToolsInspector
          tools={tools}
          isLoading={toolsLoading}
          handoffCount={handoffCount}
          negotiationCount={negotiationCount}
        />
        <MasterUtilities runId={runId} />
      </div>
    </div>
  )
}
