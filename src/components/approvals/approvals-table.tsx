/**
 * ApprovalsTable - Data table for Approvals Queue.
 * Columns: ID, Module, Priority, Age, Requester, Summary, Status, Actions.
 * Sticky headers, row hover, sortable, selection, bulk actions.
 */

import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Check, X, MessageSquare, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Approval, ApprovalPriority, ApprovalStatus } from '@/types/approvals'

export interface ApprovalsTableProps {
  approvals: Approval[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onApprove?: (id: string) => void
  onDeny?: (id: string) => void
  onRequestInfo?: (id: string) => void
  isLoading?: boolean
  canBulkApprove?: boolean
  canBulkDeny?: boolean
}

const PRIORITY_CLASSES: Record<ApprovalPriority, string> = {
  critical: 'bg-destructive/20 text-destructive',
  high: 'bg-destructive/20 text-destructive',
  medium: 'bg-warning/20 text-warning',
  low: 'bg-muted text-muted-foreground',
}

const STATUS_CLASSES: Record<ApprovalStatus, string> = {
  pending: 'bg-warning/20 text-warning',
  'pending-info': 'bg-muted text-muted-foreground',
  approved: 'bg-success/20 text-success',
  denied: 'bg-destructive/20 text-destructive',
}

function formatAge(seconds: number): string {
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function formatModule(module: string): string {
  return module.charAt(0).toUpperCase() + module.slice(1).replace(/-/g, ' ')
}

export function ApprovalsTable({
  approvals = [],
  selectedIds = [],
  onSelectionChange,
  onApprove,
  onDeny,
  onRequestInfo,
  isLoading,
  canBulkApprove = true,
  canBulkDeny = true,
}: ApprovalsTableProps) {
  const items = Array.isArray(approvals) ? approvals : []

  const handleSelectAll = useCallback(() => {
    const pending = items.filter((a) => a.status === 'pending' || a.status === 'pending-info')
    if (selectedIds.length === pending.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(pending.map((a) => a.id))
    }
  }, [items, selectedIds.length, onSelectionChange])

  const handleSelectOne = useCallback(
    (id: string) => {
      if (selectedIds.includes(id)) {
        onSelectionChange(selectedIds.filter((x) => x !== id))
      } else {
        onSelectionChange([...selectedIds, id])
      }
    },
    [selectedIds, onSelectionChange]
  )

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="h-12 px-4 text-left w-12">
                    <Skeleton className="h-4 w-4" />
                  </th>
                  <th className="h-12 px-4 text-left"><Skeleton className="h-4 w-24" /></th>
                  <th className="h-12 px-4 text-left"><Skeleton className="h-4 w-16" /></th>
                  <th className="h-12 px-4 text-left"><Skeleton className="h-4 w-16" /></th>
                  <th className="h-12 px-4 text-left"><Skeleton className="h-4 w-24" /></th>
                  <th className="h-12 px-4 text-left"><Skeleton className="h-4 w-32" /></th>
                  <th className="h-12 px-4 text-left"><Skeleton className="h-4 w-20" /></th>
                  <th className="h-12 px-4 text-right w-24" />
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="p-4"><Skeleton className="h-4 w-4" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-48" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="p-4" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center max-w-sm">
            No approvals match your filters. When agents request approval for
            sensitive actions, they&apos;ll appear here.
          </p>
        </CardContent>
      </Card>
    )
  }

  const pendingIds = items
    .filter((a) => a.status === 'pending' || a.status === 'pending-info')
    .map((a) => a.id)
  const allSelected =
    pendingIds.length > 0 && selectedIds.length === pendingIds.length

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full" role="grid" aria-label="Approvals queue">
            <thead className="sticky top-0 z-10 bg-card border-b border-border">
              <tr>
                <th className="h-12 px-4 text-left w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all pending"
                  />
                </th>
                <th className="h-12 px-4 text-left text-sm font-semibold">ID</th>
                <th className="h-12 px-4 text-left text-sm font-semibold">Module</th>
                <th className="h-12 px-4 text-left text-sm font-semibold">Priority</th>
                <th className="h-12 px-4 text-left text-sm font-semibold">Age</th>
                <th className="h-12 px-4 text-left text-sm font-semibold">Requester</th>
                <th className="h-12 px-4 text-left text-sm font-semibold">Summary</th>
                <th className="h-12 px-4 text-left text-sm font-semibold">Status</th>
                <th className="h-12 px-4 text-right text-sm font-semibold w-28">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => {
                const isPending =
                  a.status === 'pending' || a.status === 'pending-info'
                return (
                  <tr
                    key={a.id}
                    className={cn(
                      'border-b border-border transition-colors hover:bg-muted/30',
                      'group'
                    )}
                  >
                    <td className="p-4">
                      {isPending ? (
                        <Checkbox
                          checked={selectedIds.includes(a.id)}
                          onCheckedChange={() => handleSelectOne(a.id)}
                          aria-label={`Select ${a.summary}`}
                        />
                      ) : (
                        <span className="w-4" />
                      )}
                    </td>
                    <td className="p-4">
                      <Link
                        to={`/dashboard/approvals/${a.id}`}
                        className="text-primary hover:underline font-mono text-sm"
                      >
                        {a.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="p-4 text-sm">
                      {formatModule(a.module)}
                    </td>
                    <td className="p-4">
                      <Badge
                        className={cn(
                          'text-xs',
                          PRIORITY_CLASSES[a.priority ?? 'low']
                        )}
                      >
                        {a.priority ?? 'low'}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {formatAge(a.ageSeconds ?? 0)}
                    </td>
                    <td className="p-4 text-sm">
                      {a.requester ?? a.requesterId ?? '—'}
                    </td>
                    <td className="p-4">
                      <Link
                        to={`/dashboard/approvals/${a.id}`}
                        className="font-medium hover:text-primary block max-w-[240px] truncate"
                      >
                        {a.summary}
                      </Link>
                    </td>
                    <td className="p-4">
                      <Badge
                        className={cn(
                          'text-xs',
                          STATUS_CLASSES[a.status]
                        )}
                      >
                        {a.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      {isPending && (
                        <div className="flex items-center justify-end gap-1">
                          {canBulkApprove && onApprove && (
                            <Button
                              variant="success"
                              size="icon-sm"
                              onClick={() => onApprove(a.id)}
                              aria-label={`Approve ${a.summary}`}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          {canBulkDeny && onDeny && (
                            <Button
                              variant="destructive"
                              size="icon-sm"
                              onClick={() => onDeny(a.id)}
                              aria-label={`Deny ${a.summary}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          {onRequestInfo && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="More actions"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => onRequestInfo(a.id)}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                  Request Info
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
