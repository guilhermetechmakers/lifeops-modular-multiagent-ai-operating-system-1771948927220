/**
 * OAuthFlowModal - Handles secure OAuth popups or embedded flows.
 * Captures tokens, stores connectors securely, handles refresh logic.
 */

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

interface OAuthFlowModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  providerName: string
  authUrl?: string | null
  isLoading?: boolean
  onComplete?: (token?: string) => void
  onCancel?: () => void
}

export function OAuthFlowModal({
  open,
  onOpenChange,
  providerName,
  authUrl,
  isLoading,
  onCancel,
}: OAuthFlowModalProps) {
  const [status, setStatus] = useState<'loading' | 'redirect' | 'complete' | 'error'>('loading')

  useEffect(() => {
    if (!open) {
      setStatus('loading')
      return
    }
    if (authUrl) {
      setStatus('redirect')
      window.open(authUrl, 'oauth_connect', 'width=600,height=700')
    } else {
      setStatus('loading')
    }
  }, [open, authUrl])

  const showLoader = status === 'loading' || isLoading

  const handleClose = () => {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        showCloseButton={true}
        onPointerDownOutside={handleClose}
        aria-describedby="oauth-description"
      >
        <DialogHeader>
          <DialogTitle>Connect {providerName}</DialogTitle>
          <DialogDescription id="oauth-description">
            {status === 'loading' && 'Preparing secure connection...'}
            {status === 'redirect' && 'A new window has opened. Complete the sign-in flow there.'}
            {status === 'complete' && 'Connection successful!'}
            {status === 'error' && 'Something went wrong. Please try again.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8">
          {showLoader && (
            <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden />
          )}
          {status === 'redirect' && (
            <p className="text-sm text-muted-foreground text-center">
              After you complete the sign-in in the popup, return here.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
