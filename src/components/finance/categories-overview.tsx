/**
 * CategoriesOverview - Breakdown by category with donut chart and list.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Transaction, Category } from '@/types/finance'
import { Skeleton } from '@/components/ui/skeleton'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface CategoriesOverviewProps {
  transactions: Transaction[]
  categories: Category[]
  isLoading?: boolean
}

export function CategoriesOverview({
  transactions = [],
  categories = [],
  isLoading,
}: CategoriesOverviewProps) {
  const expensesByCategory = (transactions ?? [])
    .filter((t) => t.amount < 0)
    .reduce<Record<string, number>>((acc, t) => {
      const catId = t.category_id ?? 'uncategorized'
      acc[catId] = (acc[catId] ?? 0) + Math.abs(t.amount)
      return acc
    }, {})

  const chartData = Object.entries(expensesByCategory).map(([catId, value]) => {
    const cat = (categories ?? []).find((c) => c.id === catId)
    return {
      name: cat?.name ?? 'Other',
      value: Math.round(value * 100) / 100,
      color: cat?.color ?? '#6B7280',
    }
  })

  const total = chartData.reduce((s, d) => s + d.value, 0)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories Overview</CardTitle>
        <CardDescription>Expense breakdown by category</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No expense data
          </div>
        ) : (
          <>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgb(var(--card))',
                      border: '1px solid rgb(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) =>
                      [`${((value / total) * 100).toFixed(1)}%`, new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)]
                    }
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {chartData.map((d) => (
                <div
                  key={d.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    {d.name}
                  </span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(d.value)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
