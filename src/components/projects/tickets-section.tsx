/**
 * TicketsSection - Wraps KanbanBoard with project selection when no projectId.
 */

import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchProjects } from '@/api/projects'
import type { Project } from '@/types/projects'
import { KanbanBoard } from './kanban-board'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LayoutGrid } from 'lucide-react'

interface TicketsSectionProps {
  projectId?: string | null
}

export function TicketsSection({ projectId }: TicketsSectionProps) {
  const [searchParams] = useSearchParams()
  const urlProject = searchParams.get('project')
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(
    projectId ?? urlProject ?? null
  )

  useEffect(() => {
    fetchProjects().then((list) => {
      const arr = Array.isArray(list) ? list : []
      setProjects(arr)
      if (!selectedId && arr.length > 0) {
        setSelectedId(urlProject && arr.some((p) => p.id === urlProject) ? urlProject : arr[0].id)
      }
    })
  }, [])

  useEffect(() => {
    if (projectId) setSelectedId(projectId)
    else if (urlProject) setSelectedId(urlProject)
  }, [projectId, urlProject])

  if (!selectedId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <LayoutGrid className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center max-w-sm">
            No projects yet. Create a project to manage tickets.
          </p>
          <Link to="/dashboard/projects">
            <Button variant="outline" className="mt-4">
              View Projects
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {!projectId && projects.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {(projects ?? []).map((p) => (
            <Link key={p.id} to={`/dashboard/projects/tickets?project=${p.id}`}>
              <Button
                variant={selectedId === p.id ? 'default' : 'outline'}
                size="sm"
              >
                {p.name}
              </Button>
            </Link>
          ))}
        </div>
      )}
      <KanbanBoard projectId={selectedId} />
    </div>
  )
}
