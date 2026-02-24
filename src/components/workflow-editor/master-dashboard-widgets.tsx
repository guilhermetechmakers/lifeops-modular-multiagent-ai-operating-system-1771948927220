/**
 * MasterDashboardWidgets - Quick actions, status, health for Workflow Editor.
 */

import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Play, CheckSquare } from 'lucide-react'

export function MasterDashboardWidgets() {
  return (
    <div className="flex flex-wrap gap-2">
      <Link to="/dashboard/overview">
        <Button variant="outline" size="sm" className="gap-2">
          <LayoutDashboard className="h-4 w-4" />
          Master Dashboard
        </Button>
      </Link>
      <Link to="/dashboard/cronjobs">
        <Button variant="outline" size="sm" className="gap-2">
          <Play className="h-4 w-4" />
          Cronjobs
        </Button>
      </Link>
      <Link to="/dashboard/approvals">
        <Button variant="outline" size="sm" className="gap-2">
          <CheckSquare className="h-4 w-4" />
          Approvals
        </Button>
      </Link>
    </div>
  )
}
