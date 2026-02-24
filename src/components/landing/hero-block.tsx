import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

export interface CtaConfig {
  label: string
  href: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link'
  primary?: boolean
}

export interface LoginSignupLinks {
  loginHref: string
  signupHref: string
  loginLabel?: string
  signupLabel?: string
}

export interface HeroBlockProps {
  title: React.ReactNode
  subtitle: string
  ctasConfig: CtaConfig[]
  loginSignupLinks?: LoginSignupLinks
  className?: string
}

export function HeroBlock({
  title,
  subtitle,
  ctasConfig = [],
  loginSignupLinks,
  className,
}: HeroBlockProps) {
  const ctas = Array.isArray(ctasConfig) ? ctasConfig : []
  const primaryCta = ctas.find((c) => c.primary) ?? ctas[0]
  const secondaryCta = ctas.find((c) => !c.primary && c !== primaryCta) ?? ctas[1]

  return (
    <section
      className={cn('relative overflow-hidden', className)}
      aria-labelledby="hero-heading"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
      >
        Skip to content
      </a>

      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-24 lg:py-32">
        <div className="max-w-3xl animate-in-up">
          <h1
            id="hero-heading"
            className="text-4xl lg:text-6xl font-bold tracking-tight text-foreground"
          >
            {title}
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-muted-foreground max-w-2xl">
            {subtitle}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            {primaryCta ? (
              <Link to={primaryCta.href}>
                <Button
                  size="lg"
                  variant={primaryCta.variant ?? 'default'}
                  className="min-w-[160px] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={primaryCta.label}
                >
                  {primaryCta.label}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
            ) : null}
            {secondaryCta && secondaryCta !== primaryCta ? (
              <Link to={secondaryCta.href}>
                <Button
                  size="lg"
                  variant={secondaryCta.variant ?? 'outline'}
                  className="min-w-[160px] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={secondaryCta.label}
                >
                  {secondaryCta.label}
                </Button>
              </Link>
            ) : null}
          </div>
          {loginSignupLinks && (
            <p className="mt-6 text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to={loginSignupLinks.loginHref}
                className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                Sign in
              </Link>
              {' or '}
              <Link
                to={loginSignupLinks.signupHref}
                className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                Join
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
