/**
 * KanbanBoardComponent - Tickets board with AI triage, swimlanes, filters.
 * Uses HTML5 drag-and-drop for state transitions.
 */

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GripVertical, Sparkles, Filter, User } from 'lucide-react'
import type { Ticket } from '@/types/projects'
import { cn } from '@/lib/utils'

const COLUMNS: { id: Ticket['status']; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
]

const PRIORITY_COLORS: Record<Ticket['priority'], string> = {
  low: 'bg-muted/50 text-muted-foreground',
  medium: 'bg-warning/20 text-warning',
  high: 'bg-destructive/20 text-destructive',
  critical: 'bg-destructive text-white',
}

interface KanbanBoardProps {
  tickets: Ticket[]
  onTicketMove?: (ticketId: string, newStatus: Ticket['status']) => Promise<void>
  onTicketClick?: (ticket: Ticket) => void
  isLoading?: boolean
}

export function KanbanBoard({
  tickets = [],
  onTicketMove,
  onTicketClick,
  isLoading,
}: KanbanBoardProps) {
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  const filteredTickets = (tickets ?? []).filter((t) => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase())
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter
    return matchSearch && matchPriority
  })

  const ticketsByColumn = COLUMNS.reduce(
    (acc, col) => {
      acc[col.id] = filteredTickets.filter((t) => t.status === col.id)
      return acc
    },
    {} as Record<Ticket['status'], Ticket[]>
  )

  const handleDragStart = useCallback((e: React.DragEvent, ticketId: string) => {
    setDraggedId(ticketId)
    e.dataTransfer.setData('text/plain', ticketId)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(columnId)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent, columnId: Ticket['status']) => {
      e.preventDefault()
      setDragOverColumn(null)
      setDraggedId(null)
      const ticketId = e.dataTransfer.getData('text/plain')
      if (!ticketId || !onTicketMove) return
      await onTicketMove(ticketId, columnId)
    },
    [onTicketMove]
  )

  const handleDragEnd = useCallback(() => {
    setDraggedId(null)
    setDragOverColumn(null)
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kanban Board</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map((col) => (
              <div key={col.id} className="min-w-[280px] flex-shrink-0 space-y-3">
                <div className="h-8 bg-muted/50 rounded-lg animate-pulse" />
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-muted/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
          Kanban Board
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-[200px] h-9"
          />
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <Filter className="h-4 w-4 mr-1" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[400px]">
          {COLUMNS.map((col) => (
            <div
              key={col.id}
              className={cn(
                'min-w-[280px] flex-shrink-0 rounded-xl border-2 border-dashed p-3 transition-colors duration-200',
                dragOverColumn === col.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card/50'
              )}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {col.label}
                <span className="ml-2 text-foreground">
                  {(ticketsByColumn[col.id] ?? []).length}
                </span>
              </h4>
              <div className="space-y-2">
                {(ticketsByColumn[col.id] ?? []).map((ticket) => (
                  <div
                    key={ticket.id}
                    draggable={!!onTicketMove}
                    onDragStart={(e) => onTicketMove && handleDragStart(e, ticket.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onTicketClick?.(ticket)}
                    className={cn(
                      'group rounded-lg border border-border bg-card p-3 cursor-pointer transition-all duration-200',
                      'hover:shadow-card-hover hover:border-primary/50',
                      draggedId === ticket.id && 'opacity-50'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {onTicketMove && (
                        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm line-clamp-2">{ticket.title}</p>
                        {ticket.aiTriage?.summary && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-primary/90">
                            <Sparkles className="h-3.5 w-3" />
                            <span className="line-clamp-1">{ticket.aiTriage.summary}</span>
                          </div>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn('text-xs', PRIORITY_COLORS[ticket.priority])}
                          >
                            {ticket.priority}
                          </Badge>
                          {ticket.assigneeId && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              Assigned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
