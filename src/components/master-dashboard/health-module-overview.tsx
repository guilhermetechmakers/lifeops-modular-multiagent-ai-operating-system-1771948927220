/**
 * HealthModuleOverview - Personal health automation, habits, wearables.
 */

import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Activity, Apple, Dumbbell } from 'lucide-react'

export function HealthModuleOverview() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-destructive" />
          <CardTitle>Health</CardTitle>
        </div>
        <CardDescription>
          Habits, training plans, recovery analytics, workload balancing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm">Wearables</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
            <Apple className="h-4 w-4 text-success" />
            <span className="text-sm">Meal plans</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
            <Dumbbell className="h-4 w-4 text-warning" />
            <span className="text-sm">Training</span>
          </div>
        </div>
        <Link to="/dashboard/health">
          <Button variant="outline" size="sm" className="w-full">
            Open Health Dashboard
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
