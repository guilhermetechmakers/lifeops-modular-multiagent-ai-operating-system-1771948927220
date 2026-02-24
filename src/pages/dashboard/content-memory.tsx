/**
 * ContentMemoryPage - Scoped memory and vector DB UI.
 */

import { MemoryViewport } from '@/components/content-dashboard'

export function ContentMemoryPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Memory & Vector DB</h1>
        <p className="text-muted-foreground mt-1">
          Read/write scoped memory, TTLs, access controls
        </p>
      </div>
      <MemoryViewport scope="content" />
    </div>
  )
}
