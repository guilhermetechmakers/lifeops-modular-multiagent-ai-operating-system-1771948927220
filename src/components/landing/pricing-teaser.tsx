import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/data-helpers'
import type { PricingTier } from '@/api/landing'

export interface PricingTeaserProps {
  tiers?: PricingTier[] | null
  disclaimers?: string
  signupHref?: string
  ctaHref?: string
  className?: string
}

export function PricingTeaser({
  tiers = [],
  disclaimers,
  signupHref = '/signup',
  className,
}: PricingTeaserProps) {
  const tierList = Array.isArray(tiers) ? tiers : []

  return (
    <section
      id="pricing"
      className={cn('py-24 lg:py-32 px-4 lg:px-8', className)}
      aria-labelledby="pricing-heading"
    >
      <div className="max-w-7xl mx-auto">
        <h2
          id="pricing-heading"
          className="text-3xl lg:text-4xl font-bold text-center mb-4"
        >
          Simple Pricing
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16">
          Start free, scale as you grow. No hidden fees.
        </p>

        {tierList.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No pricing tiers available at the moment.
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {tierList.map((tier) => {
              const name = tier?.name ?? 'Tier'
              const price = tier?.price ?? 0
              const features = Array.isArray(tier?.features) ? tier.features : []
              const highlight = Boolean(tier?.highlight)
              const cta = tier?.cta ?? 'Get Started'

              const priceDisplay =
                price === 0 && name.toLowerCase().includes('enterprise')
                  ? 'Custom'
                  : formatPrice(price, tier?.currency ?? 'USD')

              return (
                <Card
                  key={tier?.id ?? name}
                  className={cn(
                    'relative overflow-hidden transition-all duration-300 hover:scale-[1.02]',
                    highlight && 'border-primary shadow-glow'
                  )}
                >
                  {highlight && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{name}</CardTitle>
                      {highlight && (
                        <Badge variant="default">Best value</Badge>
                      )}
                    </div>
                    <CardDescription>
                      {tier?.name === 'Starter'
                        ? 'For individuals getting started'
                        : tier?.name === 'Growth'
                          ? 'For growing teams'
                          : tier?.name === 'Enterprise'
                            ? 'For organizations'
                            : 'Plan details'}
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">{priceDisplay}</span>
                      {price > 0 && (
                        <span className="text-muted-foreground">/month</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2" role="list">
                      {features.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-2 text-sm"
                          role="listitem"
                        >
                          <span className="text-success" aria-hidden>
                            ✓
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link to={tier?.ctaHref ?? signupHref} className="block">
                      <Button
                        className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        variant={highlight ? 'default' : 'outline'}
                        aria-label={`${cta} for ${name}`}
                      >
                        {cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {disclaimers && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {disclaimers}
          </p>
        )}
      </div>
    </section>
  )
}
