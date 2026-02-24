/**
 * PipelineBoard - Kanban-style board with drag-and-drop.
 * Columns: Idea → Research → Draft → Edit → Review → Scheduled → Published.
 */

import { useCallback, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import type { ContentItem, ContentStatus } from '@/types/content-dashboard'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Lightbulb,
  Search,
  FileText,
  Edit,
  Eye,
  Calendar,
  Send,
  GripVertical,
  MoreHorizontal,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const COLUMNS: { status: ContentStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { status: 'Idea', label: 'Idea', icon: Lightbulb },
  { status: 'Research', label: 'Research', icon: Search },
  { status: 'Draft', label: 'Draft', icon: FileText },
  { status: 'Edit', label: 'Edit', icon: Edit },
  { status: 'Review', label: 'Review', icon: Eye },
  { status: 'Scheduled', label: 'Scheduled', icon: Calendar },
  { status: 'Published', label: 'Published', icon: Send },
]

interface PipelineBoardProps {
  items: ContentItem[]
  onMoveItem: (id: string, newStatus: ContentStatus) => void
  onSelectItem: (item: ContentItem) => void
  isLoading?: boolean
}

function DraggableCard({
  item,
  onSelect,
  onActions,
}: {
  item: ContentItem
  onSelect: () => void
  onActions: (action: string) => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id })
  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <PipelineCard item={item} isDragging={isDragging} onSelect={onSelect} onActions={onActions} />
    </div>
  )
}

function PipelineCard({
  item,
  isDragging,
  onSelect,
  onActions,
}: {
  item: ContentItem
  isDragging?: boolean
  onSelect: () => void
  onActions: (action: string) => void
}) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:border-primary/30',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isDragging && 'opacity-90 shadow-lg ring-2 ring-primary'
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-2">
          <div
            className="mt-1 cursor-grab active:cursor-grabbing touch-none"
            aria-hidden
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{item.title}</p>
            {item.summary && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.summary}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {(item.tags ?? []).slice(0, 2).map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px]">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0"
                onClick={(e) => e.stopPropagation()}
                aria-label="Item actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => onActions('edit')}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onActions('schedule')}>Schedule</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onActions('publish')}>Publish</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

function DroppableColumn({
  status,
  label,
  icon: Icon,
  items,
  onSelect,
  onActions,
  isOver,
}: {
  status: ContentStatus
  label: string
  icon: React.ComponentType<{ className?: string }>
  items: ContentItem[]
  onSelect: (item: ContentItem) => void
  onActions: (item: ContentItem, action: string) => void
  isOver?: boolean
}) {
  const { setNodeRef } = useDroppable({ id: `col-${status}` })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col min-w-[220px] w-[220px] rounded-xl border-2 border-dashed transition-colors duration-200',
        isOver ? 'border-primary bg-primary/5' : 'border-border bg-card/30'
      )}
      data-status={status}
    >
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <Icon className="h-4 w-4 text-primary" />
        <span className="font-semibold text-sm">{label}</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          {(items ?? []).length}
        </Badge>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[120px]">
        {(items ?? []).map((item) => (
          <DraggableCard
            key={item.id}
            item={item}
            onSelect={() => onSelect(item)}
            onActions={(action) => onActions(item, action)}
          />
        ))}
      </div>
    </div>
  )
}

export function PipelineBoard({
  items,
  onMoveItem,
  onSelectItem,
  isLoading,
}: PipelineBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  )

  const itemsByStatus = useCallback(() => {
    const map: Record<ContentStatus, ContentItem[]> = {
      Idea: [],
      Research: [],
      Draft: [],
      Edit: [],
      Review: [],
      Scheduled: [],
      Published: [],
    }
    ;(items ?? []).forEach((i) => {
      if (map[i.status]) map[i.status].push(i)
    })
    return map
  }, [items])

  const grouped = itemsByStatus()
  const activeItem = activeId ? (items ?? []).find((i) => i.id === activeId) : null

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event?.over ? String(event.over.id) : null)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null)
      setOverId(null)
      const { active, over } = event
      if (!over) return
      const overStr = String(over.id)
      let targetStatus: ContentStatus | undefined
      if (overStr.startsWith('col-')) {
        targetStatus = overStr.replace('col-', '') as ContentStatus
      } else {
        const overItem = (items ?? []).find((i) => i.id === overStr)
        targetStatus = overItem?.status
      }
      if (targetStatus && COLUMNS.some((c) => c.status === targetStatus)) {
        const itemId = String(active.id)
        const item = (items ?? []).find((i) => i.id === itemId)
        if (item && item.status !== targetStatus) {
          onMoveItem(itemId, targetStatus)
        }
      }
    },
    [onMoveItem, items]
  )

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 animate-pulse">
        {COLUMNS.map((c) => (
          <div key={c.status} className="min-w-[220px] w-[220px] rounded-xl border border-border bg-card/30 p-4">
            <div className="h-5 bg-muted rounded w-24 mb-4" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToHorizontalAxis]}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" role="region" aria-label="Content pipeline">
        {COLUMNS.map((col) => (
          <DroppableColumn
            key={col.status}
            status={col.status}
            label={col.label}
            icon={col.icon}
            items={grouped[col.status] ?? []}
            onSelect={onSelectItem}
            onActions={(item, action) => {
              if (action === 'edit') onSelectItem(item)
            }}
            isOver={overId === `col-${col.status}` || overId === col.status}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="opacity-95">
            <PipelineCard
              item={activeItem}
              isDragging
              onSelect={() => {}}
              onActions={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
