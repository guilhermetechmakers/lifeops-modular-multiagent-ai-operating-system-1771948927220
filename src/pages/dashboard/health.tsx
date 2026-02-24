import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'

export function HealthDashboard() {
  return (
    <div className="space-y-8 animate-in-up">
      <div>
        <h1 className="text-3xl font-bold">Health</h1>
        <p className="text-muted-foreground mt-1">
          Personal health and workload balancing with privacy-first agents
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Habits</CardTitle>
            <CardDescription>This week</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">5/7</p>
            <p className="text-sm text-muted-foreground mt-1">days tracked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Training</CardTitle>
            <CardDescription>This week</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">3</p>
            <p className="text-sm text-muted-foreground mt-1">sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recovery</CardTitle>
            <CardDescription>Sleep score</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">82</p>
            <p className="text-sm text-success mt-1">Good</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Meals</CardTitle>
            <CardDescription>Logged today</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">2</p>
            <p className="text-sm text-muted-foreground mt-1">of 3</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Heart className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center max-w-sm">
            Connect HealthKit or Google Fit to sync your health data. All data stays private
            and is processed with your explicit consent.
          </p>
          <Button variant="outline" className="mt-4">
            Connect Wearable
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
