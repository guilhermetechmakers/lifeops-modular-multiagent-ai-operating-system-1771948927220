/**
 * TopMetricsCard - Balance, P&L, Net Income, Cash Flow with trends.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Wallet, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { FinanceDashboardData } from '@/types/finance'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface TopMetricsCardProps {
  data: FinanceDashboardData | null
  isLoading?: boolean
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function TrendBadge({ value }: { value: number }) {
  const isPositive = value >= 0
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-medium',
        isPositive ? 'text-success' : 'text-destructive'
      )}
    >
      {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
      {Math.abs(value).toFixed(1)}%
    </span>
  )
}

export function TopMetricsCard({ data, isLoading }: TopMetricsCardProps) {
  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="transition-all duration-200">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-4 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const d = data ?? {
    balance: 0,
    netIncome: 0,
    cashFlow: 0,
    balanceTrend: 0,
    netIncomeTrend: 0,
    cashFlowTrend: 0,
  }

  const metrics = [
    {
      title: 'Aggregated Balance',
      desc: 'Across connected accounts',
      value: formatCurrency(d.balance),
      trend: d.balanceTrend,
      icon: Wallet,
      gradient: 'from-primary/10 to-transparent border-primary/20',
    },
    {
      title: 'Net Income',
      desc: 'This month',
      value: formatCurrency(d.netIncome),
      trend: d.netIncomeTrend,
      icon: DollarSign,
      gradient: 'from-success/10 to-transparent border-success/20',
    },
    {
      title: 'Cash Flow',
      desc: 'In vs out',
      value: formatCurrency(d.cashFlow),
      trend: d.cashFlowTrend,
      icon: d.cashFlowTrend >= 0 ? ArrowUpRight : ArrowDownRight,
      gradient: d.cashFlowTrend >= 0 ? 'from-success/10 to-transparent' : 'from-destructive/10 to-transparent',
    },
    {
      title: 'P&L Overview',
      desc: 'Income vs expenses',
      value: formatCurrency(d.netIncome),
      trend: d.netIncomeTrend,
      icon: DollarSign,
      gradient: 'from-primary/10 to-transparent border-primary/20',
    },
  ]

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <Card
          key={m.title}
          className={cn(
            'bg-gradient-to-br transition-all duration-200 hover:shadow-card-hover',
            m.gradient
          )}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <m.icon className="h-4 w-4" />
              {m.title}
            </CardTitle>
            <CardDescription className="text-xs">{m.desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{m.value}</p>
            <TrendBadge value={m.trend} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
