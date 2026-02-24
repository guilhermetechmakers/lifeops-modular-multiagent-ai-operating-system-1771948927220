/**
 * ModuleSelectorPanel - Toggles for modules, recommended templates, quick-start presets.
 */

import { useEffect, useState } from 'react'
import { FolderKanban, FileText, Wallet, Heart, Sparkles } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding-store'
import { fetchModules } from '@/api/onboarding'
import { cn } from '@/lib/utils'
import type { ModuleConfig } from '@/types/onboarding'

const DEFAULT_MODULES: ModuleConfig[] = [
  { id: '1', module_key: 'projects', name: 'Developer Projects', description: 'Roadmaps, tickets, PRs, CI', recommended: true },
  { id: '2', module_key: 'content', name: 'Content', description: 'Content pipeline, publishing', recommended: true },
  { id: '3', module_key: 'finance', name: 'Finance', description: 'Transactions, reconciliation', recommended: false },
  { id: '4', module_key: 'health', name: 'Health', description: 'Habits, training, recovery', recommended: false },
]

const MODULE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  projects: FolderKanban,
  content: FileText,
  finance: Wallet,
  health: Heart,
}

export function ModuleSelectorPanel() {
  const { state, setSelectedModules } = useOnboardingStore()
  const selected = state.selectedModules ?? []
  const [modules, setModules] = useState<ModuleConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchModules()
      .then(setModules)
      .finally(() => setIsLoading(false))
  }, [])

  const list = Array.isArray(modules) && modules.length > 0 ? modules : DEFAULT_MODULES
  const selectedSet = new Set(selected ?? [])

  const toggle = (key: string) => {
    const next = selectedSet.has(key)
      ? (selected ?? []).filter((m) => m !== key)
      : [...(selected ?? []), key]
    setSelectedModules(next)
  }

  const applyPreset = (preset: string[]) => {
    setSelectedModules(preset)
  }

  const recommendedKeys = (list ?? []).filter((m) => m.recommended).map((m) => m.module_key)
  const quickStartPreset = recommendedKeys.length > 0 ? recommendedKeys : ['projects', 'content']

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => applyPreset(quickStartPreset)}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200',
            'border-primary/50 bg-primary/10 text-primary hover:bg-primary/20',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
          aria-label="Apply recommended modules"
        >
          <Sparkles className="h-4 w-4" />
          Quick start (recommended)
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2" role="group" aria-label="Module selection">
        {(list ?? []).map((mod) => {
          const Icon = MODULE_ICONS[mod.module_key] ?? FolderKanban
          const isSelected = selectedSet.has(mod.module_key)
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => toggle(mod.module_key)}
              className={cn(
                'flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50 hover:bg-card/50'
              )}
              aria-pressed={isSelected}
              aria-label={`${isSelected ? 'Deselect' : 'Select'} ${mod.name}`}
            >
              <div className="rounded-lg p-2 bg-muted">
                <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{mod.name}</p>
                <p className="text-sm text-muted-foreground truncate">{mod.description}</p>
                {mod.recommended && (
                  <span className="inline-flex items-center gap-1 mt-1 text-xs text-primary">
                    <Sparkles className="h-3 w-3" />
                    Recommended
                  </span>
                )}
              </div>
              <div
                className={cn(
                  'h-5 w-5 rounded-full border-2 shrink-0 transition-colors',
                  isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                )}
                aria-hidden
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
