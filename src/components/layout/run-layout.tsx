/**
 * RunLayout - Wrapper for run detail and trace viewer routes.
 * Renders child routes via Outlet.
 */

import { Outlet } from 'react-router-dom'

export function RunLayout() {
  return <Outlet />
}
