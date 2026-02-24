import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { MasterHeader, LeftSidebar } from '@/components/master-dashboard'

const STORAGE_KEY = 'lifeops_sidebar_collapsed'

function getStoredCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function setStoredCollapsed(v: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(v))
  } catch {
    // ignore
  }
}

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(getStoredCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setStoredCollapsed(sidebarCollapsed)
  }, [sidebarCollapsed])

  return (
    <div className="flex min-h-screen bg-background">
      <LeftSidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        <MasterHeader
          showMenuButton
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgb(var(--card))',
            border: '1px solid rgb(var(--border))',
            color: 'rgb(var(--foreground))',
          },
        }}
      />
    </div>
  )
}
