/**
 * ModuleSelector - Multi-select pills for Projects, Content, Finance, Health.
 * Shows live summary of selected modules.
 */

import { FolderKanban, FileText, Wallet, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

export const AVAILABLE_MODULES = [
  { id: 'projects', name: 'Projects', icon: FolderKanban, description: 'Roadmaps, tickets, PRs' },
  { id: 'content', name: 'Content', icon: FileText, description: 'Content pipeline, publishing' },
  { id: 'finance', name: 'Finance', icon: Wallet, description: 'Transactions, reconciliation' },
  { id: 'health', name: 'Health', icon: Heart, description: 'Habits, training, recovery' },
] as const

export type ModuleId = (typeof AVAILABLE_MODULES)[number]['id']

interface ModuleSelectorProps {
  selected: string[]
  onChange: (selected: string[]) => void
  disabled?: boolean
  className?: string
}

export function ModuleSelector({
  selected,
  onChange,
  disabled = false,
  className,
}: ModuleSelectorProps) {
  const selectedSet = new Set(selected ?? [])

  const toggle = (id: string) => {
    if (disabled) return
    const next = selectedSet.has(id)
      ? (selected ?? []).filter((m) => m !== id)
      : [...(selected ?? []), id]
    onChange(next)
  }

  return (
    <div className={cn('space-y-3', className)}>
      <p className="text-sm text-muted-foreground">
        Select modules to get started. You can enable more later.
      </p>
      <div className="flex flex-wrap gap-2">
        {(AVAILABLE_MODULES ?? []).map((mod) => {
          const isSelected = selectedSet.has(mod.id)
          const Icon = mod.icon
          return (
            <button
              key={mod.id}
              type="button"
              disabled={disabled}
              onClick={() => toggle(mod.id)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50 hover:bg-card/50'
              )}
              aria-pressed={isSelected}
              aria-label={`${isSelected ? 'Deselect' : 'Select'} ${mod.name}`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {mod.name}
            </button>
          )
        })}
      </div>
      {(selected ?? []).length > 0 && (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          Selected: {(selected ?? []).join(', ')}
        </p>
      )}
    </div>
  )
}
