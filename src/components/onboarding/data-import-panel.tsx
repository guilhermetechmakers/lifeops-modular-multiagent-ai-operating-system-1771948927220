/**
 * DataImportPanel - Trigger data import from connected integrations.
 * Includes validation and mapping previews.
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Loader2, Database, AlertCircle } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding-store'
import { useTriggerImport } from '@/hooks/use-onboarding'
import { cn } from '@/lib/utils'


export function DataImportPanel() {
  const { state } = useOnboardingStore()
  const { run } = useTriggerImport()
  const connectors = state.connectors ?? []
  const imports = state.dataImports ?? []
  const [importingSource, setImportingSource] = useState<string | null>(null)

  const connected = (connectors ?? []).filter((c) => c.status === 'connected')
  const importList = imports ?? []

  const handleImport = async (sourceId: string, type: 'sample' | 'real') => {
    setImportingSource(sourceId)
    await run(sourceId, { type })
    setImportingSource(null)
  }

  if (connected.length === 0) {
    return (
      <div
        className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center"
        role="status"
      >
        <Database className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden />
        <p className="mt-4 text-muted-foreground">
          Connect at least one integration to import data.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Go back to the Connect Integrations step to add GitHub, Plaid, Stripe, or others.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Import sample or real data from your connected sources. Data is validated and mapped to
        LifeOps models.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {(connected ?? []).map((connector) => {
          const existingImport = importList.find((i) => i.source_id === connector.provider_key)
          const status = existingImport?.status ?? 'pending'
          const isImportingThis = importingSource === connector.provider_key
          return (
            <Card
              key={connector.id}
              className={cn(
                'rounded-xl border transition-all duration-300',
                status === 'completed' && 'border-success/30 bg-success/5',
                status === 'failed' && 'border-destructive/30',
                'hover:shadow-card-hover'
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      {connector.display_name ?? connector.provider_key}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {status === 'completed' && 'Import complete'}
                      {status === 'failed' && 'Import failed'}
                      {status === 'running' && 'Importing...'}
                      {status === 'pending' && 'Not imported'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {status === 'completed' && (
                      <span className="flex items-center gap-1 text-success" aria-label="Complete">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                    {status === 'failed' && (
                      <AlertCircle className="h-4 w-4 text-destructive" aria-label="Failed" />
                    )}
                    {status !== 'completed' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleImport(connector.provider_key, 'sample')}
                          disabled={importingSource !== null}
                          aria-label={`Import sample data from ${connector.display_name ?? connector.provider_key}`}
                        >
                          {isImportingThis ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Sample'
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleImport(connector.provider_key, 'real')}
                          disabled={importingSource !== null}
                          aria-label={`Import real data from ${connector.display_name ?? connector.provider_key}`}
                        >
                          {isImportingThis ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Real'
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
