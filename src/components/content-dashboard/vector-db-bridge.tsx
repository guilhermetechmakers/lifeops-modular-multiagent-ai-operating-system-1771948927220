/**
 * VectorDBBridge - Memory index viewer, search by embeddings, TTL-driven pruning.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Database } from 'lucide-react'

interface VectorDBBridgeProps {
  onSearch?: (query: string) => void
  isLoading?: boolean
}

export function VectorDBBridge({ onSearch, isLoading }: VectorDBBridgeProps) {
  const [query, setQuery] = useState('')

  const handleSearch = () => {
    onSearch?.(query)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Vector DB
        </CardTitle>
        <CardDescription>
          Search by embeddings. TTL-driven pruning and access controls.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search by semantic query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isLoading} className="gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Vector memory is used for semantic retrieval. Results appear in the Memory panel.
        </p>
      </CardContent>
    </Card>
  )
}
