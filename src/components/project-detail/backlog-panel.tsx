/**
 * BacklogPanel - Ticket list with filters, search, card-based tickets.
 */

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LayoutGrid, Search, GitPullRequest, Check } from 'lucide-react'
import type { BacklogTicket } from '@/types/project-detail'

export interface BacklogPanelProps {
  projectId: string
  tickets: BacklogTicket[]
  onRefresh: () => void
  onUpdateTicket: (ticketId: string, payload: Partial<BacklogTicket>) => Promise<void>
}

const STATUS_OPTIONS = ['backlog', 'todo', 'in-progress', 'review', 'done'] as const
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical'] as const

export function BacklogPanel({ projectId: _projectId, tickets, onRefresh, onUpdateTicket }: BacklogPanelProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')

  const filteredTickets = useMemo(() => {
    let list = tickets ?? []
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          (t.tags ?? []).some((tag) => tag.toLowerCase().includes(q))
      )
    }
    if (statusFilter !== 'all') list = list.filter((t) => t.status === statusFilter)
    if (priorityFilter !== 'all') list = list.filter((t) => t.priority === priorityFilter)
    if (assigneeFilter !== 'all') list = list.filter((t) => (t.assignee ?? t.assigneeId) === assigneeFilter)
    return list
  }, [tickets, search, statusFilter, priorityFilter, assigneeFilter])

  const assignees = useMemo(() => {
    const set = new Set<string>()
    ;(tickets ?? []).forEach((t) => {
      const a = t.assignee ?? t.assigneeId
      if (a) set.add(a)
    })
    return Array.from(set)
  }, [tickets])

  const handleStatusChange = async (ticketId: string, status: BacklogTicket['status']) => {
    await onUpdateTicket(ticketId, { status })
    onRefresh()
  }

  const getPriorityVariant = (p: string) => {
    if (p === 'critical') return 'destructive'
    if (p === 'high') return 'default'
    return 'secondary'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-primary" />
          Backlog
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Prioritized tickets, triage status, assignees, and filters
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search tickets"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priority</SelectItem>
              {PRIORITY_OPTIONS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {assignees.length > 0 && (
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All assignees</SelectItem>
                {assignees.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {(filteredTickets ?? []).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <LayoutGrid className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center max-w-sm">
              {tickets.length === 0
                ? 'No tickets yet. Create tickets from your roadmap or backlog.'
                : 'No tickets match your filters. Try adjusting filters or search.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(filteredTickets ?? []).map((t) => (
            <Card
              key={t.id}
              className="transition-all duration-300 hover:shadow-card-hover hover:border-primary/20"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm line-clamp-2">{t.title}</h3>
                  <Badge variant={getPriorityVariant(t.priority)} className="shrink-0 text-xs">
                    {t.priority}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(t.tags ?? []).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {t.sprint && (
                    <Badge variant="secondary" className="text-xs">
                      {t.sprint}
                    </Badge>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {t.assignee && (
                      <Avatar name={t.assignee} size="sm" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {t.assignee ?? 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {t.status !== 'done' && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleStatusChange(t.id, 'done')}
                        aria-label="Mark done"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon-sm" aria-label="Link PR">
                      <GitPullRequest className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
