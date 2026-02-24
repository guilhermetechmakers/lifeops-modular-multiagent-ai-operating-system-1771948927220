/**
 * ContentCard - Card-based item showing title, status, author, date, excerpt, tags.
 * Grid and list variants with hover elevation and click handlers.
 */

import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { FileText, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContentItem } from '@/types/content-dashboard'
import { ContentPipelinePreview } from './content-pipeline-preview'

export interface ContentCardProps {
  item: ContentItem
  viewMode?: 'grid' | 'list'
  selected?: boolean
  onPreview?: (item: ContentItem) => void
  onOpen?: (item: ContentItem) => void
  onSelect?: (item: ContentItem, selected: boolean) => void
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    })
  } catch {
    return ''
  }
}

export function ContentCard({
  item,
  viewMode = 'grid',
  selected = false,
  onPreview,
  onSelect,
}: ContentCardProps) {
  const excerpt = item.excerpt ?? item.summary ?? ''
  const tags = item.tags ?? []

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('button, a, [role="checkbox"]')) return
      onPreview?.(item)
    },
    [item, onPreview]
  )

  const handleSelectChange = useCallback(
    (checked: boolean | 'indeterminate') => {
      onSelect?.(item, checked === true)
    },
    [item, onSelect]
  )

  const isList = viewMode === 'list'

  const thumbnail = item.thumbnailUrl ? (
    <img
      src={item.thumbnailUrl}
      alt=""
      className="w-full h-full object-cover"
    />
  ) : (
    <FileText className="h-8 w-8 text-muted-foreground" aria-hidden />
  )

  return (
    <Card
      className={cn(
        'transition-all duration-200 cursor-pointer relative',
        'hover:shadow-card-hover hover:border-primary/30',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        selected && 'ring-2 ring-primary border-primary/50',
        isList && 'flex flex-row'
      )}
      onClick={handleClick}
      role="article"
      aria-label={item.title}
    >
      <CardContent
        className={cn(
          'p-4',
          isList
            ? 'flex flex-1 items-center gap-4 min-w-0 w-full'
            : 'flex flex-col'
        )}
      >
        {onSelect && (
          <div
            className={cn(
              'shrink-0 flex items-center',
              !isList && 'absolute top-4 left-4 z-10'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={selected}
              onCheckedChange={handleSelectChange}
              aria-label={`Select ${item.title}`}
            />
          </div>
        )}
        <div
          className={cn(
            'rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0',
            isList ? 'w-14 h-14' : 'aspect-video w-full',
            !isList && onSelect && 'mt-6'
          )}
        >
          {thumbnail}
        </div>
        <div className={cn('flex-1 min-w-0', !isList && 'mt-3')}>
          <h3 className="font-semibold truncate">{item.title}</h3>
          {excerpt && (
            <p
              className={cn(
                'text-sm text-muted-foreground mt-0.5',
                isList ? 'line-clamp-1' : 'line-clamp-2'
              )}
            >
              {excerpt}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {item.status}
            </Badge>
            {(tags ?? []).slice(0, 3).map((t) => (
              <Badge key={t} variant="outline" className="text-xs">
                {t}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{formatDate(item.updatedAt)}</span>
            {item.authorId && (
              <>
                <span aria-hidden>•</span>
                <span>{item.authorId}</span>
              </>
            )}
          </div>
          <ContentPipelinePreview
            pipelineStage={item.pipelineStage ?? item.status}
            className="mt-2"
          />
        </div>
        <div
          className={cn(
            'flex gap-2 shrink-0',
            !isList && 'mt-3 pt-3 border-t border-border'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPreview?.(item)}
            aria-label={`Preview ${item.title}`}
          >
            Preview
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link to={`/dashboard/content/${item.id}/edit`} className="gap-1">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
