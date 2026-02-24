import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
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
