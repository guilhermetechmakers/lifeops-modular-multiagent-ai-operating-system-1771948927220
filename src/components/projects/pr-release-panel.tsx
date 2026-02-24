/**
 * PRReleasePanel - Unified view of PRs and Releases with linked artifacts, statuses, actions.
 */

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { GitPullRequest, Tag, CheckCircle, XCircle, Clock } from 'lucide-react'
import { fetchProjects, fetchPRs, fetchReleases } from '@/api/projects'
import type { PR, Release } from '@/types/projects'

interface PRReleasePanelProps {
  projectId?: string | null
}

export function PRReleasePanel({ projectId: propProjectId }: PRReleasePanelProps) {
  const [projectId, setProjectId] = useState<string | null>(propProjectId ?? null)
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])
  const [prs, setPrs] = useState<PR[]>([])
  const [releases, setReleases] = useState<Release[]>([])
  const [activeTab, setActiveTab] = useState<'prs' | 'releases'>('prs')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setProjectId(propProjectId ?? null)
  }, [propProjectId])

  useEffect(() => {
    if (!propProjectId) {
      fetchProjects().then((list) => {
        const arr = Array.isArray(list) ? list : []
        setProjects(arr.map((p) => ({ id: p.id, name: p.name })))
        if (arr.length > 0 && !projectId) setProjectId(arr[0].id)
      })
    }
  }, [propProjectId])

  useEffect(() => {
    if (!projectId) {
      setPrs([])
      setReleases([])
      setIsLoading(false)
      return
    }
    let cancelled = false
    setIsLoading(true)
    Promise.all([fetchPRs(projectId), fetchReleases(projectId)])
      .then(([pList, rList]) => {
        if (!cancelled) {
          setPrs(Array.isArray(pList) ? pList : [])
          setReleases(Array.isArray(rList) ? rList : [])
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => { cancelled = true }
  }, [projectId])

  if (!projectId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <GitPullRequest className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center max-w-sm">
            {projects.length === 0 ? 'No projects yet. Create a project first.' : 'Select a project to view PRs and releases'}
          </p>
          {projects.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {projects.map((p) => (
                <Button
                  key={p.id}
                  variant="outline"
                  size="sm"
                  onClick={() => setProjectId(p.id)}
                >
                  {p.name}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  const CheckIcon = ({ status }: { status: string }) =>
    status === 'passing' ? (
      <CheckCircle className="h-4 w-4 text-success" />
    ) : status === 'failing' ? (
      <XCircle className="h-4 w-4 text-destructive" />
    ) : (
      <Clock className="h-4 w-4 text-muted-foreground" />
    )

  return (
    <div className="space-y-6 animate-in-up">
      {!propProjectId && projects.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {projects.map((p) => (
            <Button
              key={p.id}
              variant={projectId === p.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setProjectId(p.id)}
            >
              {p.name}
            </Button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab('prs')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'prs'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          PRs ({prs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('releases')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'releases'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Releases ({releases.length})
        </button>
      </div>

      {activeTab === 'prs' && (
        <div className="space-y-3">
          {prs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No open PRs</p>
              </CardContent>
            </Card>
          ) : (
            (prs ?? []).map((pr) => (
              <Card key={pr.id} className="transition-all duration-300 hover:shadow-card-hover">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <GitPullRequest className="h-5 w-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{pr.title ?? `PR #${pr.prNumber}`}</p>
                      <p className="text-sm text-muted-foreground">
                        #{pr.prNumber} • {pr.provider}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {Array.isArray(pr.checks) &&
                      pr.checks.map((c) => (
                        <div key={c.name} className="flex items-center gap-1">
                          <CheckIcon status={c.status} />
                          <span className="text-xs">{c.name}</span>
                        </div>
                      ))}
                    <Badge
                      variant={
                        pr.status === 'merged' ? 'success' : pr.status === 'closed' ? 'secondary' : 'default'
                      }
                    >
                      {pr.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'releases' && (
        <div className="space-y-3">
          {releases.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No releases yet</p>
              </CardContent>
            </Card>
          ) : (
            (releases ?? []).map((rel) => (
              <Card key={rel.id} className="transition-all duration-300 hover:shadow-card-hover">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Tag className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{rel.version}</p>
                      <p className="text-sm text-muted-foreground">{rel.releaseNotes}</p>
                    </div>
                  </div>
                  <Badge variant={rel.status === 'published' ? 'success' : 'secondary'}>
                    {rel.status}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
