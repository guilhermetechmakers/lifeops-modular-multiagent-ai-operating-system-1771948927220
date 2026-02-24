/**
 * WorkflowEditorPage - Visual multi-agent workflow authoring.
 * Canvas, Node Library, Properties, Template Manager, Simulation, Cronjobs link.
 */

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  WorkflowCanvas,
  NodeLibrary,
  NodeEditor,
  TemplateManager,
  SimulationPanel,
  CronjobsDashboardLink,
  AgentSDKPanel,
  PolicyPackManager,
  MasterDashboardWidgets,
} from '@/components/workflow-editor'
import {
  Play,
  Save,
  Send,
} from 'lucide-react'
import { useWorkflowStore } from '@/stores/workflow-store'
import {
  fetchTemplates,
  fetchTemplate,
  fetchNodes,
  fetchEdges,
  publishTemplate,
  createVersion,
} from '@/api/workflow-editor'
import { toast } from 'sonner'

export function WorkflowEditorPage() {
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [templates, setTemplates] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [simulationOpen, setSimulationOpen] = useState(false)

  const setTemplate = useWorkflowStore((s) => s.setTemplate)
  const setNodes = useWorkflowStore((s) => s.setNodes)
  const setEdges = useWorkflowStore((s) => s.setEdges)
  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode)
  const setSimulationResult = useWorkflowStore((s) => s.setSimulationResult)
  const simulationResult = useWorkflowStore((s) => s.simulationResult)
  const nodes = useWorkflowStore((s) => s.nodes ?? [])
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId)

  const selectedNode = (nodes ?? []).find((n) => n.id === selectedNodeId) ?? null

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchTemplates()
      .then((list) => {
        if (!cancelled) {
          const arr = Array.isArray(list) ? list : []
          setTemplates(arr.map((t) => ({ id: t.id, name: t.name })))
          if (arr.length > 0 && !templateId) {
            setTemplateId(arr[0]?.id ?? null)
          }
        }
      })
      .catch(() => {
        if (!cancelled) setTemplates([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!templateId) {
      setTemplate(null)
      setNodes([])
      setEdges([])
      setSelectedNode(null)
      return
    }
    let cancelled = false
    Promise.all([
      fetchTemplate(templateId),
      fetchNodes(templateId),
      fetchEdges(templateId),
    ])
      .then(([t, n, e]) => {
        if (!cancelled) {
          setTemplate(t ?? null)
          setNodes(Array.isArray(n) ? n : [])
          setEdges(Array.isArray(e) ? e : [])
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNodes([])
          setEdges([])
        }
      })
    return () => {
      cancelled = true
    }
  }, [templateId, setTemplate, setNodes, setEdges, setSelectedNode])

  const handleTemplateSelect = useCallback((id: string) => {
    setTemplateId(id)
  }, [])

  const handleTemplateCreate = useCallback((t: { id: string; name?: string }) => {
    setTemplateId(t.id)
    setTemplates((prev) => [...(prev ?? []), { id: t.id, name: t.name ?? 'New' }])
  }, [])

  const handleSave = useCallback(async () => {
    if (!templateId) {
      toast.error('Select a template first')
      return
    }
    setSaving(true)
    try {
      await createVersion(templateId, {
        changesSummary: 'Saved from editor',
      })
      toast.success('Draft saved')
    } catch (e) {
      toast.error((e as Error)?.message ?? 'Failed to save')
    } finally {
      setSaving(false)
    }
  }, [templateId])

  const handlePublish = useCallback(async () => {
    if (!templateId) {
      toast.error('Select a template first')
      return
    }
    try {
      await publishTemplate(templateId)
      toast.success('Template published')
    } catch (e) {
      toast.error((e as Error)?.message ?? 'Failed to publish')
    }
  }, [templateId])

  const activeTemplateId = templateId ?? (templates?.[0] as { id: string } | undefined)?.id ?? null

  return (
    <div className="space-y-6 animate-in-up">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Editor</h1>
          <p className="text-muted-foreground mt-1">
            Visual multi-agent workflow authoring with versioning and simulation
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setSimulationOpen((v) => !v)}
          >
            <Play className="h-4 w-4" />
            Simulate
          </Button>
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button onClick={handlePublish}>
            <Send className="h-4 w-4" />
            Publish
          </Button>
          <MasterDashboardWidgets />
        </div>
      </div>

      {/* Main layout: Template sidebar + Canvas + Properties */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Template Manager (collapsible on small) */}
        <div className="lg:col-span-2">
          <TemplateManager
            templateId={activeTemplateId}
            onTemplateSelect={handleTemplateSelect}
            onTemplateCreate={handleTemplateCreate}
          />
        </div>

        {/* Center: Canvas with Node Library */}
        <div className="lg:col-span-7 min-h-[500px]">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-24">
                <p className="text-muted-foreground">Loading templates...</p>
              </CardContent>
            </Card>
          ) : !activeTemplateId ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-muted-foreground mb-4">
                  Create a template to get started
                </p>
                <TemplateManager
                  templateId={null}
                  onTemplateSelect={handleTemplateSelect}
                  onTemplateCreate={handleTemplateCreate}
                />
              </CardContent>
            </Card>
          ) : (
            <WorkflowCanvas
              templateId={activeTemplateId}
              leftSlot={<NodeLibrary />}
              onCanvasClick={() => setSelectedNode(null)}
            />
          )}
        </div>

        {/* Right: Properties + Simulation + Links */}
        <div className="lg:col-span-3 space-y-4">
          <NodeEditor node={selectedNode} />
          <SimulationPanel
            templateId={activeTemplateId}
            isOpen={simulationOpen}
            onToggle={() => setSimulationOpen((v) => !v)}
            result={simulationResult}
            onResult={setSimulationResult}
          />
          <CronjobsDashboardLink templateId={activeTemplateId} />
          <AgentSDKPanel />
          <PolicyPackManager />
        </div>
      </div>
    </div>
  )
}
