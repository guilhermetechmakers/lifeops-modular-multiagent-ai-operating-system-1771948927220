/**
 * ProjectsOverviewPanel - Roadmaps, tickets, PRs, releases, CI triggers.
 */

import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FolderKanban, Plus, GitPullRequest, Ticket } from 'lucide-react'

export function ProjectsOverviewPanel() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-primary" />
            Projects
          </CardTitle>
          <CardDescription>
            Roadmaps, tickets, PRs, releases, CI triggers
          </CardDescription>
        </div>
        <Link to="/dashboard/projects">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Link to="/dashboard/projects">
            <Button variant="outline" size="sm" className="gap-2">
              <Ticket className="h-4 w-4" />
              Tickets
            </Button>
          </Link>
          <Link to="/dashboard/projects">
            <Button variant="outline" size="sm" className="gap-2">
              <GitPullRequest className="h-4 w-4" />
              PRs
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
