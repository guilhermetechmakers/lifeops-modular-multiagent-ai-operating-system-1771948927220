/**
 * QuickPreviewModal - Full metadata, version history, preview content, actions.
 */

import { useState, useEffect, useCallback } from 'react'
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
import { ContentPipelinePreview } from './content-pipeline-preview'
import {
  FileText,
  Calendar,
  Send,
  Copy,
  ExternalLink,
  History,
} from 'lucide-react'
import type { ContentItem, ContentPreview, ContentVersion } from '@/types/content-dashboard'

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export interface QuickPreviewModalProps {
  item: ContentItem | null
  open: boolean
  onClose: () => void
  onEdit?: (item: ContentItem) => void
  onPublish?: (item: ContentItem) => void
  onSchedule?: (item: ContentItem) => void
  onDuplicate?: (item: ContentItem) => void
  fetchPreview?: (id: string) => Promise<ContentPreview | null>
  fetchVersions?: (id: string) => Promise<ContentVersion[]>
}

export function QuickPreviewModal({
  item,
  open,
  onClose,
  onEdit,
  onPublish,
  onSchedule,
  onDuplicate,
  fetchPreview,
  fetchVersions,
}: QuickPreviewModalProps) {
  const [preview, setPreview] = useState<ContentPreview | null>(null)
  const [versions, setVersions] = useState<ContentVersion[]>([])
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [loadingVersions, setLoadingVersions] = useState(false)

  const loadPreview = useCallback(async () => {
    if (!item?.id || !fetchPreview) return
    setLoadingPreview(true)
    try {
      const p = await fetchPreview(item.id)
      setPreview(p ?? null)
    } finally {
      setLoadingPreview(false)
    }
  }, [item?.id, fetchPreview])

  const loadVersions = useCallback(async () => {
    if (!item?.id || !fetchVersions) return
    setLoadingVersions(true)
    try {
      const v = await fetchVersions(item.id)
      setVersions(Array.isArray(v) ? v : [])
    } finally {
      setLoadingVersions(false)
    }
  }, [item?.id, fetchVersions])

  useEffect(() => {
    if (open && item?.id) {
      loadPreview()
      loadVersions()
    } else {
      setPreview(null)
      setVersions([])
    }
  }, [open, item?.id, loadPreview, loadVersions])

  if (!item) return null

  const displayPreview = preview ?? {
    id: item.id,
    title: item.title,
    excerpt: item.summary ?? '',
    bodyPreview: item.summary?.slice(0, 300),
    version: item.version ?? 1,
    author: item.authorId,
    createdAt: item.createdAt,
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {item.title}
          </DialogTitle>
          <DialogDescription>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary">{item.status}</Badge>
              <span className="text-muted-foreground text-sm">
                v{displayPreview.version} • Updated {formatDate(item.updatedAt ?? item.createdAt)}
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <ContentPipelinePreview currentStage={item.status} variant="progress" />

          {loadingPreview ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <div>
              {displayPreview.excerpt && (
                <p className="text-sm text-muted-foreground">{displayPreview.excerpt}</p>
              )}
              {displayPreview.bodyPreview && (
                <div className="mt-3 p-4 rounded-lg bg-muted/50 text-sm">
                  <p className="line-clamp-6 text-muted-foreground">{displayPreview.bodyPreview}</p>
                </div>
              )}
            </div>
          )}

          {(item.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(item.tags ?? []).map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
            </div>
          )}

          {fetchVersions && (
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <History className="h-4 w-4" />
                Version history
              </h4>
              {loadingVersions ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (versions ?? []).length > 0 ? (
                <ul className="space-y-1 text-sm">
                  {(versions ?? []).slice(0, 5).map((v) => (
                    <li key={v.id} className="flex justify-between text-muted-foreground">
                      <span>v{v.versionNumber}</span>
                      <span>{formatDate(v.changedAt)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No version history</p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
            {onEdit && (
              <Button variant="default" size="sm" onClick={() => onEdit(item)} className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Open in Editor
              </Button>
            )}
            {onSchedule && (
              <Button variant="outline" size="sm" onClick={() => onSchedule(item)} className="gap-2">
                <Calendar className="h-4 w-4" />
                Schedule
              </Button>
            )}
            {onPublish && item.status !== 'Published' && (
              <Button variant="outline" size="sm" onClick={() => onPublish(item)} className="gap-2">
                <Send className="h-4 w-4" />
                Publish
              </Button>
            )}
            {onDuplicate && (
              <Button variant="outline" size="sm" onClick={() => onDuplicate(item)} className="gap-2">
                <Copy className="h-4 w-4" />
                Duplicate
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
