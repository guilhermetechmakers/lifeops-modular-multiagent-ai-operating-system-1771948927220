/**
 * PipelineCard - Draggable card for a content item in the pipeline.
 */

import { useDraggable } from '@dnd-kit/core'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GripVertical, MoreHorizontal, Pencil } from 'lucide-react'
import type { ContentItem, ContentStatus } from '@/types/content-dashboard'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface PipelineCardProps {
  item: ContentItem
  isDragging?: boolean
  onClick?: () => void
  onStatusChange?: (id: string, status: ContentStatus) => Promise<void>
}

export function PipelineCard({ item, isDragging, onClick, onStatusChange }: PipelineCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging: dndDragging } = useDraggable({
    id: item.id,
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'cursor-grab active:cursor-grabbing transition-all duration-200',
        'hover:shadow-card-hover hover:border-primary/30',
        (isDragging ?? dndDragging) && 'opacity-50 shadow-lg'
      )}
    >
      <CardContent className="p-4" onClick={onClick}>
        <div className="flex items-start gap-2">
          <button
            type="button"
            className="touch-none shrink-0 p-1 rounded hover:bg-muted/50 -ml-1"
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{item.title}</p>
            {item.summary && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.summary}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onClick?.()}>Open details</DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/content/${item.id}/edit`} className="flex items-center gap-2">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void onStatusChange?.(item.id, 'Research')}>
                Move to Research
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void onStatusChange?.(item.id, 'Draft')}>
                Move to Draft
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
