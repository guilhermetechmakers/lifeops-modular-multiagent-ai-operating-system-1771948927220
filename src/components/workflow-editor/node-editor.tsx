/**
 * NodeEditor - Properties panel for selected node.
 * Dynamic forms based on node type; schema validation; inline help.
 */

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { WorkflowNode, WorkflowNodeType, WorkflowNodeConfig } from '@/types/workflow-editor'
import { Trash2, AlertCircle } from 'lucide-react'
import { useWorkflowStore } from '@/stores/workflow-store'
import { fetchAgents } from '@/api/workflow-editor'
import { useEffect } from 'react'

interface NodeEditorProps {
  node?: WorkflowNode | null
  onRemove?: (nodeId: string) => void
  onApply?: (nodeId: string, config: Partial<WorkflowNode>) => void
}

interface ValidationError {
  field: string
  message: string
}

function validateNodeConfig(
  type: WorkflowNodeType,
  config: WorkflowNodeConfig
): ValidationError[] {
  const errors: ValidationError[] = []
  if (type === 'Agent') {
    if (!config.agentId?.trim()) {
      errors.push({ field: 'agentId', message: 'Agent ID is required' })
    }
    if (config.costLimit != null && config.costLimit < 0) {
      errors.push({ field: 'costLimit', message: 'Cost limit must be non-negative' })
    }
  }
  if (type === 'Condition') {
    if (!config.condition?.trim()) {
      errors.push({ field: 'condition', message: 'Condition expression is required' })
    }
  }
  if (type === 'Retry') {
    const maxRetries = config.maxRetries ?? 0
    if (maxRetries < 1 || maxRetries > 10) {
      errors.push({ field: 'maxRetries', message: 'Max retries must be 1–10' })
    }
  }
  if (type === 'SubWorkflow') {
    if (!config.subWorkflowId?.trim()) {
      errors.push({ field: 'subWorkflowId', message: 'Sub-workflow ID is required' })
    }
  }
  return errors
}

export function NodeEditor({
  node: nodeProp,
  onRemove,
  onApply,
}: NodeEditorProps) {
  const [localConfig, setLocalConfig] = useState<WorkflowNodeConfig>({})
  const [localLabel, setLocalLabel] = useState('')
  const [agents, setAgents] = useState<Array<{ id: string; name: string }>>([])

  const nodes = useWorkflowStore((s) => s.nodes)
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId)
  const updateNode = useWorkflowStore((s) => s.updateNode)
  const removeNode = useWorkflowStore((s) => s.removeNode)

  const node = nodeProp ?? (selectedNodeId ? (nodes ?? []).find((n) => n.id === selectedNodeId) ?? null : null)

  useEffect(() => {
    if (node) {
      setLocalConfig(node.config ?? {})
      setLocalLabel(node.label ?? node.type)
    }
  }, [node])

  useEffect(() => {
    let cancelled = false
    fetchAgents()
      .then((list) => {
        if (!cancelled) {
          const arr = Array.isArray(list) ? list : []
          setAgents(arr.map((a) => ({ id: a.id, name: a.name })))
        }
      })
      .catch(() => {
        if (!cancelled) setAgents([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleApply = useCallback(() => {
    if (!node) return
    const updates = {
      label: localLabel.trim() || node.type,
      config: { ...localConfig },
    }
    updateNode(node.id, updates)
    onApply?.(node.id, updates)
  }, [node, localLabel, localConfig, updateNode, onApply])

  const handleRemove = useCallback(() => {
    if (!node) return
    removeNode(node.id)
    onRemove?.(node.id)
  }, [node, removeNode, onRemove])

  if (!node) {
    return (
      <Card className="rounded-xl border-border">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Select a node to edit its properties
          </p>
        </CardContent>
      </Card>
    )
  }

  const errors = validateNodeConfig(node.type, localConfig)
  const hasErrors = errors.length > 0

  return (
    <Card className="rounded-xl border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Node Properties</CardTitle>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleRemove}
            aria-label="Remove node"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasErrors && (
          <div className="flex items-start gap-2 rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 text-warning mt-0.5" />
            <ul className="list-disc list-inside space-y-1 text-warning">
              {(errors ?? []).map((e) => (
                <li key={e.field}>{e.message}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="node-label">Label</Label>
          <Input
            id="node-label"
            value={localLabel}
            onChange={(e) => setLocalLabel(e.target.value)}
            placeholder={node.type}
          />
        </div>

        {node.type === 'Agent' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="agent-id">Agent</Label>
              <Select
                value={localConfig.agentId ?? ''}
                onValueChange={(v) => setLocalConfig((c) => ({ ...c, agentId: v }))}
              >
                <SelectTrigger id="agent-id">
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  {(agents ?? []).map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="memory-scope">Memory Scope</Label>
              <Input
                id="memory-scope"
                value={localConfig.memoryScope ?? ''}
                onChange={(e) =>
                  setLocalConfig((c) => ({ ...c, memoryScope: e.target.value }))
                }
                placeholder="e.g. content, finance"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost-limit">Cost Limit</Label>
              <Input
                id="cost-limit"
                type="number"
                min={0}
                value={localConfig.costLimit ?? ''}
                onChange={(e) => {
                  const v = e.target.value
                  setLocalConfig((c) => ({
                    ...c,
                    costLimit: v === '' ? undefined : Number(v),
                  }))
                }}
                placeholder="Optional"
              />
            </div>
          </>
        )}

        {node.type === 'Condition' && (
          <div className="space-y-2">
            <Label htmlFor="condition">Condition Expression</Label>
            <Textarea
              id="condition"
              value={localConfig.condition ?? ''}
              onChange={(e) =>
                setLocalConfig((c) => ({ ...c, condition: e.target.value }))
              }
              placeholder="e.g. status === 'approved'"
              rows={3}
            />
          </div>
        )}

        {node.type === 'Retry' && (
          <div className="space-y-2">
            <Label htmlFor="max-retries">Max Retries</Label>
            <Input
              id="max-retries"
              type="number"
              min={1}
              max={10}
              value={localConfig.maxRetries ?? 3}
              onChange={(e) =>
                setLocalConfig((c) => ({
                  ...c,
                  maxRetries: Math.min(10, Math.max(1, Number(e.target.value) || 1)),
                }))
              }
            />
          </div>
        )}

        {node.type === 'SubWorkflow' && (
          <div className="space-y-2">
            <Label htmlFor="sub-workflow">Sub-Workflow ID</Label>
            <Input
              id="sub-workflow"
              value={localConfig.subWorkflowId ?? ''}
              onChange={(e) =>
                setLocalConfig((c) => ({ ...c, subWorkflowId: e.target.value }))
              }
              placeholder="Template ID"
            />
          </div>
        )}

        <Button
          onClick={handleApply}
          className="w-full"
          disabled={hasErrors}
        >
          Apply Changes
        </Button>
      </CardContent>
    </Card>
  )
}
