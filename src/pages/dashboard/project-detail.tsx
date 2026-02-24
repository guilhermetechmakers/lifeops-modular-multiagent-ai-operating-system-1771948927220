/**
 * ProjectDetailPage - Deep-dive for a specific project.
 * Roadmap, backlog, agent jobs, run history, release artifacts.
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FolderKanban,
  Map,
  LayoutGrid,
  GitPullRequest,
  Bot,
  History,
  Package,
  ChevronLeft,
} from 'lucide-react'
import { fetchProject, fetchAgentJobs, fetchRunHistory } from '@/api/projects'
import type { Project, AgentJob, RunHistory } from '@/types/projects'
export function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const projectId = params.id ?? null
  const [project, setProject] = useState<Project | null>(null)
  const [agentJobs, setAgentJobs] = useState<AgentJob[]>([])
  const [runHistory, setRunHistory] = useState<RunHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!projectId) return
    let cancelled = false
    setIsLoading(true)
    Promise.all([
      fetchProject(projectId),
      fetchAgentJobs(projectId),
      fetchRunHistory(projectId),
    ])
      .then(([p, jobs, runs]) => {
        if (!cancelled) {
          setProject(p ?? null)
          setAgentJobs(Array.isArray(jobs) ? jobs : [])
          setRunHistory(Array.isArray(runs) ? runs : [])
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => { cancelled = true }
  }, [projectId])

  if (!projectId) {
    return (
      <div className="space-y-6">
        <Link to="/dashboard/projects">
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Project not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/projects">
            <Button variant="ghost" size="icon-sm" aria-label="Back to projects">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="rounded-lg p-2 bg-primary/10">
              <FolderKanban className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{project?.name ?? 'Project'}</h1>
              <p className="text-sm text-muted-foreground">{project?.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-2">
        <Link to={`/dashboard/projects/${projectId}/roadmaps`}>
          <Button variant="outline" size="sm" className="gap-2">
            <Map className="h-4 w-4" />
            Roadmap
          </Button>
        </Link>
        <Link to={`/dashboard/projects/${projectId}/tickets`}>
          <Button variant="outline" size="sm" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Tickets
          </Button>
        </Link>
        <Link to={`/dashboard/projects/${projectId}/prs-releases`}>
          <Button variant="outline" size="sm" className="gap-2">
            <GitPullRequest className="h-4 w-4" />
            PRs & Releases
          </Button>
        </Link>
        <Link to={`/dashboard/projects/${projectId}/artifacts`}>
          <Button variant="outline" size="sm" className="gap-2">
            <Package className="h-4 w-4" />
            Artifacts
          </Button>
        </Link>
      </div>

      {/* Agent jobs + Run history - Bento */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Agent Jobs
            </CardTitle>
            <CardDescription>Recent agent run statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(agentJobs ?? []).slice(0, 5).map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <span className="text-sm font-medium">{job.agentId}</span>
                  <Badge
                    variant={
                      job.status === 'success' ? 'success' : job.status === 'failure' ? 'destructive' : 'secondary'
                    }
                  >
                    {job.status}
                  </Badge>
                </div>
              ))}
              {agentJobs.length === 0 && (
                <p className="text-sm text-muted-foreground py-4">No agent jobs yet</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Run History
            </CardTitle>
            <CardDescription>Recent pipeline runs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(runHistory ?? []).slice(0, 5).map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <span className="text-sm truncate">{run.summary ?? run.runId}</span>
                  <Badge
                    variant={
                      run.status === 'success' ? 'success' : run.status === 'failure' ? 'destructive' : 'secondary'
                    }
                  >
                    {run.status}
                  </Badge>
                </div>
              ))}
              {runHistory.length === 0 && (
                <p className="text-sm text-muted-foreground py-4">No runs yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
