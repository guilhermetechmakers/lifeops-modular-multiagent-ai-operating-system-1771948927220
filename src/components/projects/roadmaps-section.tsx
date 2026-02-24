/**
 * RoadmapsSection - Roadmap view with milestones and AI-assisted prioritization.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Map, Plus, Sparkles, ChevronRight } from 'lucide-react'
import { fetchProjects, fetchRoadmap } from '@/api/projects'
import type { Project, Roadmap } from '@/types/projects'

interface RoadmapsSectionProps {
  projectId?: string | null
}

export function RoadmapsSection({ projectId }: RoadmapsSectionProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projectId ?? null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      try {
        const projs = await fetchProjects()
        if (!cancelled) setProjects(projs ?? [])
        const pid = projectId ?? projs?.[0]?.id
        if (pid && !cancelled) {
          setSelectedProjectId(pid)
          const rm = await fetchRoadmap(pid)
          if (!cancelled) setRoadmap(rm ?? null)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [projectId])

  useEffect(() => {
    if (!selectedProjectId) return
    let cancelled = false
    fetchRoadmap(selectedProjectId).then((rm) => {
      if (!cancelled) setRoadmap(rm ?? null)
    })
    return () => { cancelled = true }
  }, [selectedProjectId])

  const milestones = Array.isArray(roadmap?.milestones) ? roadmap.milestones : []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Map className="h-6 w-6 text-primary" />
            Roadmaps
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Milestones and AI-assisted prioritization
          </p>
        </div>
      </div>

      {!projectId && projects.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {(projects ?? []).map((p) => (
            <Button
              key={p.id}
              variant={selectedProjectId === p.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedProjectId(p.id)}
            >
              {p.name}
            </Button>
          ))}
        </div>
      )}

      {roadmap?.aiInsights && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">AI Insights</p>
              <p className="text-sm text-muted-foreground">{roadmap.aiInsights}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {milestones.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Map className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center max-w-sm">
                No milestones yet. Add milestones to track progress.
              </p>
              <Button variant="outline" className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Add Milestone
              </Button>
            </CardContent>
          </Card>
        ) : (
          milestones.map((m) => (
            <Card
              key={m.id}
              className="transition-all duration-300 hover:shadow-card-hover hover:border-primary/30"
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{m.title}</CardTitle>
                  <CardDescription>
                    {m.dueDate ? `Due ${new Date(m.dueDate).toLocaleDateString()}` : 'No due date'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      m.status === 'completed' ? 'success' : m.status === 'in-progress' ? 'default' : 'secondary'
                    }
                  >
                    {m.status}
                  </Badge>
                  {selectedProjectId && (
                    <Link to={`/dashboard/projects/${selectedProjectId}/tickets`}>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              {Array.isArray(m.tickets) && m.tickets.length > 0 && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    {m.tickets.length} ticket{m.tickets.length !== 1 ? 's' : ''} in this milestone
                  </p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
