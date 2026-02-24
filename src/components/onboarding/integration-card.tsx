/**
 * IntegrationCard - Displays provider status, connect button, and lifecycle state.
 */
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Github, Workflow, Wallet, CreditCard, Heart, ChevronRight, Check, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Connector, ConnectorStatus } from '@/types/onboarding'

const PROVIDER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  cicd: Workflow,
  plaid: Wallet,
  stripe: CreditCard,
  healthkit: Heart,
}

const PROVIDER_NAMES: Record<string, string> = {
  github: 'GitHub',
  cicd: 'CI/CD',
  plaid: 'Plaid',
  stripe: 'Stripe',
  healthkit: 'HealthKit',
}

function statusToVariant(status: ConnectorStatus): 'default' | 'secondary' | 'success' | 'warning' | 'destructive' {
  switch (status) {
    case 'connected':
      return 'success'
    case 'error':
    case 'disconnected':
      return 'destructive'
    case 'refreshing':
      return 'warning'
    default:
      return 'secondary'
  }
}

function statusLabel(status: ConnectorStatus): string {
  switch (status) {
    case 'connected':
      return 'Connected'
    case 'error':
      return 'Error'
    case 'refreshing':
      return 'Refreshing'
    case 'disconnected':
      return 'Disconnected'
    default:
      return 'Not connected'
  }
}

export interface IntegrationCardProps {
  connector: Connector
  onConnect: (providerKey: string) => void
  onDisconnect: (providerKey: string) => void
  disabled?: boolean
}

export function IntegrationCard({ connector, onConnect, onDisconnect, disabled }: IntegrationCardProps) {
  const Icon = PROVIDER_ICONS[connector.provider_key] ?? Workflow
  const name = connector.display_name ?? PROVIDER_NAMES[connector.provider_key] ?? connector.provider_key
  const isConnected = connector.status === 'connected'
  const isLoading = connector.status === 'refreshing'

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-xl border border-[#26282C] bg-[#1F2124]',
        'transition-all duration-200 hover:border-primary/30 hover:shadow-card',
        'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background'
      )}
      role="article"
      aria-label={`${name} integration ${statusLabel(connector.status)}`}
    >
      <div className="flex items-center gap-4">
        <div className="rounded-lg p-2.5 bg-card border border-border">
          <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
        </div>
        <div>
          <p className="font-semibold text-white">{name}</p>
          <Badge variant={statusToVariant(connector.status)} className="mt-1">
            {isLoading && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
            {statusLabel(connector.status)}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <Check className="h-4 w-4 text-success" aria-hidden />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDisconnect(connector.provider_key)}
              disabled={disabled}
              aria-label={`Disconnect ${name}`}
            >
              Disconnect
            </Button>
          </>
        ) : connector.status === 'error' ? (
          <>
            <AlertCircle className="h-4 w-4 text-destructive" aria-hidden />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onConnect(connector.provider_key)}
              disabled={disabled}
              aria-label={`Retry connecting ${name}`}
            >
              Retry
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            onClick={() => onConnect(connector.provider_key)}
            disabled={disabled || isLoading}
            aria-label={`Connect ${name}`}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Connect
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
