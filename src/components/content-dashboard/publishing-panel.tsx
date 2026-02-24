/**
 * PublishingPanel - Platform status, per-platform controls, retry/logs.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Send, X, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react'
import type { ContentItem } from '@/types/content-dashboard'

interface PlatformStatus {
  id: string
  name: string
  type: string
  status: 'success' | 'failed' | 'pending' | 'in-progress'
}

const SAMPLE_PLATFORMS: PlatformStatus[] = [
  { id: 'p1', name: 'Blog CMS', type: 'CMS', status: 'success' },
  { id: 'p2', name: 'Twitter/X', type: 'Social', status: 'pending' },
  { id: 'p3', name: 'Newsletter', type: 'Newsletter', status: 'in-progress' },
]

interface PublishingPanelProps {
  contentItem: ContentItem
  onClose: () => void
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-success" />
    case 'failed':
      return <XCircle className="h-4 w-4 text-destructive" />
    case 'in-progress':
      return <RefreshCw className="h-4 w-4 text-primary animate-spin" />
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />
  }
}

export function PublishingPanel({ contentItem, onClose }: PublishingPanelProps) {
  const platforms = (contentItem?.platforms ?? []).length
    ? SAMPLE_PLATFORMS.filter((p) => contentItem.platforms.includes(p.id))
    : SAMPLE_PLATFORMS

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          Publishing
        </CardTitle>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">{contentItem?.title ?? 'Untitled'}</p>
          {contentItem?.publishAt && (
            <p className="text-xs text-muted-foreground">
              Scheduled: {new Date(contentItem.publishAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Platforms</p>
          {(platforms ?? []).map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/30"
            >
              <div className="flex items-center gap-2">
                <StatusIcon status={p.status} />
                <div>
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    p.status === 'success'
                      ? 'success'
                      : p.status === 'failed'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {p.status}
                </Badge>
                {p.status === 'failed' && (
                  <Button size="sm" variant="outline">
                    <RefreshCw className="h-3 w-3" />
                    Retry
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
