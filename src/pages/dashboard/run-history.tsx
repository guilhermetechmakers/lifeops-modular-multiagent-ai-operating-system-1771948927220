import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

const MOCK_RUNS = [
  { id: 1, cronjob: 'Weekly Content Ideas', status: 'completed', started: '2 hrs ago', duration: '45s' },
  { id: 2, cronjob: 'Monthly Finance Close', status: 'pending_approval', started: '3 hrs ago', duration: '2m' },
  { id: 3, cronjob: 'Daily Sync', status: 'failed', started: '1 day ago', duration: '12s' },
]

export function RunHistoryPage() {
  return (
    <div className="space-y-8 animate-in-up">
      <div>
        <h1 className="text-3xl font-bold">Run History</h1>
        <p className="text-muted-foreground mt-1">
          Browse and inspect past runs. Revert when allowed.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search runs..." className="pl-9" />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 font-medium">Run</th>
                  <th className="text-left p-4 font-medium">Cronjob</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Started</th>
                  <th className="text-left p-4 font-medium">Duration</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_RUNS.map((run) => (
                  <tr key={run.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-mono text-sm">#{run.id}</td>
                    <td className="p-4">
                      <Link to={`/dashboard/runs/${run.id}`} className="font-medium hover:text-primary">
                        {run.cronjob}
                      </Link>
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          'text-xs px-2 py-1 rounded',
                          run.status === 'completed' && 'bg-success/20 text-success',
                          run.status === 'pending_approval' && 'bg-warning/20 text-warning',
                          run.status === 'failed' && 'bg-destructive/20 text-destructive'
                        )}
                      >
                        {run.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{run.started}</td>
                    <td className="p-4 text-sm">{run.duration}</td>
                    <td className="p-4 text-right">
                      <Link to={`/dashboard/runs/${run.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
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
