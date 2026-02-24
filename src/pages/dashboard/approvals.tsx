import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckSquare, Search, Check, X, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const MOCK_APPROVALS = [
  { id: 1, title: 'Finance Close - January', module: 'Finance', priority: 'high', requested: '2 hrs ago' },
  { id: 2, title: 'Content Publish - Blog Post', module: 'Content', priority: 'medium', requested: '5 hrs ago' },
  { id: 3, title: 'Release v1.2.0', module: 'Projects', priority: 'high', requested: '1 day ago' },
]

export function ApprovalsQueuePage() {
  return (
    <div className="space-y-8 animate-in-up">
      <div>
        <h1 className="text-3xl font-bold">Approvals Queue</h1>
        <p className="text-muted-foreground mt-1">
          Human-in-the-loop review for sensitive actions
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search approvals..." className="pl-9" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Module</Button>
              <Button variant="outline">Priority</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MOCK_APPROVALS.map((approval) => (
              <Link key={approval.id} to={`/dashboard/approvals/${approval.id}`}>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg p-2 bg-warning/20">
                      <Clock className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium">{approval.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {approval.module} • Requested {approval.requested}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-xs px-2 py-1 rounded',
                        approval.priority === 'high'
                          ? 'bg-destructive/20 text-destructive'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {approval.priority}
                    </span>
                    <Button variant="success" size="sm">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center max-w-sm">
            No pending approvals. When agents request approval for sensitive actions, they&apos;ll
            appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
