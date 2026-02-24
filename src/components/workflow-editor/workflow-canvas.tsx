/**
 * WorkflowCanvas - Drag-and-drop canvas with pan/zoom, grid, nodes, edges.
 * Node types: Agent, Handoff, Condition, Retry, Output, Trigger, SubWorkflow.
 */

import { useCallback, useRef, useState, useEffect } from 'react'
import {
  DndContext,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import type { WorkflowNode, WorkflowEdge, WorkflowNodeType } from '@/types/workflow-editor'
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
import { useWorkflowStore, generateNodeId } from '@/stores/workflow-store'

const NODE_ICONS: Record<WorkflowNodeType, React.ComponentType<{ className?: string }>> = {
  Agent: Bot,
  Handoff: ArrowRightLeft,
  Condition: GitBranch,
  Retry: RotateCcw,
  Output: Download,
  Trigger: Zap,
  SubWorkflow: Workflow,
}

const NODE_COLORS: Record<WorkflowNodeType, string> = {
  Agent: 'border-primary/60 bg-primary/10',
  Handoff: 'border-warning/60 bg-warning/10',
  Condition: 'border-accent/60 bg-accent/10',
  Retry: 'border-warning/60 bg-warning/10',
  Output: 'border-success/60 bg-success/10',
  Trigger: 'border-primary/60 bg-primary/10',
  SubWorkflow: 'border-accent/60 bg-accent/10',
}

interface CanvasNodeProps {
  node: WorkflowNode
  isSelected: boolean
  onSelect: () => void
}

function CanvasNode({ node, isSelected, onSelect }: CanvasNodeProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: node.id,
    data: { type: 'node', node },
  })
  const updateNode = useWorkflowStore((s) => s.updateNode)
  const Icon = NODE_ICONS[node.type] ?? Bot
  const colorClass = NODE_COLORS[node.type] ?? NODE_COLORS.Agent

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  const handleDragEnd = useCallback(
    (e: React.MouseEvent) => {
      // Position update handled by parent DndContext
    },
    []
  )

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        left: node.position.x,
        top: node.position.y,
        width: node.size.width,
        height: node.size.height,
      }}
      className={cn(
        'absolute rounded-xl border-2 p-3 cursor-grab active:cursor-grabbing transition-all duration-200',
        'hover:shadow-glow hover:border-primary/80',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        colorClass,
        isSelected && 'ring-2 ring-primary border-primary shadow-glow',
        isDragging && 'opacity-90 z-50'
      )}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      role="button"
      tabIndex={0}
      aria-label={`Node ${node.label ?? node.type}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
    >
      <div className="flex items-center gap-2 h-full">
        <button
          type="button"
          className="touch-none shrink-0 p-0.5 rounded hover:bg-black/10 -ml-1"
          {...attributes}
          {...listeners}
          aria-label="Drag to move"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <Icon className="h-5 w-5 shrink-0 text-primary" />
        <span className="font-semibold text-sm truncate flex-1">
          {node.label ?? node.type}
        </span>
      </div>
      {/* Ports for connections */}
      <div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary border-2 border-card"
        data-port="out"
        aria-hidden
      />
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary border-2 border-card"
        data-port="in"
        aria-hidden
      />
    </div>
  )
}

interface WorkflowCanvasProps {
  templateId: string
  onCanvasClick?: () => void
}

export function WorkflowCanvas({ templateId, onCanvasClick }: WorkflowCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  const nodes = useWorkflowStore((s) => s.nodes)
  const edges = useWorkflowStore((s) => s.edges)
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId)
  const pan = useWorkflowStore((s) => s.pan)
  const zoom = useWorkflowStore((s) => s.zoom)
  const setPan = useWorkflowStore((s) => s.setPan)
  const setZoom = useWorkflowStore((s) => s.setZoom)
  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode)
  const updateNode = useWorkflowStore((s) => s.updateNode)
  const addNode = useWorkflowStore((s) => s.addNode)

  const filteredNodes = (nodes ?? []).filter((n) => n.templateId === templateId)
  const filteredEdges = (edges ?? []).filter((e) => e.templateId === templateId)

  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-drop',
    data: { type: 'canvas' },
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  )

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        setZoom(zoom + delta)
      }
    },
    [zoom, setZoom]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget || (e.target as HTMLElement).closest('[data-port]')) {
        return
      }
      if ((e.target as HTMLElement).closest('[data-draggable-node]')) {
        return
      }
      if (e.button === 0) {
        setIsPanning(true)
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
        onCanvasClick?.()
      }
    },
    [pan, onCanvasClick]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
      }
    },
    [isPanning, panStart, setPan]
  )

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!isPanning) return
      if (e.buttons === 0) setIsPanning(false)
    }
    window.addEventListener('mouseup', handler)
    return () => window.removeEventListener('mouseup', handler)
  }, [isPanning])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || over.id === 'canvas-drop') return

      const activeData = active.data.current as { type: string; node?: WorkflowNode } | undefined
      const overData = over.data.current as { type: string } | undefined

      if (activeData?.type === 'node' && overData?.type === 'canvas') {
        const node = activeData.node
        if (!node) return
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return
        const dropX = (event.activatorEvent as MouseEvent)?.clientX ?? 0
        const dropY = (event.activatorEvent as MouseEvent)?.clientY ?? 0
        const relX = (dropX - rect.left - pan.x) / zoom
        const relY = (dropY - rect.top - pan.y) / zoom
        updateNode(node.id, {
          position: { x: Math.max(0, relX - node.size.width / 2), y: Math.max(0, relY - node.size.height / 2) },
        })
      }

      if (activeData?.type === 'node-type') {
        const nodeType = active.id as string
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect || !overData) return
        const dropEvent = event.activatorEvent as MouseEvent | undefined
        const dropX = dropEvent?.clientX ?? rect.width / 2
        const dropY = dropEvent?.clientY ?? rect.height / 2
        const relX = (dropX - rect.left - pan.x) / zoom
        const relY = (dropY - rect.top - pan.y) / zoom
        addNode({
          id: generateNodeId(),
          templateId,
          type: nodeType as WorkflowNodeType,
          config: {},
          position: { x: Math.max(0, relX - 80), y: Math.max(0, relY - 24) },
          size: { width: 160, height: 48 },
          label: nodeType,
        })
      }
    },
    [templateId, pan, zoom, addNode, updateNode]
  )

  const getNodePosition = (node: WorkflowNode) => {
    const n = filteredNodes.find((x) => x.id === node.id)
    return n?.position ?? node.position
  }

  const getNodeCenter = (node: WorkflowNode) => {
    const pos = getNodePosition(node)
    return {
      x: pos.x + node.size.width / 2,
      y: pos.y + node.size.height / 2,
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-card/30 rounded-xl border border-border"
      onWheel={handleWheel}
      style={{ cursor: isPanning ? 'grabbing' : 'default' }}
    >
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div
          ref={setNodeRef}
          className={cn(
            'absolute inset-0 transition-colors duration-200',
            isOver && 'bg-primary/5'
          )}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid background */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(rgb(var(--border)) 1px, transparent 1px),
                linear-gradient(90deg, rgb(var(--border)) 1px, transparent 1px)
              `,
              backgroundSize: '24px 24px',
            }}
          />

          {/* Edges */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%' }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="rgb(var(--primary))" />
              </marker>
            </defs>
            {(filteredEdges ?? []).map((edge) => {
              const fromNode = filteredNodes.find((n) => n.id === edge.fromNodeId)
              const toNode = filteredNodes.find((n) => n.id === edge.toNodeId)
              if (!fromNode || !toNode) return null
              const from = getNodeCenter(fromNode)
              const to = getNodeCenter(toNode)
              const midX = (from.x + to.x) / 2
              return (
                <g key={edge.id}>
                  <path
                    d={`M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`}
                    fill="none"
                    stroke="rgb(var(--primary))"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                </g>
              )
            })}
          </svg>

          {/* Nodes */}
          {(filteredNodes ?? []).map((node) => (
            <CanvasNode
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              onSelect={() => setSelectedNode(node.id)}
            />
          ))}
        </div>
      </DndContext>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1 rounded-lg border border-border bg-card p-1 shadow-card">
        <button
          type="button"
          onClick={() => setZoom(zoom + 0.25)}
          className="p-2 rounded hover:bg-secondary transition-colors"
          aria-label="Zoom in"
        >
          <span className="text-lg font-bold">+</span>
        </button>
        <span className="text-xs text-center text-muted-foreground px-2">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom(zoom - 0.25)}
          className="p-2 rounded hover:bg-secondary transition-colors"
          aria-label="Zoom out"
        >
          <span className="text-lg font-bold">−</span>
        </button>
      </div>
    </div>
  )
}
