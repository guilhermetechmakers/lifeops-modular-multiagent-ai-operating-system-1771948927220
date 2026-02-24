/**
 * RuleEnginePanel - Create/edit rules for auto-categorization and anomaly flagging.
 */

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Trash2, Play } from 'lucide-react'
import type { Rule, RuleCondition, RuleAction, Category } from '@/types/transactions-reconciliation'

export interface RuleEnginePanelProps {
  rules: Rule[]
  categories: Category[]
  onCreate: (rule: Omit<Rule, 'id'>) => Promise<void | Rule>
  onUpdate: (id: string, updates: Partial<Rule>) => Promise<void | Rule>
  onDelete: (id: string) => Promise<void>
  onTestRule?: (id: string) => void
  className?: string
}

const FIELD_OPTIONS = [
  { value: 'merchant', label: 'Merchant' },
  { value: 'description', label: 'Description' },
  { value: 'amount', label: 'Amount' },
  { value: 'categoryId', label: 'Category' },
]

const OPERATOR_OPTIONS = [
  { value: 'contains', label: 'Contains' },
  { value: 'equals', label: 'Equals' },
  { value: 'gt', label: 'Greater than' },
  { value: 'lt', label: 'Less than' },
  { value: 'gte', label: 'Greater or equal' },
  { value: 'lte', label: 'Less or equal' },
]

export function RuleEnginePanel({
  rules = [],
  categories = [],
  onCreate,
  onUpdate,
  onDelete,
  onTestRule,
  className,
}: RuleEnginePanelProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [conditions, setConditions] = useState<RuleCondition[]>([
    { field: 'merchant', operator: 'contains', value: '' },
  ])
  const [actionType, setActionType] = useState<RuleAction['type']>('categorize')
  const [actionValue, setActionValue] = useState('')
  const [isActive, setIsActive] = useState(true)

  const items = Array.isArray(rules) ? rules : []

  const resetForm = useCallback(() => {
    setName('')
    setConditions([{ field: 'merchant', operator: 'contains', value: '' }])
    setActionType('categorize')
    setActionValue('')
    setIsActive(true)
  }, [])

  const handleAddCondition = useCallback(() => {
    setConditions((prev) => [...prev, { field: 'merchant', operator: 'contains', value: '' }])
  }, [])

  const handleRemoveCondition = useCallback((idx: number) => {
    setConditions((prev) => prev.filter((_, i) => i !== idx))
  }, [])

  const handleConditionChange = useCallback(
    (idx: number, updates: Partial<RuleCondition>) => {
      setConditions((prev) =>
        prev.map((c, i) => (i === idx ? { ...c, ...updates } : c))
      )
    },
    []
  )

  const handleCreate = useCallback(async () => {
    if (!name.trim()) return
    await onCreate({
      name: name.trim(),
      conditions: conditions.filter((c) => c.value !== ''),
      actions: [{ type: actionType, value: actionValue || undefined }],
      isActive,
    })
    setCreateOpen(false)
    resetForm()
  }, [name, conditions, actionType, actionValue, isActive, onCreate, resetForm])

  const handleToggleActive = useCallback(
    async (r: Rule) => {
      await onUpdate(r.id, { isActive: !r.isActive })
    },
    [onUpdate]
  )

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Rule Engine</CardTitle>
        <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1">
          <Plus className="h-4 w-4" />
          New Rule
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No rules yet. Create a rule to auto-categorize or flag anomalies.
            </div>
          ) : (
            items.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{r.name}</p>
                    <Badge
                      variant={r.isActive ? 'default' : 'secondary'}
                      className="text-xs cursor-pointer"
                      onClick={() => handleToggleActive(r)}
                    >
                      {r.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(r.conditions ?? []).map((c) => `${c.field} ${c.operator} ${c.value}`).join(' AND ')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    → {(r.actions ?? []).map((a) => `${a.type}${a.value ? `: ${a.value}` : ''}`).join(', ')}
                  </p>
                </div>
                <div className="flex gap-1">
                  {onTestRule && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onTestRule(r.id)}
                      aria-label="Test rule"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDelete(r.id)}
                    aria-label="Delete"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Rule</DialogTitle>
            <DialogDescription>
              Define conditions and actions for automatic categorization or anomaly flagging.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rule name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Netflix → Entertainment"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Conditions</label>
              {conditions.map((c, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <Select
                    value={c.field}
                    onValueChange={(v) => handleConditionChange(idx, { field: v })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={c.operator}
                    onValueChange={(v) => handleConditionChange(idx, { operator: v })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATOR_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={String(c.value)}
                    onChange={(e) => {
                      const v = e.target.value
                      const num = Number(v)
                      handleConditionChange(idx, {
                        value: c.field === 'amount' && !Number.isNaN(num) ? num : v,
                      })
                    }}
                    placeholder="Value"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemoveCondition(idx)}
                    aria-label="Remove condition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={handleAddCondition}>
                Add condition
              </Button>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Action</label>
              <div className="flex gap-2">
                <Select value={actionType} onValueChange={(v) => setActionType(v as RuleAction['type'])}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="categorize">Categorize</SelectItem>
                    <SelectItem value="tag">Tag</SelectItem>
                    <SelectItem value="flag_anomaly">Flag anomaly</SelectItem>
                  </SelectContent>
                </Select>
                {actionType === 'categorize' && (
                  <Select value={actionValue} onValueChange={setActionValue}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(categories ?? []).map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rule-active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-input"
              />
              <label htmlFor="rule-active" className="text-sm">
                Active
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!name.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
