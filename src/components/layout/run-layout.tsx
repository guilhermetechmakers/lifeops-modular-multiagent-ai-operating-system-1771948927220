/**
 * RunLayout - Wrapper for Run History with left nav rail.
 * Run History list, run detail, trace viewer.
 */

import { Outlet } from 'react-router-dom'
import { RunNavRail } from '@/components/run-history'

export function RunLayout() {
  return (
    <div className="flex flex-1 min-w-0">
      <RunNavRail />
      <div className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}
