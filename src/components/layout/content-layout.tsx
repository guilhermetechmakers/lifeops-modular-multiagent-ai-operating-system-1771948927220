/**
 * ContentLayout - Wraps Content Dashboard with left nav rail.
 * Pipeline, Library, Master views.
 */

import { Outlet } from 'react-router-dom'
import { ContentNavRail } from '@/components/content-dashboard/content-nav-rail'

export function ContentLayout() {
  return (
    <div className="flex flex-1 min-w-0">
      <ContentNavRail />
      <div className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}
