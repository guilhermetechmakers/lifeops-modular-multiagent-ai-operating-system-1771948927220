/**
 * PipelineColumn - Droppable column for a pipeline stage.
 */

import { useDroppable } from '@dnd-kit/core'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { ContentItem, ContentStatus } from '@/types/content-dashboard'
import { cn } from '@/lib/utils'
import { PipelineCard } from './pipeline-card'

interface PipelineColumnProps {
  id: ContentStatus
  label: string
  items: ContentItem[]
  onItemClick?: (item: ContentItem) => void
  onStatusChange?: (id: string, status: ContentStatus) => Promise<void>
  onAddItem?: (status: ContentStatus) => void
}

export function PipelineColumn({ id, label, items, onItemClick, onStatusChange, onAddItem }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  const displayItems = Array.isArray(items) ? items : []

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        'min-w-[280px] shrink-0 flex flex-col transition-all duration-200',
        isOver && 'ring-2 ring-primary/50 bg-primary/5'
      )}
    >
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <h3 className="text-sm font-semibold">{label}</h3>
        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
          {displayItems.length}
        </span>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]">
        {displayItems.map((item) => (
          <PipelineCard
            key={item.id}
            item={item}
            onClick={() => onItemClick?.(item)}
            onStatusChange={onStatusChange}
          />
        ))}
        {onAddItem && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground mt-2"
            onClick={() => onAddItem(id)}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
