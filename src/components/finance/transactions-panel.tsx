/**
 * TransactionsPanel - Feed with auto-categorization, search, filters, inline edit.
 */

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Pencil, Check, X } from 'lucide-react'
import type { Transaction, Category } from '@/types/finance'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface TransactionsPanelProps {
  transactions: Transaction[]
  categories: Category[]
  isLoading?: boolean
  onEdit?: (id: string, payload: { categoryId?: string; note?: string }) => Promise<void>
}

export function TransactionsPanel({
  transactions = [],
  categories = [],
  isLoading,
  onEdit,
}: TransactionsPanelProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCategoryId, setEditCategoryId] = useState<string>('')

  const filtered = (transactions ?? []).filter((t) => {
    const matchSearch = !search || t.merchant.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === 'all' || t.category_id === categoryFilter
    return matchSearch && matchCategory
  })

  const handleStartEdit = useCallback((t: Transaction) => {
    setEditingId(t.id)
    setEditCategoryId(t.category_id ?? '')
  }, [])

  const handleSaveEdit = useCallback(
    async (id: string) => {
      if (!onEdit) return
      try {
        await onEdit(id, { categoryId: editCategoryId })
        setEditingId(null)
        toast.success('Transaction updated')
      } catch {
        toast.error('Failed to update')
      }
    },
    [onEdit, editCategoryId]
  )

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
  }, [])

  const getCategoryName = (catId: string) => {
    const cat = (categories ?? []).find((c) => c.id === catId)
    return cat?.name ?? 'Uncategorized'
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
        <CardDescription>
          Feed with auto-categorization, search, filters, inline edit
        </CardDescription>
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search merchant or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {(categories ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>No transactions match your filters</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.slice(0, 10).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:border-border/80 transition-colors"
              >
                <div className="space-y-0.5">
                  <p className="font-medium text-sm">{t.merchant}</p>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  {editingId === t.id ? (
                    <>
                      <Select value={editCategoryId} onValueChange={setEditCategoryId}>
                        <SelectTrigger className="w-[140px] h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(categories ?? []).map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleSaveEdit(t.id)}
                        aria-label="Save"
                      >
                        <Check className="h-4 w-4 text-success" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={handleCancelEdit}
                        aria-label="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Badge variant="secondary" className="text-xs">
                        {getCategoryName(t.category_id ?? '')}
                      </Badge>
                      <span
                        className={cn(
                          'font-semibold text-sm min-w-[70px] text-right',
                          t.amount >= 0 ? 'text-success' : 'text-destructive'
                        )}
                      >
                        {t.amount >= 0 ? '+' : ''}
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(t.amount)}
                      </span>
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleStartEdit(t)}
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
