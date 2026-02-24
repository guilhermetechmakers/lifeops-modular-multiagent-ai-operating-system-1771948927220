import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Play, Settings, History } from 'lucide-react'

export function CronjobDetailPage() {
  const { id } = useParams()

  return (
    <div className="space-y-8 animate-in-up">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/cronjobs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Weekly Content Ideas</h1>
          <p className="text-muted-foreground">Cronjob #{id}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Schedule, triggers, and payload</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Schedule</p>
              <p className="font-mono">0 9 * * 1</p>
              <p className="text-sm text-muted-foreground mt-1">Every Monday at 9:00 AM</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Automation Level</p>
              <p className="text-primary">Suggest-only</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Retry Policy</p>
              <p>3 retries with exponential backoff</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full">
              <Play className="h-4 w-4" />
              Run Now
            </Button>
            <Button variant="outline" className="w-full">
              <Settings className="h-4 w-4" />
              Edit
            </Button>
            <Link to="/dashboard/runs" className="block">
              <Button variant="outline" className="w-full">
                <History className="h-4 w-4" />
                Run History
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Runs</CardTitle>
          <CardDescription>Last 5 executions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
              >
                <div>
                  <p className="font-medium">Run #{100 - i}</p>
                  <p className="text-sm text-muted-foreground">2 days ago</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-success/20 text-success">
                  Completed
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
