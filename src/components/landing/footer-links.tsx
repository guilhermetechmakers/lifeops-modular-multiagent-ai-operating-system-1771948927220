import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface LinkGroup {
  label: string
  links: { href: string; label: string }[]
}

export interface FooterLinksProps {
  linkGroups?: LinkGroup[]
  brandMark?: React.ReactNode
  newsletterSignup?: boolean
  className?: string
}

const DEFAULT_GROUPS: LinkGroup[] = [
  {
    label: 'Legal',
    links: [
      { href: '/terms', label: 'Terms of Service' },
      { href: '/privacy', label: 'Privacy Policy' },
    ],
  },
  {
    label: 'Help',
    links: [
      { href: '/help', label: 'Help & Documentation' },
      { href: '/help/contact', label: 'Contact' },
    ],
  },
  {
    label: 'Social',
    links: [
      { href: '#', label: 'Twitter' },
      { href: '#', label: 'LinkedIn' },
      { href: '#', label: 'GitHub' },
    ],
  },
]

export function FooterLinks({
  linkGroups = DEFAULT_GROUPS,
  brandMark,
  newsletterSignup = false,
  className,
}: FooterLinksProps) {
  const groups = Array.isArray(linkGroups) ? linkGroups : DEFAULT_GROUPS

  return (
    <footer
      className={cn('border-t border-border py-12 px-4 lg:px-8', className)}
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center">
            <Link
              to="/"
              className="font-semibold text-foreground hover:text-foreground/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              aria-label="LifeOps home"
            >
              {brandMark ?? 'LifeOps'}
            </Link>
          </div>

          <nav
            className="flex flex-wrap justify-center gap-8"
            aria-label="Footer navigation"
          >
            {groups.map((group) => (
              <div key={group.label}>
                <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-3">
                  {group.label}
                </span>
                <ul className="flex flex-col gap-2">
                  {(group.links ?? []).map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {newsletterSignup && (
            <div className="w-full md:w-auto">
              <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-3">
                Newsletter
              </span>
              <form
                className="flex gap-2"
                onSubmit={(e) => e.preventDefault()}
                aria-label="Newsletter signup"
              >
                <input
                  type="email"
                  placeholder="Email"
                  className="h-9 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-48"
                  aria-label="Email address"
                />
                <button
                  type="submit"
                  className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Subscribe
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
