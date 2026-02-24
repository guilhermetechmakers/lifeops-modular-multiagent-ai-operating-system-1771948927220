/**
 * KanbanBoard - Tickets board with drag-and-drop, AI triage, swimlanes, filters.
 */

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Sparkles, GripVertical, Plus, Filter } from 'lucide-react'
import { fetchTickets, updateTicket } from '@/api/projects'
import type { Ticket, TicketStatus } from '@/types/projects'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const COLUMNS: { id: TicketStatus; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
]

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-destructive/20 text-destructive',
  high: 'bg-destructive/20 text-destructive',
  medium: 'bg-warning/20 text-warning',
  low: 'bg-muted text-muted-foreground',
}

interface KanbanBoardProps {
  projectId: string
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [draggedTicket, setDraggedTicket] = useState<Ticket | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<TicketStatus | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    fetchTickets(projectId).then((list) => {
      if (!cancelled) {
        setTickets(Array.isArray(list) ? list : [])
        setIsLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [projectId])

  const ticketsByColumn = COLUMNS.reduce(
    (acc, col) => {
      acc[col.id] = (tickets ?? []).filter((t) => t.status === col.id)
      return acc
    },
    {} as Record<TicketStatus, Ticket[]>
  )

  const handleDragStart = (e: React.DragEvent, ticket: Ticket) => {
    setDraggedTicket(ticket)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', ticket.id)
  }

  const handleDragOver = (e: React.DragEvent, columnId: TicketStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = async (e: React.DragEvent, newStatus: TicketStatus) => {
    e.preventDefault()
    setDragOverColumn(null)
    const ticket = draggedTicket
    setDraggedTicket(null)
    if (!ticket || ticket.status === newStatus) return

    const prevTickets = [...tickets]
    setTickets((prev) =>
      (prev ?? []).map((t) => (t.id === ticket.id ? { ...t, status: newStatus } : t))
    )

    try {
      await updateTicket(ticket.id, { status: newStatus })
      toast.success(`Moved to ${COLUMNS.find((c) => c.id === newStatus)?.label ?? newStatus}`)
    } catch {
      setTickets(prevTickets)
      toast.error('Failed to update ticket')
    }
  }

  const handleDragEnd = () => {
    setDraggedTicket(null)
    setDragOverColumn(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-96 w-72 shrink-0 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold">Tickets</h2>
        <Button size="sm" variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px] scrollbar-hide">
        {(COLUMNS ?? []).map((col) => {
          const colTickets = ticketsByColumn[col.id] ?? []
          const isOver = dragOverColumn === col.id

          return (
            <div
              key={col.id}
              className={cn(
                'flex-shrink-0 w-72 rounded-xl border-2 border-dashed transition-colors',
                isOver ? 'border-primary bg-primary/5' : 'border-border'
              )}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="p-3 border-b border-border flex items-center justify-between">
                <span className="font-semibold text-sm">{col.label}</span>
                <span className="text-xs text-muted-foreground">{colTickets.length}</span>
              </div>
              <div className="p-2 space-y-2 min-h-[400px]">
                {(colTickets ?? []).map((ticket) => (
                  <Card
                    key={ticket.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, ticket)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      'cursor-grab active:cursor-grabbing transition-all duration-200',
                      draggedTicket?.id === ticket.id && 'opacity-50'
                    )}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 cursor-grab" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{ticket.title}</p>
                          {ticket.aiTriage?.summary && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <Sparkles className="h-3 w-3 text-primary" />
                              <span className="truncate">{ticket.aiTriage.summary}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge className={cn('text-xs', PRIORITY_COLORS[ticket.priority] ?? '')}>
                              {ticket.priority}
                            </Badge>
                            {ticket.assigneeName && (
                              <span className="text-xs text-muted-foreground">{ticket.assigneeName}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-2 text-muted-foreground"
                >
                  <Plus className="h-4 w-4" />
                  Add ticket
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
