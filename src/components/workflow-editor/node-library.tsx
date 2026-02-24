/**
 * NodeLibrary - Sidebar panel with draggable node types.
 * Agent, Handoff, Condition, Retry, Output, Trigger, SubWorkflow.
 */

import { useDraggable } from '@dnd-kit/core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Bot,
  ArrowRightLeft,
  GitBranch,
  RotateCcw,
  Download,
  Zap,
  Workflow,
  GripVertical,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkflowNodeType } from '@/types/workflow-editor'

const NODE_TYPES: {
  type: WorkflowNodeType
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { type: 'Trigger', label: 'Trigger', description: 'Start workflow', icon: Zap },
  { type: 'Agent', label: 'Agent', description: 'AI agent node', icon: Bot },
  { type: 'Handoff', label: 'Handoff', description: 'Transfer to another agent', icon: ArrowRightLeft },
  { type: 'Condition', label: 'Condition', description: 'Branch on condition', icon: GitBranch },
  { type: 'Retry', label: 'Retry', description: 'Retry on failure', icon: RotateCcw },
  { type: 'Output', label: 'Output', description: 'Produce output', icon: Download },
  { type: 'SubWorkflow', label: 'Sub-Workflow', description: 'Nested workflow', icon: Workflow },
]

function DraggableNodeItem({
  type,
  label,
  description,
  icon: Icon,
}: {
  type: WorkflowNodeType
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: type,
    data: { type: 'node-type' },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'flex items-center gap-2 p-3 rounded-lg border border-border bg-card cursor-grab active:cursor-grabbing',
        'hover:border-primary/50 hover:bg-primary/5 transition-all duration-200',
        isDragging && 'opacity-70 shadow-lg'
      )}
      role="button"
      tabIndex={0}
      aria-label={`Add ${label} node`}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
      <Icon className="h-5 w-5 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
    </div>
  )
}

export function NodeLibrary() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Node Library</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground mb-4">
          Drag nodes onto the canvas to build your workflow.
        </p>
        {(NODE_TYPES ?? []).map((item) => (
          <DraggableNodeItem
            key={item.type}
            type={item.type}
            label={item.label}
            description={item.description}
            icon={item.icon}
          />
        ))}
      </CardContent>
    </Card>
  )
}
