import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const MOCK_DATA = [
  { name: 'Jan', income: 4200, expenses: 3100 },
  { name: 'Feb', income: 4800, expenses: 3400 },
  { name: 'Mar', income: 5100, expenses: 2900 },
  { name: 'Apr', income: 4500, expenses: 3200 },
]

export function FinanceDashboard() {
  return (
    <div className="space-y-8 animate-in-up">
      <div>
        <h1 className="text-3xl font-bold">Finance</h1>
        <p className="text-muted-foreground mt-1">
          Financial automation and reconciliation with auditability
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aggregated Balance</CardTitle>
            <CardDescription>Across connected accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$24,500</p>
            <p className="text-sm text-success mt-1">+2.4% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Categorization</CardTitle>
            <CardDescription>Auto-categorized</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">7</p>
            <Button variant="outline" size="sm" className="mt-2">
              Review
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Anomalies</CardTitle>
            <CardDescription>Requires attention</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">1</p>
            <Button variant="outline" size="sm" className="mt-2">
              View Queue
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>P&L Overview</CardTitle>
          <CardDescription>Income vs expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                <XAxis dataKey="name" stroke="rgb(var(--muted-foreground))" />
                <YAxis stroke="rgb(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: 'rgb(var(--card))',
                    border: '1px solid rgb(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="income" fill="rgb(var(--success))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="rgb(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
