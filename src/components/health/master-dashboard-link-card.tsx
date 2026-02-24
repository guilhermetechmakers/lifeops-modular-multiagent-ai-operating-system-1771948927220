/**
 * MasterDashboardLinkCard - Quick access to Master Dashboard sections.
 */

import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, ChevronRight } from 'lucide-react'

export function MasterDashboardLinkCard() {
  return (
    <Card className="transition-all duration-200 hover:shadow-card-hover border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          Master Dashboard
        </CardTitle>
        <CardDescription>
          Command center: cronjobs, approvals, system health
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link to="/dashboard/overview">
          <Button variant="outline" className="w-full gap-2">
            Open Master Dashboard
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
