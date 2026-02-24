/**
 * RoadmapPanel - Timeline with milestones, due dates, owners, status.
 * Inline milestone editor (add/edit/delete) with validation.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Map, Plus, Pencil, Trash2 } from 'lucide-react'
import type { RoadmapDetail, RoadmapMilestone } from '@/types/project-detail'

export interface RoadmapPanelProps {
  projectId: string
  roadmap: RoadmapDetail | null
  onRefresh: () => void
  onCreateMilestone: (payload: Partial<RoadmapMilestone>) => Promise<void>
  onUpdateMilestone: (milestoneId: string, payload: Partial<RoadmapMilestone>) => Promise<void>
  onDeleteMilestone: (milestoneId: string) => Promise<void>
}

export function RoadmapPanel({
  projectId: _projectId,
  roadmap,
  onRefresh,
  onCreateMilestone,
  onUpdateMilestone,
  onDeleteMilestone,
}: RoadmapPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [form, setForm] = useState<Partial<RoadmapMilestone>>({ title: '', dueDate: '', status: 'pending', owner: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const milestones = Array.isArray(roadmap?.milestones) ? roadmap.milestones : []

  const handleSubmitAdd = async () => {
    if (!form.title?.trim()) return
    setIsSubmitting(true)
    try {
      await onCreateMilestone(form)
      setForm({ title: '', dueDate: '', status: 'pending', owner: '' })
      setIsAddOpen(false)
      onRefresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitEdit = async (milestoneId: string) => {
    if (!form.title?.trim()) return
    setIsSubmitting(true)
    try {
      await onUpdateMilestone(milestoneId, form)
      setEditingId(null)
      setForm({ title: '', dueDate: '', status: 'pending', owner: '' })
      onRefresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (milestoneId: string) => {
    if (!confirm('Delete this milestone?')) return
    setIsSubmitting(true)
    try {
      await onDeleteMilestone(milestoneId)
      setEditingId(null)
      onRefresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  const startEdit = (m: RoadmapMilestone) => {
    setEditingId(m.id)
    setForm({
      title: m.title,
      dueDate: m.dueDate ?? '',
      status: m.status,
      owner: m.owner ?? '',
      notes: m.notes ?? '',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            Roadmap
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Milestones, timelines, ownership, and status
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Milestone
        </Button>
      </div>

      {milestones.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Map className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center max-w-sm">
              No milestones yet. Add milestones to track progress and timelines.
            </p>
            <Button variant="outline" className="mt-4 gap-2" onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Milestone
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {(milestones ?? []).map((m) => (
            <Card
              key={m.id}
              className="transition-all duration-300 hover:shadow-card-hover hover:border-primary/20"
            >
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {editingId === m.id ? (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`title-${m.id}`}>Title</Label>
                        <Input
                          id={`title-${m.id}`}
                          value={form.title ?? ''}
                          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                          className="mt-1"
                          placeholder="Milestone title"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`due-${m.id}`}>Due Date</Label>
                          <Input
                            id={`due-${m.id}`}
                            type="date"
                            value={form.dueDate ?? ''}
                            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`status-${m.id}`}>Status</Label>
                          <select
                            id={`status-${m.id}`}
                            value={form.status ?? 'pending'}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                status: e.target.value as RoadmapMilestone['status'],
                              }))
                            }
                            className="mt-1 flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`owner-${m.id}`}>Owner</Label>
                        <Input
                          id={`owner-${m.id}`}
                          value={form.owner ?? ''}
                          onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
                          className="mt-1"
                          placeholder="Owner name"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSubmitEdit(m.id)} disabled={isSubmitting}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(m.id)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <CardTitle className="text-lg">{m.title}</CardTitle>
                      <CardDescription>
                        {m.dueDate ? `Due ${new Date(m.dueDate).toLocaleDateString()}` : 'No due date'}
                        {m.owner && ` • ${m.owner}`}
                      </CardDescription>
                      {m.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{m.notes}</p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <Badge
                          variant={
                            m.status === 'completed' ? 'success' : m.status === 'in-progress' ? 'default' : 'secondary'
                          }
                        >
                          {m.status}
                        </Badge>
                        {m.owner && (
                          <Avatar name={m.owner} size="sm" className="h-6 w-6 text-xs" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => startEdit(m)}
                          aria-label="Edit milestone"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Add Milestone</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="add-title">Title</Label>
              <Input
                id="add-title"
                value={form.title ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Milestone title"
              />
            </div>
            <div>
              <Label htmlFor="add-due">Due Date</Label>
              <Input
                id="add-due"
                type="date"
                value={form.dueDate ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="add-owner">Owner</Label>
              <Input
                id="add-owner"
                value={form.owner ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
                placeholder="Owner name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAdd} disabled={!form.title?.trim() || isSubmitting}>
              Add Milestone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
