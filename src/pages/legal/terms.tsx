import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArrowLeft, Printer, FileText, Shield, DollarSign, Mail } from 'lucide-react'
import { getToSContent, submitConsent, type ToSSection } from '@/api/tos'
import { cn } from '@/lib/utils'

function PolicyBullet({
  text,
  emphasis,
}: {
  text: string
  emphasis?: boolean
}) {
  return (
    <li
      className={cn(
        'flex gap-2 text-sm leading-relaxed',
        emphasis && 'font-medium text-foreground'
      )}
    >
      <span className="text-primary mt-1.5 shrink-0">•</span>
      <span className={emphasis ? 'text-foreground' : 'text-muted-foreground'}>
        {text}
      </span>
    </li>
  )
}

function SectionBlock({
  section,
}: {
  section: ToSSection
}) {
  const subsections = section.subsections ?? []
  return (
    <section
      id={section.id}
      className="scroll-mt-24 animate-in-up"
      style={{ animationDelay: '0ms' }}
    >
      <h2 className="text-lg font-semibold text-foreground mb-3 mt-8 first:mt-0">
        {section.title}
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        {section.content}
      </p>
      {subsections.length > 0 && (
        <div className="space-y-3 pl-4 border-l-2 border-primary/30">
          {subsections.map((sub, i) => (
            <div key={i}>
              <h3 className="text-sm font-medium text-foreground mb-1">
                {sub.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {sub.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function AcceptDeclineBar({
  onAccept,
  onDecline,
  isLoading,
  hasConsented,
}: {
  onAccept: () => void
  onDecline: () => void
  isLoading: boolean
  hasConsented: boolean
}) {
  if (hasConsented) {
    return (
      <div className="flex items-center gap-2 text-success text-sm">
        <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
        Terms accepted
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={onAccept}
        disabled={isLoading}
        className="min-w-[120px]"
        aria-label="Accept Terms of Service"
      >
        {isLoading ? (
          <span className="animate-pulse">Processing...</span>
        ) : (
          'Accept'
        )}
      </Button>
      <Button
        variant="outline"
        onClick={onDecline}
        disabled={isLoading}
        aria-label="Decline Terms of Service"
      >
        Decline
      </Button>
    </div>
  )
}

function LegalFooter() {
  const links = [
    { to: '/privacy', label: 'Privacy Policy', icon: Shield },
    { to: '/terms', label: 'Acceptable Use', icon: FileText },
    { to: '/terms#billing', label: 'Refund Policy', icon: DollarSign },
    { to: '/help', label: 'Contact Support', icon: Mail },
  ]
  return (
    <footer className="mt-12 pt-8 border-t border-border">
      <div className="flex flex-wrap gap-6">
        {(links ?? []).map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  )
}

export function TermsPage() {
  const [content, setContent] = useState<{
    sections: ToSSection[]
    effectiveDate: string
    billingTerms: string[]
    version: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [consentLoading, setConsentLoading] = useState(false)
  const [hasConsented, setHasConsented] = useState(false)
  const [declineOpen, setDeclineOpen] = useState(false)
  const [printMode, setPrintMode] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    getToSContent()
      .then((data) => {
        if (!cancelled && data) {
          const sections = Array.isArray(data.sections) ? data.sections : []
          setContent({
            sections,
            effectiveDate: data.effectiveDate ?? '',
            billingTerms: Array.isArray(data.billingTerms) ? data.billingTerms : [],
            version: data.version ?? '1.0',
          })
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleAccept = async () => {
    setConsentLoading(true)
    try {
      const result = await submitConsent(true)
      setHasConsented(true)
      toast.success('Terms accepted. Proceeding to signup.')
      if (result?.nextRoute) {
        navigate(result.nextRoute)
      }
    } catch {
      toast.error('Failed to submit consent. Please try again.')
    } finally {
      setConsentLoading(false)
    }
  }

  const handleDecline = () => {
    setDeclineOpen(true)
  }

  const handleDeclineConfirm = async () => {
    setConsentLoading(true)
    try {
      await submitConsent(false)
      setDeclineOpen(false)
      toast.info('You have declined. Contact support if you have questions.')
      navigate('/')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setConsentLoading(false)
    }
  }

  const handlePrint = () => {
    setPrintMode(true)
    requestAnimationFrame(() => {
      window.print()
      setPrintMode(false)
    })
  }

  const sections = content?.sections ?? []
  const billingTerms = content?.billingTerms ?? []
  const effectiveDate = content?.effectiveDate ?? ''

  return (
    <div
      className={cn(
        'min-h-screen p-4 lg:p-8',
        printMode && 'print:bg-white print:text-black'
      )}
    >
      <div className="max-w-3xl mx-auto">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors print:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="flex items-center gap-3 print:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrint}
              aria-label="Print Terms of Service"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <AcceptDeclineBar
              onAccept={handleAccept}
              onDecline={handleDecline}
              isLoading={consentLoading}
              hasConsented={hasConsented}
            />
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-2xl lg:text-3xl">
                Terms of Service
              </CardTitle>
              {effectiveDate && (
                <Badge variant="secondary" className="shrink-0">
                  Effective: {effectiveDate}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm">
              Please read these terms carefully before using LifeOps.
            </p>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            {isLoading ? (
              <div className="space-y-6 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-5 w-48 bg-muted rounded" />
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-3/4 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {sections.map((section) => (
                  <SectionBlock key={section.id} section={section} />
                ))}

                {billingTerms.length > 0 && (
                  <section id="billing" className="mt-10 pt-6 border-t border-border scroll-mt-24">
                    <h2 className="text-lg font-semibold text-foreground mb-4">
                      Subscription and Billing Summary
                    </h2>
                    <ul className="space-y-2">
                      {billingTerms.map((term, i) => (
                        <PolicyBullet key={i} text={term} />
                      ))}
                    </ul>
                  </section>
                )}

                <LegalFooter />
              </>
            )}
          </CardContent>
        </Card>

        {/* Sticky Accept/Decline bar on mobile */}
        <div className="mt-8 flex justify-center print:hidden lg:hidden">
          <AcceptDeclineBar
            onAccept={handleAccept}
            onDecline={handleDecline}
            isLoading={consentLoading}
            hasConsented={hasConsented}
          />
        </div>
      </div>

      {/* Decline confirmation dialog */}
      <Dialog open={declineOpen} onOpenChange={setDeclineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Terms of Service?</DialogTitle>
            <DialogDescription>
              Declining may restrict account creation or access to LifeOps. If
              you have questions about the terms, you can contact support for
              clarification before deciding.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeclineOpen(false)}
              disabled={consentLoading}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              asChild
            >
              <Link to="/help">Contact Support</Link>
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeclineConfirm}
              disabled={consentLoading}
            >
              {consentLoading ? 'Processing...' : 'Decline and Exit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
