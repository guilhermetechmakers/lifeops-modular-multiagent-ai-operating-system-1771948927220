/**
 * CITriggerManager - List and editor for CI/CD triggers and templates.
 */

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Zap, Plus, Pencil } from 'lucide-react'
import { fetchCITriggers, createCITrigger, updateCITrigger } from '@/api/projects'
import type { CITrigger } from '@/types/projects'
import { toast } from 'sonner'

interface CITriggerManagerProps {
  projectId?: string | null
}

export function CITriggerManager({ projectId }: CITriggerManagerProps) {
  const [triggers, setTriggers] = useState<CITrigger[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTrigger, setEditingTrigger] = useState<CITrigger | null>(null)
  const [formName, setFormName] = useState('')
  const [formEnabled, setFormEnabled] = useState(true)

  const loadTriggers = async () => {
    const list = await fetchCITriggers(projectId ?? undefined)
    setTriggers(Array.isArray(list) ? list : [])
  }

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    fetchCITriggers(projectId ?? undefined).then((list) => {
      if (!cancelled) {
        setTriggers(Array.isArray(list) ? list : [])
        setIsLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [projectId])

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error('Name is required')
      return
    }
    try {
      if (editingTrigger) {
        await updateCITrigger(editingTrigger.id, { name: formName, enabled: formEnabled })
        toast.success('Trigger updated')
      } else {
        await createCITrigger({ name: formName, enabled: formEnabled, projectId: projectId ?? undefined })
        toast.success('Trigger created')
      }
      setDialogOpen(false)
      setEditingTrigger(null)
      loadTriggers()
    } catch {
      toast.error('Failed to save')
    }
  }

  const openEdit = (t?: CITrigger | null) => {
    setEditingTrigger(t ?? null)
    setFormName(t?.name ?? '')
    setFormEnabled(t?.enabled ?? true)
    setDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            CI/CD Triggers
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Configure pipelines and automation triggers
          </p>
        </div>
        <Button onClick={() => openEdit()} className="gap-2">
          <Plus className="h-4 w-4" />
          New Trigger
        </Button>
      </div>

      <div className="grid gap-4">
        {triggers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Zap className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center max-w-sm">
                No CI triggers configured. Create one to automate your pipelines.
              </p>
              <Button variant="outline" className="mt-4 gap-2" onClick={() => openEdit()}>
                <Plus className="h-4 w-4" />
                Create Trigger
              </Button>
            </CardContent>
          </Card>
        ) : (
          (triggers ?? []).map((t) => (
            <Card key={t.id} className="transition-all duration-300 hover:shadow-card-hover">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-sm text-muted-foreground">Project: {t.projectId ?? 'Global'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={t.enabled ? 'success' : 'secondary'}>
                    {t.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(t)} aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTrigger ? 'Edit Trigger' : 'New Trigger'}</DialogTitle>
            <DialogDescription>Configure the CI/CD trigger name and status</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Deploy on merge"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enabled"
                checked={formEnabled}
                onChange={(e) => setFormEnabled(e.target.checked)}
                className="rounded border-input"
              />
              <Label htmlFor="enabled">Enabled</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
