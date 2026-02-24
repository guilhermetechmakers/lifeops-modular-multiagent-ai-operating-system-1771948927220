/**
 * ContentListLibraryPage - Browse, search, filter content drafts, published items, templates.
 * Full-featured library with SearchFilterBar, ContentCard, BulkActionBar, QuickPreviewModal.
 */

import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Library, LayoutGrid, List, LayoutDashboard } from 'lucide-react'
import { useContentLibrary } from '@/hooks/use-content-library'
import {
  SearchFilterBar,
  ContentCard,
  BulkActionBar,
  QuickPreviewModal,
  EmptyState,
  CreateContentShortcut,
} from '@/components/content-library'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import type { ContentItem, BulkActionType } from '@/types/content-dashboard'

export function ContentListLibraryPage() {
  const navigate = useNavigate()
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)

  const {
    items,
    totalCount,
    loading,
    error,
    selectedIds,
    filters,
    updateFilters,
    clearFilters,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    fetchPreview,
    fetchVersions,
    performBulkAction,
    refetch,
  } = useContentLibrary()

  const displayItems = Array.isArray(items) ? items : []
  const viewMode = filters.view ?? 'grid'
  const hasActiveFilters =
    !!filters.search ||
    (filters.status && filters.status !== 'all') ||
    !!filters.quickFilter

  const handleBulkAction = useCallback(
    async (action: BulkActionType) => {
      setBulkLoading(true)
      try {
        const res = await performBulkAction(action)
        if (res.success) {
          toast.success(`${action} completed for ${res.results?.length ?? 0} items`)
          refetch()
        } else {
          const errCount = (res.results ?? []).filter((r) => r.status === 'error').length
          toast.error(errCount > 0 ? `${errCount} items failed` : 'Action failed')
        }
      } catch {
        toast.error('Action failed')
      } finally {
        setBulkLoading(false)
      }
    },
    [performBulkAction, refetch]
  )

  const handleOpenInEditor = useCallback(
    (item: ContentItem) => {
      setPreviewItem(null)
      navigate(`/dashboard/content?item=${item.id}`)
    },
    [navigate]
  )

  const handleDuplicate = useCallback(
    (item: ContentItem) => {
      setPreviewItem(null)
      navigate(`/dashboard/content?duplicate=${item.id}`)
      toast.success('Opening duplicate flow')
    },
    [navigate]
  )

  return (
    <div className="space-y-6 animate-fade-in-up p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Library className="h-8 w-8 text-primary" />
            Content Library
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse drafts, published items, and templates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreateContentShortcut variant="default" className="gap-2" />
          <Link to="/dashboard/content/master">
            <Button variant="outline" size="sm" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Master Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <SearchFilterBar
        search={filters.search ?? ''}
        onSearchChange={(v) => updateFilters({ search: v })}
        status={filters.status ?? 'all'}
        onStatusChange={(v) =>
          updateFilters({
            status: v === 'all' ? undefined : (v as ContentItem['status']),
          })
        }
        sort={filters.sort}
        onSortChange={(v) => updateFilters({ sort: v })}
        sortOrder={filters.sortOrder ?? 'desc'}
        onSortOrderChange={(v) => updateFilters({ sortOrder: v })}
        quickFilter={filters.quickFilter}
        onQuickFilterChange={(v) => updateFilters({ quickFilter: v })}
        onClearFilters={clearFilters}
        hasActiveFilters={!!hasActiveFilters}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {displayItems.length > 0 && (
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <Checkbox
                checked={selectedIds.length === displayItems.length && displayItems.length > 0}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all items"
              />
              <span className="text-muted-foreground">Select all</span>
            </label>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilters({ view: 'grid' })}
              aria-pressed={viewMode === 'grid'}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilters({ view: 'list' })}
              aria-pressed={viewMode === 'list'}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {totalCount} {totalCount === 1 ? 'item' : 'items'}
        </p>
      </div>

      {selectedIds.length > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.length}
          onSchedule={() => handleBulkAction('schedule')}
          onAssign={() => handleBulkAction('assign')}
          onArchive={() => handleBulkAction('archive')}
          onDelete={() => handleBulkAction('delete')}
          onMoveToTemplate={() => handleBulkAction('move_to_template')}
          onClearSelection={clearSelection}
          isLoading={bulkLoading}
        />
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-2'
          }
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className={viewMode === 'grid' ? 'h-48 rounded-xl' : 'h-20 rounded-lg'}
            />
          ))}
        </div>
      ) : displayItems.length === 0 ? (
        <EmptyState
          icon={Library}
          title="No content found"
          description={
            hasActiveFilters
              ? 'Try adjusting your search or filters to find what you need.'
              : 'Create your first content item to get started. Use the pipeline to go from idea to published.'
          }
          actionLabel={hasActiveFilters ? undefined : 'Create Content'}
          onAction={hasActiveFilters ? undefined : () => navigate('/dashboard/content')}
          secondaryActionLabel={hasActiveFilters ? 'Clear filters' : undefined}
          onSecondaryAction={hasActiveFilters ? clearFilters : undefined}
        />
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-2'
          }
        >
          {(displayItems ?? []).map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              viewMode={viewMode}
              selected={selectedIds.includes(item.id)}
              onSelect={toggleSelect}
              onPreview={setPreviewItem}
              onOpen={handleOpenInEditor}
              showPipeline
            />
          ))}
        </div>
      )}

      {totalCount > (filters.pageSize ?? 24) && (
        <div className="flex justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={(filters.page ?? 1) <= 1}
            onClick={() => updateFilters({ page: (filters.page ?? 1) - 1 })}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {filters.page ?? 1} of {Math.ceil(totalCount / (filters.pageSize ?? 24))}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={(filters.page ?? 1) >= Math.ceil(totalCount / (filters.pageSize ?? 24))}
            onClick={() => updateFilters({ page: (filters.page ?? 1) + 1 })}
          >
            Next
          </Button>
        </div>
      )}

      <QuickPreviewModal
        item={previewItem}
        open={!!previewItem}
        onClose={() => setPreviewItem(null)}
        onEdit={handleOpenInEditor}
        onSchedule={handleOpenInEditor}
        onPublish={handleOpenInEditor}
        onDuplicate={handleDuplicate}
        fetchPreview={fetchPreview}
        fetchVersions={fetchVersions}
      />
    </div>
  )
}
