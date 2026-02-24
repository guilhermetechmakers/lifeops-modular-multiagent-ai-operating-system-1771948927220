/**
 * ProjectsOverview - Main dashboard with projects grid and section cards.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FolderKanban,
  Map,
  LayoutGrid,
  GitPullRequest,
  Zap,
  FileCode,
  Plug,
  Plus,
  ChevronRight,
  ListTodo,
  GitBranch,
} from 'lucide-react'
import { fetchProjects } from '@/api/projects'
import type { Project } from '@/types/projects'
import { cn } from '@/lib/utils'

const SECTION_CARDS = [
  { to: 'roadmaps', icon: Map, label: 'Roadmaps', desc: 'Milestones and AI prioritization' },
  { to: 'tickets', icon: LayoutGrid, label: 'Tickets', desc: 'Kanban board with AI triage' },
  { to: 'prs-releases', icon: GitPullRequest, label: 'PRs & Releases', desc: 'Linked artifacts and statuses' },
  { to: 'ci-triggers', icon: Zap, label: 'CI Triggers', desc: 'Pipelines and automation' },
  { to: 'templates', icon: FileCode, label: 'Templates', desc: 'Release pipelines, changelogs' },
  { to: 'integrations', icon: Plug, label: 'Integrations', desc: 'GitHub, GitLab, CI/CD' },
]

export function ProjectsOverview() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    fetchProjects().then((list) => {
      if (!cancelled) {
        setProjects(Array.isArray(list) ? list : [])
        setIsLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-8 animate-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Developer automation: roadmaps, tickets, PRs, CI
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Projects grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Projects</h2>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(projects ?? []).map((project) => (
              <Link key={project.id} to={`/dashboard/projects/${project.id}`}>
                <Card
                  className={cn(
                    'transition-all duration-300 hover:shadow-card-hover hover:border-primary/30',
                    'cursor-pointer'
                  )}
                >
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg p-2 bg-primary/10">
                        <FolderKanban className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <CardDescription>
                          {project.lastSync ? `Synced ${project.lastSync}` : 'No sync'}
                        </CardDescription>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ListTodo className="h-4 w-4" />
                        {project.ticketsCount ?? 0} tickets
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <GitBranch className="h-4 w-4" />
                        {project.prsCount ?? 0} PRs
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && projects.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center max-w-sm">
                No projects yet. Create your first project to get started.
              </p>
              <Button className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Section cards - Bento grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(SECTION_CARDS ?? []).map((s) => (
            <Link key={s.to} to={`/dashboard/projects/${s.to}`}>
              <Card
                className={cn(
                  'transition-all duration-300 hover:shadow-card-hover hover:border-primary/30',
                  'cursor-pointer h-full'
                )}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="rounded-lg p-3 bg-primary/10">
                    <s.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{s.label}</p>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
