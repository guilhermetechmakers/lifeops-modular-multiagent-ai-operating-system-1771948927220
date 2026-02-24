/**
 * FinanceLayout - Wraps Finance Dashboard with left nav rail.
 */

import { Outlet } from 'react-router-dom'
import { FinanceNavRail } from '@/components/finance/finance-nav-rail'

export function FinanceLayout() {
  return (
    <div className="flex flex-1 min-w-0">
      <FinanceNavRail />
      <div className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}
