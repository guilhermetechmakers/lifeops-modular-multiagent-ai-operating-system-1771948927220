/**
 * BulkActionsBar - Bulk categorize, tag, reconcile, export; contextual enable/disable.
 */

import { useState, useCallback } from 'react'
import { Tag, FileCheck, Download, FolderOpen, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { Category, Tag as TagType } from '@/types/transactions-reconciliation'

export interface BulkActionsBarProps {
  selectedCount: number
  categories: Category[]
  tags: TagType[]
  onBulkCategorize: (categoryId: string, note?: string) => void
  onBulkTag: (tagId: string) => void
  onBulkReconcile: () => void
  onExport: () => void
  onClearSelection: () => void
  isLoading?: boolean
  className?: string
}

export function BulkActionsBar({
  selectedCount,
  categories = [],
  tags = [],
  onBulkCategorize,
  onBulkTag,
  onBulkReconcile,
  onExport,
  onClearSelection,
  isLoading = false,
  className,
}: BulkActionsBarProps) {
  const [categorizeOpen, setCategorizeOpen] = useState(false)
  const [tagOpen, setTagOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [selectedTagId, setSelectedTagId] = useState<string>('')
  const [categorizeNote, setCategorizeNote] = useState<string>('')

  const handleCategorizeConfirm = useCallback(() => {
    if (selectedCategoryId) {
      onBulkCategorize(selectedCategoryId, categorizeNote || undefined)
      setCategorizeOpen(false)
      setSelectedCategoryId('')
      setCategorizeNote('')
    }
  }, [selectedCategoryId, categorizeNote, onBulkCategorize])

  const handleTagConfirm = useCallback(() => {
    if (selectedTagId) {
      onBulkTag(selectedTagId)
      setTagOpen(false)
      setSelectedTagId('')
    }
  }, [selectedTagId, onBulkTag])

  if (selectedCount === 0) return null

  return (
    <>
      <div
        className={cn(
          'flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card animate-in-up',
          className
        )}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium">{selectedCount} selected</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="gap-1"
            aria-label="Clear selection"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCategorizeOpen(true)}
            disabled={isLoading || categories.length === 0}
            className="gap-2"
          >
            <FolderOpen className="h-4 w-4" />
            Categorize
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTagOpen(true)}
            disabled={isLoading || tags.length === 0}
            className="gap-2"
          >
            <Tag className="h-4 w-4" />
            Tag
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkReconcile}
            disabled={isLoading}
            className="gap-2"
          >
            <FileCheck className="h-4 w-4" />
            Reconcile
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={isLoading}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Dialog open={categorizeOpen} onOpenChange={setCategorizeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Categorize {selectedCount} transaction(s)</DialogTitle>
            <DialogDescription>
              Select a category to apply to all selected transactions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(categories ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Note (optional)</label>
              <input
                type="text"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="Add a note..."
                value={categorizeNote}
                onChange={(e) => setCategorizeNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategorizeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCategorizeConfirm} disabled={!selectedCategoryId}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={tagOpen} onOpenChange={setTagOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tag {selectedCount} transaction(s)</DialogTitle>
            <DialogDescription>
              Select a tag to apply to all selected transactions.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Tag</label>
            <Select value={selectedTagId} onValueChange={setSelectedTagId}>
              <SelectTrigger>
                <SelectValue placeholder="Select tag" />
              </SelectTrigger>
              <SelectContent>
                {(tags ?? []).map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTagConfirm} disabled={!selectedTagId}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
