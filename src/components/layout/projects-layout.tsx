/**
 * ProjectsLayout - Wraps Projects Dashboard with left nav rail.
 */

import { Outlet, useParams } from 'react-router-dom'
import { ProjectsNavRail } from '@/components/projects'

export function ProjectsLayout() {
  const params = useParams<{ id?: string }>()
  const projectId = params.id ?? null

  return (
    <div className="flex flex-1 min-w-0">
      <ProjectsNavRail projectId={projectId} />
      <div className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}
