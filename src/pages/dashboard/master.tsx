import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MasterDashboardEntry } from '@/components/onboarding'
import { Button } from '@/components/ui/button'
import {
  Bot,
  Clock,
  CheckSquare,
  History,
  DollarSign,
  ArrowUpRight,
  Plus,
  TrendingUp,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'

const MOCK_DATA = [
  { name: 'Mon', runs: 12, agents: 8 },
  { name: 'Tue', runs: 19, agents: 12 },
  { name: 'Wed', runs: 15, agents: 10 },
  { name: 'Thu', runs: 22, agents: 14 },
  { name: 'Fri', runs: 18, agents: 11 },
  { name: 'Sat', runs: 8, agents: 6 },
  { name: 'Sun', runs: 5, agents: 4 },
]

const OVERVIEW_CARDS = [
  {
    title: 'Active Agents',
    value: '12',
    change: '+2',
    icon: Bot,
    href: '/dashboard/agents',
    gradient: 'from-primary/20 to-primary/5',
  },
  {
    title: 'Upcoming Cronjobs',
    value: '8',
    change: 'Next: 2h',
    icon: Clock,
    href: '/dashboard/cronjobs',
    gradient: 'from-success/20 to-success/5',
  },
  {
    title: 'Pending Approvals',
    value: '3',
    change: 'Urgent: 1',
    icon: CheckSquare,
    href: '/dashboard/approvals',
    gradient: 'from-warning/20 to-warning/5',
  },
  {
    title: 'Recent Runs',
    value: '47',
    change: 'This week',
    icon: History,
    href: '/dashboard/runs',
    gradient: 'from-primary/20 to-primary/5',
  },
  {
    title: 'Spend',
    value: '$24',
    change: '-12%',
    icon: DollarSign,
    href: '/dashboard/billing',
    gradient: 'from-success/20 to-success/5',
  },
]

const RECENT_ACTIVITY = [
  { id: 1, type: 'run', agent: 'Content Ideas', status: 'completed', time: '2 min ago' },
  { id: 2, type: 'approval', agent: 'Finance Close', status: 'pending', time: '15 min ago' },
  { id: 3, type: 'run', agent: 'Weekly Sync', status: 'completed', time: '1 hr ago' },
]

const ONBOARDING_FLAG = 'lifeops_just_completed_onboarding'

export function MasterDashboard() {
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    const flag = sessionStorage.getItem(ONBOARDING_FLAG)
    if (flag === 'true') {
      setIsNewUser(true)
      sessionStorage.removeItem(ONBOARDING_FLAG)
    }
  }, [])

  return (
    <div className="space-y-8 animate-in-up">
      {isNewUser && (
        <MasterDashboardEntry
          isNewUser
          stats={{
            cronjobsCount: 1,
            nextRun: new Date(Date.now() + 86400000).toISOString(),
            pendingApprovals: 0,
          }}
        />
      )}

      <div>
        <h1 className="text-3xl font-bold">Master Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Command center for your automation ecosystem
        </p>
      </div>

      {/* Overview cards - Bento-style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-5 gap-6">
        {OVERVIEW_CARDS.map((card) => (
          <Link key={card.title} to={card.href}>
            <Card className="h-full transition-all duration-300 hover:scale-[1.02] hover:shadow-glow">
              <div className={cn('h-1 rounded-t-xl bg-gradient-to-r', card.gradient)} />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <card.icon className="h-5 w-5 text-muted-foreground" />
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl">{card.value}</CardTitle>
                <CardDescription>{card.title}</CardDescription>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {card.change}
                </p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Run Activity</CardTitle>
            <CardDescription>Runs and agent activity over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_DATA}>
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
                  <Line
                    type="monotone"
                    dataKey="runs"
                    stroke="rgb(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'rgb(var(--primary))' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="agents"
                    stroke="rgb(var(--success))"
                    strokeWidth={2}
                    dot={{ fill: 'rgb(var(--success))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest handoffs and runs</CardDescription>
            </div>
            <Link to="/dashboard/runs">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {RECENT_ACTIVITY.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div>
                    <p className="font-medium text-sm">{item.agent}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                  <span
                    className={cn(
                      'text-xs px-2 py-1 rounded',
                      item.status === 'completed'
                        ? 'bg-success/20 text-success'
                        : 'bg-warning/20 text-warning'
                    )}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Create or manage your automation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link to="/dashboard/cronjobs">
              <Button>
                <Plus className="h-4 w-4" />
                New Cronjob
              </Button>
            </Link>
            <Link to="/dashboard/workflows">
              <Button variant="outline">
                <Plus className="h-4 w-4" />
                New Workflow
              </Button>
            </Link>
            <Link to="/dashboard/approvals">
              <Button variant="outline">Review Approvals</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
