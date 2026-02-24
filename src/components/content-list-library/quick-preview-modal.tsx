/**
 * QuickPreviewModal - Full metadata, version history, preview content, actions.
 * Focus trap, ARIA roles, keyboard accessible.
 */

import { Link } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FileEdit, Calendar, Send, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContentItem, ContentPreview, ContentVersion } from '@/types/content-dashboard'
import { ContentPipelinePreview } from './content-pipeline-preview'

export interface QuickPreviewModalProps {
  item: ContentItem | null
  preview: ContentPreview | null
  versions: ContentVersion[]
  isLoading: boolean
  open: boolean
  onClose: () => void
  onEdit?: (item: ContentItem) => void
  onPublish?: (item: ContentItem) => void
  onDuplicate?: (item: ContentItem) => void
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export function QuickPreviewModal({
  item,
  preview,
  versions,
  isLoading,
  open,
  onClose,
  onEdit,
  onPublish,
  onDuplicate,
}: QuickPreviewModalProps) {
  const displayPreview = preview ?? (item ? { id: item.id, title: item.title, excerpt: item.excerpt ?? item.summary ?? '', version: item.version ?? 1, author: item.authorId, createdAt: item.createdAt } : null)
  const versionList = versions ?? []

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        aria-describedby="preview-description"
      >
        <DialogHeader>
          <DialogTitle>
            {isLoading ? (
              <Skeleton className="h-6 w-48" />
            ) : (
              displayPreview?.title ?? 'Preview'
            )}
          </DialogTitle>
          <DialogDescription id="preview-description">
            {isLoading
              ? 'Loading...'
              : displayPreview
                ? `Version ${displayPreview.version} • ${formatDate(displayPreview.createdAt)}`
                : 'Content preview'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {displayPreview && (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{item?.status ?? '—'}</Badge>
                  {(item?.tags ?? []).map((t) => (
                    <Badge key={t} variant="outline">
                      {t}
                    </Badge>
                  ))}
                  {displayPreview.author && (
                    <span className="text-sm text-muted-foreground">
                      by {displayPreview.author}
                    </span>
                  )}
                </div>

                {displayPreview.excerpt && (
                  <p className="text-sm text-muted-foreground">
                    {displayPreview.excerpt}
                  </p>
                )}

                {displayPreview.bodyPreview && (
                  <div
                    className={cn(
                      'prose prose-invert prose-sm max-w-none',
                      'text-muted-foreground'
                    )}
                  >
                    <p className="line-clamp-6">{displayPreview.bodyPreview}</p>
                  </div>
                )}

                {item && (
                  <ContentPipelinePreview
                    pipelineStage={item.pipelineStage ?? item.status}
                  />
                )}

                {versionList.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">
                      Version history
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {(versionList ?? []).slice(0, 5).map((v) => (
                        <li key={v.id}>
                          v{v.versionNumber} • {formatDate(v.changedAt)} by{' '}
                          {v.changedBy}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
          {item && (
            <>
              <Button variant="default" size="sm" asChild className="gap-1.5">
                <Link to={`/dashboard/content?item=${item.id}`}>
                  <FileEdit className="h-4 w-4" />
                  Open in Editor
                </Link>
              </Button>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(item)}
                  className="gap-1.5"
                >
                  <FileEdit className="h-4 w-4" />
                  Edit
                </Button>
              )}
              {onPublish && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPublish(item)}
                  className="gap-1.5"
                >
                  <Send className="h-4 w-4" />
                  Publish
                </Button>
              )}
              {onDuplicate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDuplicate(item)}
                  className="gap-1.5"
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-1.5"
              >
                <Link to={`/dashboard/content?item=${item.id}&schedule=true`}>
                  <Calendar className="h-4 w-4" />
                  Schedule
                </Link>
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
