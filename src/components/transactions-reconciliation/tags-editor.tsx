/**
 * TagsEditor - Add/remove tags, tag suggestions, tag-based filtering.
 */

import { useState, useCallback } from 'react'
import { X, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Tag } from '@/types/transactions-reconciliation'

export interface TagsEditorProps {
  tags: string[]
  availableTags: Tag[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
}

export function TagsEditor({
  tags = [],
  availableTags = [],
  onChange,
  placeholder = 'Add tag...',
  className,
}: TagsEditorProps) {
  const [inputValue, setInputValue] = useState('')
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)

  const currentIds = Array.isArray(tags) ? tags : []
  const available = Array.isArray(availableTags) ? availableTags : []

  const handleAdd = useCallback(
    (tagId: string) => {
      if (!currentIds.includes(tagId)) {
        onChange([...currentIds, tagId])
      }
      setInputValue('')
      setSuggestionsOpen(false)
    },
    [currentIds, onChange]
  )

  const handleRemove = useCallback(
    (tagId: string) => {
      onChange(currentIds.filter((id) => id !== tagId))
    },
    [currentIds, onChange]
  )

  const filteredSuggestions = available.filter(
    (t) =>
      !currentIds.includes(t.id) &&
      (inputValue === '' || t.name.toLowerCase().includes(inputValue.toLowerCase()))
  )

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap gap-2">
        {currentIds.map((id) => {
          const tag = available.find((t) => t.id === id)
          return tag ? (
            <Badge
              key={tag.id}
              variant="secondary"
              className="gap-1 pr-1"
              style={{ borderColor: tag.color }}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleRemove(tag.id)}
                className="rounded-full p-0.5 hover:bg-muted"
                aria-label={`Remove ${tag.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ) : null
        })}
        <div className="relative">
          <Input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setSuggestionsOpen(true)
            }}
            onFocus={() => setSuggestionsOpen(true)}
            onBlur={() => setTimeout(() => setSuggestionsOpen(false), 150)}
            placeholder={placeholder}
            className="w-32"
          />
          {suggestionsOpen && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 mt-1 z-10 w-48 rounded-lg border border-border bg-card shadow-lg py-1">
              {filteredSuggestions.slice(0, 5).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                  onClick={() => handleAdd(t.id)}
                >
                  <Plus className="h-4 w-4" />
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
