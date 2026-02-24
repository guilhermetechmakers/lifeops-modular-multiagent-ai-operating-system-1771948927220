/**
 * OverviewCardsPanel - Bento-style overview cards.
 * Active Agents, Upcoming Cronjobs, Pending Approvals, Recent Runs, Spend Summary.
 */

import { Link } from 'react-router-dom'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Bot,
  Clock,
  CheckSquare,
  History,
  DollarSign,
  ArrowUpRight,
  Pause,
  Eye,
} from 'lucide-react'
import type { DashboardSummary, Agent } from '@/types/master-dashboard'
import { cn } from '@/lib/utils'

interface OverviewCardsPanelProps {
  summary: DashboardSummary | null
  agents: Agent[]
  isLoading?: boolean
}

const statusColors: Record<string, string> = {
  active: 'bg-success/20 text-success',
  idle: 'bg-muted text-muted-foreground',
  paused: 'bg-warning/20 text-warning',
  error: 'bg-destructive/20 text-destructive',
}

export function OverviewCardsPanel({ summary, agents, isLoading }: OverviewCardsPanelProps) {
  const s = summary ?? {
    activeAgentsCount: 0,
    upcomingCronjobsCount: 0,
    pendingApprovalsCount: 0,
    recentRunsCount: 0,
    spendTotal: 0,
    spendForecast: 0,
    spendRisk: 'low' as const,
  }

  const agentList = Array.isArray(agents) ? agents : []
  const statusCounts = agentList.reduce<Record<string, number>>((acc, a) => {
    const st = a.status ?? 'idle'
    acc[st] = (acc[st] ?? 0) + 1
    return acc
  }, {})

  const cards = [
    {
      title: 'Active Agents',
      value: String(s.activeAgentsCount),
      change: `${Object.values(statusCounts).reduce((a, b) => a + b, 0)} total`,
      icon: Bot,
      href: '/dashboard/agents',
      gradient: 'from-primary/20 to-primary/5',
      actions: (
        <div className="flex gap-1 mt-2">
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            <Pause className="h-3 w-3" />
            Pause
          </Button>
          <Link to="/dashboard/agents">
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              <Eye className="h-3 w-3" />
              Details
            </Button>
          </Link>
        </div>
      ),
      chips: Object.entries(statusCounts).map(([st, n]) => (
        <Badge key={st} variant="secondary" className={cn('text-xs', statusColors[st])}>
          {st}: {n}
        </Badge>
      )),
    },
    {
      title: 'Upcoming Cronjobs',
      value: String(s.upcomingCronjobsCount),
      change: 'Next: 2h',
      icon: Clock,
      href: '/dashboard/cronjobs',
      gradient: 'from-success/20 to-success/5',
    },
    {
      title: 'Pending Approvals',
      value: String(s.pendingApprovalsCount),
      change: s.pendingApprovalsCount > 0 ? 'Urgent: 1' : 'All clear',
      icon: CheckSquare,
      href: '/dashboard/approvals',
      gradient: 'from-warning/20 to-warning/5',
    },
    {
      title: 'Recent Runs',
      value: String(s.recentRunsCount),
      change: 'This week',
      icon: History,
      href: '/dashboard/runs',
      gradient: 'from-primary/20 to-primary/5',
    },
    {
      title: 'Spend',
      value: `$${s.spendTotal ?? 0}`,
      change: s.spendForecast ? `Forecast: $${s.spendForecast}` : '-',
      icon: DollarSign,
      href: '/dashboard/billing',
      gradient:
        s.spendRisk === 'high'
          ? 'from-destructive/20 to-destructive/5'
          : s.spendRisk === 'medium'
            ? 'from-warning/20 to-warning/5'
            : 'from-success/20 to-success/5',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="h-40 animate-pulse">
            <CardHeader>
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-8 w-16 bg-muted rounded mt-2" />
              <div className="h-3 w-20 bg-muted rounded mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-5 gap-6">
      {cards.map((card) => (
        <Link key={card.title} to={card.href}>
          <Card className="h-full transition-all duration-300 hover:scale-[1.02] hover:shadow-glow focus-within:ring-2 focus-within:ring-ring">
            <div className={cn('h-1 rounded-t-xl bg-gradient-to-r', card.gradient)} />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <card.icon className="h-5 w-5 text-muted-foreground" aria-hidden />
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">{card.value}</CardTitle>
              <CardDescription>{card.title}</CardDescription>
              <p className="text-xs text-muted-foreground">{card.change}</p>
              {card.chips && card.chips.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">{card.chips}</div>
              )}
              {card.actions}
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  )
}
