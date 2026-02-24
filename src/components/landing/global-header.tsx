import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface LoginSignupLinks {
  loginHref: string
  signupHref: string
  loginLabel?: string
  signupLabel?: string
}

export interface GlobalHeaderProps {
  loginSignupLinks: LoginSignupLinks
  brandMark?: React.ReactNode
  searchPlaceholder?: string
  className?: string
}

export function GlobalHeader({
  loginSignupLinks,
  brandMark,
  searchPlaceholder,
  className,
}: GlobalHeaderProps) {
  const {
    loginHref,
    signupHref,
    loginLabel = 'Log in',
    signupLabel = 'Get Started',
  } = loginSignupLinks ?? {}

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
      role="banner"
    >
      <nav
        className="flex h-16 items-center justify-between px-4 lg:px-8 max-w-7xl mx-auto"
        aria-label="Main navigation"
      >
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-foreground hover:text-foreground/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
          aria-label="LifeOps home"
        >
          {brandMark ?? <span>LifeOps</span>}
        </Link>

        <div className="flex items-center gap-4">
          {searchPlaceholder ? (
            <div className="hidden md:block relative">
              <input
                type="search"
                placeholder={searchPlaceholder}
                aria-label="Search"
                className="h-9 w-48 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              />
            </div>
          ) : null}
          <Link to={loginHref ?? '/login'}>
            <Button variant="ghost" aria-label={loginLabel}>
              {loginLabel}
            </Button>
          </Link>
          <Link to={signupHref ?? '/signup'}>
            <Button aria-label={signupLabel}>{signupLabel}</Button>
          </Link>
        </div>
      </nav>
    </header>
  )
}
