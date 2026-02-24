import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FolderKanban, GitBranch, ListTodo } from 'lucide-react'
const MOCK_PROJECTS = [
  { id: 1, name: 'LifeOps Platform', tickets: 12, prs: 3, lastSync: '2 min ago' },
  { id: 2, name: 'Marketing Site', tickets: 5, prs: 1, lastSync: '1 hr ago' },
]

export function ProjectsDashboard() {
  return (
    <div className="space-y-8 animate-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Developer automation: roadmaps, tickets, PRs, CI
          </p>
        </div>
        <Link to="/dashboard/cronjobs">
          <Button>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {MOCK_PROJECTS.map((project) => (
          <Card key={project.id} className="transition-all duration-300 hover:shadow-card-hover">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2 bg-primary/10">
                  <FolderKanban className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>Last synced {project.lastSync}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <ListTodo className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{project.tickets} open tickets</span>
                </div>
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{project.prs} open PRs</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center max-w-sm">
            Connect a repository to get started. We&apos;ll sync your roadmap, tickets, and PRs.
          </p>
          <Button variant="outline" className="mt-4">
            Connect Repository
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
