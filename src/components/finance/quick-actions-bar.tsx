/**
 * QuickActionsBar - Shortcuts to common tasks and workflow triggers.
 */

import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Zap, RefreshCw, FileCheck, BarChart3 } from 'lucide-react'

export function QuickActionsBar() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link to="/dashboard/finance">
        <Button variant="outline" size="sm" className="gap-2 transition-all duration-200 hover:scale-[1.02]">
          <RefreshCw className="h-4 w-4" />
          Sync Accounts
        </Button>
      </Link>
      <Link to="/dashboard/finance">
        <Button variant="outline" size="sm" className="gap-2 transition-all duration-200 hover:scale-[1.02]">
          <Zap className="h-4 w-4" />
          Run Categorization
        </Button>
      </Link>
      <Link to="/dashboard/finance">
        <Button variant="outline" size="sm" className="gap-2 transition-all duration-200 hover:scale-[1.02]">
          <FileCheck className="h-4 w-4" />
          Start Monthly Close
        </Button>
      </Link>
      <Link to="/dashboard/cronjobs">
        <Button variant="outline" size="sm" className="gap-2 transition-all duration-200 hover:scale-[1.02]">
          <BarChart3 className="h-4 w-4" />
          Manage Cronjobs
        </Button>
      </Link>
    </div>
  )
}
