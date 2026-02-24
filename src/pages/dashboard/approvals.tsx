/**
 * ApprovalsQueuePage - Central hub for human-in-the-loop approvals.
 * List view with filters, bulk actions, sortable table, links to detail.
 */

import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  RefreshCw,
  Download,
  Check,
  X,
  MessageSquarePlus,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useApprovals } from '@/hooks/use-approvals'
import type { Approval, ApprovalModule, ApprovalPriority, ApprovalStatus } from '@/types/approvals'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { RBACPanel } from '@/components/approvals'

const MODULE_LABELS: Record<ApprovalModule, string> = {
  content: 'Content',
  finance: 'Finance',
  projects: 'Projects',
  health: 'Health',
  cronjob: 'Cronjob',
  release: 'Release',
  'agent-change': 'Agent Change',
}

const PRIORITY_STYLES: Record<ApprovalPriority, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-warning/20 text-warning',
  high: 'bg-destructive/20 text-destructive',
  critical: 'bg-destructive text-white',
}

const STATUS_STYLES: Record<ApprovalStatus, string> = {
  pending: 'bg-warning/20 text-warning',
  'pending-info': 'bg-primary/20 text-primary',
  approved: 'bg-success/20 text-success',
  denied: 'bg-destructive/20 text-destructive',
}

function formatAge(seconds: number): string {
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function ApprovalsQueuePage() {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkActionModal, setBulkActionModal] = useState<'approve' | 'deny' | 'request-info' | null>(null)
  const [bulkComment, setBulkComment] = useState('')
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false)

  const {
    data,
    total,
    page,
    size,
    params,
    isLoading,
    error,
    refetch,
    setPage,
    setSize,
    setFilters,
    approve,
    deny,
    bulkAction,
  } = useApprovals({ status: 'pending', page: 1, size: 20 })

  const items = data ?? []
  const totalPages = Math.max(1, Math.ceil(total / size))
  const pendingItems = items.filter((a) => a.status === 'pending')
  const canBulkAct = selectedIds.length > 0 && pendingItems.some((a) => selectedIds.includes(a.id))

  const handleSearch = useCallback(() => {
    setFilters({ search: search.trim() || undefined })
    setPage(1)
  }, [search, setFilters, setPage])

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === pendingItems.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(pendingItems.map((a) => a.id))
    }
  }, [selectedIds.length, pendingItems])

  const handleSelectOne = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }, [])

  const handleBulkSubmit = useCallback(async () => {
    if (!bulkActionModal || selectedIds.length === 0) return
    setIsBulkSubmitting(true)
    try {
      const result = await bulkAction(bulkActionModal, selectedIds, bulkComment)
      toast.success(`${result.success} approval(s) ${bulkActionModal === 'approve' ? 'approved' : bulkActionModal === 'deny' ? 'denied' : 'updated'}`)
      if (result.failed > 0) {
        toast.warning(`${result.failed} could not be processed`)
      }
      setBulkActionModal(null)
      setBulkComment('')
      setSelectedIds([])
      refetch()
    } catch {
      toast.error('Bulk action failed')
    } finally {
      setIsBulkSubmitting(false)
    }
  }, [bulkActionModal, selectedIds, bulkComment, bulkAction, refetch])

  const handleExport = useCallback(() => {
    toast.info('Export feature coming soon')
  }, [])

  const handleApproveRow = useCallback(async (id: string) => {
    try {
      await approve(id)
      toast.success('Approved')
    } catch {
      toast.error('Failed to approve')
    }
  }, [approve])

  const handleDenyRow = useCallback(async (id: string) => {
    try {
      await deny(id)
      toast.success('Denied')
    } catch {
      toast.error('Failed to deny')
    }
  }, [deny])

  return (
    <div className="space-y-8 animate-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Approvals Queue</h1>
          <p className="text-muted-foreground mt-1">
            Human-in-the-loop review for cronjobs, agent changes, releases, and financial actions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading} aria-label="Refresh">
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
          <Button variant="outline" onClick={handleExport} aria-label="Export">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="py-4">
            <p className="text-destructive">{error.message}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search approvals..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  aria-label="Search approvals"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select
                  value={params.module ?? 'all'}
                  onValueChange={(v) => setFilters({ module: v === 'all' ? undefined : (v as ApprovalModule) })}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All modules</SelectItem>
                    {(Object.keys(MODULE_LABELS) as ApprovalModule[]).map((m) => (
                      <SelectItem key={m} value={m}>
                        {MODULE_LABELS[m]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={params.priority ?? 'all'}
                  onValueChange={(v) => setFilters({ priority: v === 'all' ? undefined : (v as ApprovalPriority) })}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </div>

            {canBulkAct && (
              <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 border border-border">
                <span className="text-sm text-muted-foreground">
                  {selectedIds.length} selected
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => setBulkActionModal('approve')}
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setBulkActionModal('deny')}
                  >
                    <X className="h-4 w-4" />
                    Deny
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setBulkActionModal('request-info')}
                  >
                    <MessageSquarePlus className="h-4 w-4" />
                    Request Info
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center max-w-sm">
                No pending approvals. When agents request approval for sensitive actions, they&apos;ll
                appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-4 px-4">
                <table className="w-full border-collapse" role="grid" aria-label="Approvals table">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 w-10">
                        <Checkbox
                          checked={selectedIds.length === pendingItems.length && pendingItems.length > 0}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all"
                        />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Module</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Priority</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Age</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Requester</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Summary</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((approval) => (
                      <ApprovalRow
                        key={approval.id}
                        approval={approval}
                        selected={selectedIds.includes(approval.id)}
                        onSelect={() => handleSelectOne(approval.id)}
                        onApprove={() => handleApproveRow(approval.id)}
                        onDeny={() => handleDenyRow(approval.id)}
                        canSelect={approval.status === 'pending'}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {total} total
                  </span>
                  <Select
                    value={String(size)}
                    onValueChange={(v) => setSize(Number(v))}
                  >
                    <SelectTrigger className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">per page</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm py-2 px-2">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <BulkActionDialog
        open={bulkActionModal !== null}
        action={bulkActionModal}
        comment={bulkComment}
        onCommentChange={setBulkComment}
        onConfirm={handleBulkSubmit}
        onCancel={() => {
          setBulkActionModal(null)
          setBulkComment('')
        }}
        isSubmitting={isBulkSubmitting}
        selectedCount={selectedIds.length}
      />

      <RBACPanel />
    </div>
  )
}

interface ApprovalRowProps {
  approval: Approval
  selected: boolean
  onSelect: () => void
  onApprove: () => void
  onDeny: () => void
  canSelect: boolean
}

function ApprovalRow({ approval, selected, onSelect, onApprove, onDeny, canSelect }: ApprovalRowProps) {
  const age = approval.ageSeconds ?? 0
  const title = (approval.details as { title?: string })?.title ?? approval.summary

  return (
    <tr
      className="border-b border-border hover:bg-secondary/30 transition-colors"
    >
      <td className="py-3 px-4">
        {canSelect && (
          <Checkbox checked={selected} onCheckedChange={onSelect} aria-label={`Select ${approval.id}`} />
        )}
      </td>
      <td className="py-3 px-4 text-sm font-mono">{approval.id.slice(0, 8)}</td>
      <td className="py-3 px-4">
        <Badge variant="outline" className="text-xs">
          {MODULE_LABELS[approval.module as ApprovalModule] ?? approval.module}
        </Badge>
      </td>
      <td className="py-3 px-4">
        <Badge className={cn('text-xs', PRIORITY_STYLES[approval.priority])}>
          {approval.priority}
        </Badge>
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {formatAge(age)}
      </td>
      <td className="py-3 px-4 text-sm">{approval.requester ?? approval.requesterId}</td>
      <td className="py-3 px-4">
        <Link
          to={`/dashboard/approvals/${approval.id}`}
          className="font-medium hover:text-primary hover:underline block max-w-[200px] truncate"
        >
          {title}
        </Link>
      </td>
      <td className="py-3 px-4">
        <Badge className={cn('text-xs', STATUS_STYLES[approval.status])}>
          {approval.status}
        </Badge>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex justify-end gap-1">
          {approval.status === 'pending' && (
            <>
              <Button
                variant="success"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  onApprove()
                }}
                aria-label="Approve"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  onDeny()
                }}
                aria-label="Deny"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
          <Link to={`/dashboard/approvals/${approval.id}`}>
            <Button variant="ghost" size="sm" aria-label="View details">
              View
            </Button>
          </Link>
        </div>
      </td>
    </tr>
  )
}

interface BulkActionDialogProps {
  open: boolean
  action: 'approve' | 'deny' | 'request-info' | null
  comment: string
  onCommentChange: (v: string) => void
  onConfirm: () => void
  onCancel: () => void
  isSubmitting: boolean
  selectedCount: number
}

function BulkActionDialog({
  open,
  action,
  comment,
  onCommentChange,
  onConfirm,
  onCancel,
  isSubmitting,
  selectedCount,
}: BulkActionDialogProps) {
  const labels = {
    approve: 'Approve',
    deny: 'Deny',
    'request-info': 'Request More Info',
  }
  const title = action ? `${labels[action]} ${selectedCount} approval(s)` : ''

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {action === 'approve' && 'Add an optional comment for the audit trail.'}
            {action === 'deny' && 'Add a reason for denial (recommended for audit).'}
            {action === 'request-info' && 'Add your questions or clarification request.'}
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder={action === 'request-info' ? 'What information do you need?' : 'Comment (optional)'}
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
