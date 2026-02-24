import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Play, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

const MOCK_CRONJOBS = [
  { id: 1, name: 'Weekly Content Ideas', schedule: '0 9 * * 1', nextRun: 'Mon 9:00 AM', status: 'active', module: 'Content' },
  { id: 2, name: 'Monthly Finance Close', schedule: '0 0 1 * *', nextRun: '1st of month', status: 'active', module: 'Finance' },
  { id: 3, name: 'Daily Sync', schedule: '0 8 * * *', nextRun: 'Tomorrow 8:00 AM', status: 'paused', module: 'Projects' },
]

export function CronjobsDashboard() {
  return (
    <div className="space-y-8 animate-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Cronjobs</h1>
          <p className="text-muted-foreground mt-1">
            Manage scheduled jobs and workflows
          </p>
        </div>
        <Link to="/dashboard/cronjobs/new">
          <Button>
            <Plus className="h-4 w-4" />
            Create Cronjob
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search cronjobs..." className="pl-9" />
            </div>
            <Button variant="outline">Filters</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Schedule</th>
                  <th className="text-left p-4 font-medium">Next Run</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_CRONJOBS.map((job) => (
                  <tr key={job.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <Link to={`/dashboard/cronjobs/${job.id}`} className="font-medium hover:text-primary">
                        {job.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">{job.module}</p>
                    </td>
                    <td className="p-4 font-mono text-sm">{job.schedule}</td>
                    <td className="p-4 text-sm">{job.nextRun}</td>
                    <td className="p-4">
                      <span
                        className={cn(
                          'text-xs px-2 py-1 rounded',
                          job.status === 'active'
                            ? 'bg-success/20 text-success'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon-sm" title="Run now">
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
