/**
 * PRReleasePanel - Unified view of PRs and Releases with linked artifacts, statuses, actions.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GitPullRequest, Tag, CheckCircle, XCircle, Clock } from 'lucide-react'
import type { PR, Release } from '@/types/projects'
import { cn } from '@/lib/utils'

interface PRReleasePanelProps {
  prs?: PR[]
  releases?: Release[]
  isLoading?: boolean
}

const PR_STATUS_COLORS: Record<PR['status'], string> = {
  open: 'bg-primary/20 text-primary',
  merged: 'bg-success/20 text-success',
  closed: 'bg-muted text-muted-foreground',
}

export function PRReleasePanel({
  prs = [],
  releases = [],
  isLoading,
}: PRReleasePanelProps) {
  const prList = Array.isArray(prs) ? prs : []
  const releaseList = Array.isArray(releases) ? releases : []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>PRs & Releases</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 bg-muted/30 rounded-lg animate-pulse" />
            <div className="h-20 bg-muted/30 rounded-lg animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitPullRequest className="h-5 w-5 text-primary" />
          PRs & Releases
        </CardTitle>
        <CardDescription>
          Pull requests and release artifacts from Git providers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Pull Requests
          </h4>
          {prList.length === 0 ? (
            <div className="py-8 text-center rounded-lg border border-dashed border-border">
              <GitPullRequest className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No PRs synced yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Connect a repository to sync PRs
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {prList.map((pr) => (
                <div
                  key={pr.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">
                      #{pr.prNumber} {pr.title ?? 'Untitled'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {pr.provider} {pr.author ? `• ${pr.author}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {Array.isArray(pr.checks) &&
                      pr.checks.map((c) => (
                        <span
                          key={c.name}
                          className="flex items-center gap-1 text-xs"
                          title={c.name}
                        >
                          {c.status === 'success' || c.status === 'passing' ? (
                            <CheckCircle className="h-4 w-4 text-success" />
                          ) : c.status === 'failure' ? (
                            <XCircle className="h-4 w-4 text-destructive" />
                          ) : (
                            <Clock className="h-4 w-4 text-warning" />
                          )}
                        </span>
                      ))}
                    <Badge className={cn('text-xs', PR_STATUS_COLORS[pr.status])}>
                      {pr.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Releases
          </h4>
          {releaseList.length === 0 ? (
            <div className="py-8 text-center rounded-lg border border-dashed border-border">
              <Tag className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No releases yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {releaseList.map((rel) => (
                <div
                  key={rel.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{rel.version}</p>
                    <p className="text-xs text-muted-foreground">
                      {(rel.artifacts ?? []).length} artifact(s) • {rel.status}
                    </p>
                  </div>
                  <Badge
                    variant={rel.status === 'published' ? 'success' : 'secondary'}
                    className="text-xs"
                  >
                    {rel.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
