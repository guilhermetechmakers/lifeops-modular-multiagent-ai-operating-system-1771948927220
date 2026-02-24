/**
 * MasterDashboardEntry - Post-onboarding entry into Master Dashboard.
 * Shows status chips and quick actions for new users.
 */

import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Plus, ArrowRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MasterDashboardEntryProps {
  /** Whether user just completed onboarding */
  isNewUser?: boolean
  /** Quick stats to display */
  stats?: {
    cronjobsCount?: number
    nextRun?: string
    pendingApprovals?: number
  }
  className?: string
}

export function MasterDashboardEntry({
  isNewUser = false,
  stats = {},
  className,
}: MasterDashboardEntryProps) {
  const { cronjobsCount = 0, nextRun, pendingApprovals = 0 } = stats

  return (
    <Card
      className={cn(
        'rounded-xl border border-border bg-card transition-all duration-300',
        isNewUser && 'border-primary/30 bg-primary/5',
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isNewUser && (
              <Sparkles className="h-5 w-5 text-primary" aria-hidden />
            )}
            <CardTitle className="text-lg">
              {isNewUser ? 'Welcome to LifeOps!' : 'Master Dashboard'}
            </CardTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            {cronjobsCount > 0 && (
              <Badge variant="success" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                {cronjobsCount} cronjob{cronjobsCount !== 1 ? 's' : ''}
              </Badge>
            )}
            {nextRun && (
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                Next: {new Date(nextRun).toLocaleString()}
              </Badge>
            )}
            {pendingApprovals > 0 && (
              <Badge variant="warning">
                {pendingApprovals} approval{pendingApprovals !== 1 ? 's' : ''} pending
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          {isNewUser
            ? 'Your automation is set up. Here are your quick actions.'
            : 'Command center for your automation ecosystem'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Link to="/dashboard/cronjobs">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Cronjob
            </Button>
          </Link>
          <Link to="/dashboard/workflows">
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Workflow
            </Button>
          </Link>
          <Link to="/dashboard/approvals">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowRight className="h-4 w-4" />
              Review Approvals
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
