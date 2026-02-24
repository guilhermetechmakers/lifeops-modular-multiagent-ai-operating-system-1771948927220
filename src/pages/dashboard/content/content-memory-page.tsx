/**
 * ContentMemoryPage - Scoped memory, Vector DB bridge, TTL controls.
 * Read/write scoped memory entries, TTL controls, access permissions, memory usage analytics.
 */

import { useState, useCallback } from 'react'
import { MemoryViewport } from '@/components/content-dashboard/memory-viewport'
import { VectorDBBridge } from '@/components/content-dashboard/vector-db-bridge'
import { fetchVectorMemory } from '@/api/content-dashboard'

export function ContentMemoryPage() {
  const [vectorSearchLoading, setVectorSearchLoading] = useState(false)

  const handleVectorSearch = useCallback(async (query: string) => {
    if (!query.trim()) return
    setVectorSearchLoading(true)
    try {
      await fetchVectorMemory('content')
    } finally {
      setVectorSearchLoading(false)
    }
  }, [])

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold">Memory & Vector DB</h1>
        <p className="text-muted-foreground mt-1">
          Scoped memory entries, TTL controls, access permissions, semantic search
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MemoryViewport scope="content" />
        <VectorDBBridge onSearch={handleVectorSearch} isLoading={vectorSearchLoading} />
      </div>
    </div>
  )
}
