/**
 * ContentCard - Card-based content item with status, metadata, pipeline preview.
 */

import { useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FileText, ExternalLink } from 'lucide-react'
import { ContentPipelinePreview } from './content-pipeline-preview'
import type { ContentItem } from '@/types/content-dashboard'
import { cn } from '@/lib/utils'

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return iso
  }
}

export interface ContentCardProps {
  item: ContentItem
  viewMode: 'grid' | 'list'
  selected?: boolean
  onSelect?: (id: string) => void
  onPreview?: (item: ContentItem) => void
  onOpen?: (item: ContentItem) => void
  showPipeline?: boolean
}

export function ContentCard({
  item,
  viewMode,
  selected = false,
  onSelect,
  onPreview,
  onOpen,
  showPipeline = true,
}: ContentCardProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('button, [role="checkbox"]')) return
      onPreview?.(item)
    },
    [item, onPreview]
  )

  const handleOpen = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onOpen?.(item)
    },
    [item, onOpen]
  )

  const tags = (item.tags ?? []).slice(0, 3)

  const isGrid = viewMode === 'grid'

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-200 relative',
        'hover:shadow-card-hover hover:border-primary/30',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        selected && 'ring-2 ring-primary border-primary/50'
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onPreview?.(item)
        }
      }}
      aria-label={`View ${item.title}`}
    >
      <CardContent className={cn('p-4', isGrid ? '' : 'flex items-center gap-4')}>
        {onSelect && (
          <div
            className={cn('shrink-0', isGrid ? 'absolute top-3 left-3 z-10' : '')}
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={selected}
              onCheckedChange={() => onSelect(item.id)}
              aria-label={`Select ${item.title}`}
            />
          </div>
        )}
        <div className={cn('flex-1 min-w-0', onSelect && isGrid && 'pl-8')}>
          {isGrid ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate">{item.title}</h3>
                  {item.summary && (
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                      {item.summary}
                    </p>
                  )}
                </div>
                <div className="shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-xs">
                  {item.status}
                </Badge>
                {(tags ?? []).map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
              {showPipeline && (
                <div className="mt-2">
                  <ContentPipelinePreview currentStage={item.status} variant="chips" />
                </div>
              )}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {formatDate(item.updatedAt ?? item.createdAt)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleOpen}
                  aria-label={`Open ${item.title} in editor`}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate">{item.title}</h3>
                  {item.summary && (
                    <p className="text-sm text-muted-foreground truncate">{item.summary}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary">{item.status}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.updatedAt ?? item.createdAt)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleOpen}
                    aria-label={`Open ${item.title} in editor`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(tags ?? []).map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">
                    {t}
                  </Badge>
                ))}
                {showPipeline && (
                  <ContentPipelinePreview currentStage={item.status} variant="chips" />
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
