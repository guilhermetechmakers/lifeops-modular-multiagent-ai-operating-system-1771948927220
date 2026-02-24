/**
 * RoadmapView - Milestones with AI-assisted prioritization.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Calendar, ListTodo } from 'lucide-react'
import type { Roadmap, Milestone } from '@/types/projects'
import { cn } from '@/lib/utils'

interface RoadmapViewProps {
  roadmap?: Roadmap | null
  isLoading?: boolean
}

const STATUS_COLORS: Record<Milestone['status'], string> = {
  pending: 'bg-muted/50 text-muted-foreground',
  'in-progress': 'bg-primary/20 text-primary',
  completed: 'bg-success/20 text-success',
}

export function RoadmapView({ roadmap, isLoading }: RoadmapViewProps) {
  const milestones = Array.isArray(roadmap?.milestones) ? roadmap.milestones : []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Roadmap</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-primary" />
          Roadmap
        </CardTitle>
        <CardDescription>
          Milestones and AI-assisted prioritization
        </CardDescription>
        {roadmap?.aiInsights && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
            <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">{roadmap.aiInsights}</p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {milestones.length === 0 ? (
          <div className="py-12 text-center rounded-lg border border-dashed border-border">
            <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No milestones yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 transition-colors"
              >
                <div>
                  <p className="font-semibold">{m.title}</p>
                  {m.dueDate && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(m.dueDate).toLocaleDateString()}
                    </p>
                  )}
                  {(m.tickets ?? []).length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {(m.tickets ?? []).length} ticket(s)
                    </p>
                  )}
                </div>
                <Badge className={cn('text-xs', STATUS_COLORS[m.status])}>
                  {m.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
