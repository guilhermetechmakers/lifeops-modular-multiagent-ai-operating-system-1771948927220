import { useEffect, useState } from 'react'
import {
  GlobalHeader,
  HeroBlock,
  FeaturePanelCard,
  CronjobsExplainer,
  PricingTeaser,
  TestimonialsCarousel,
  LogosCarousel,
  FooterLinks,
  SparkleOrnament,
} from '@/components/landing'
import { fetchLogos, fetchTestimonials, fetchPricing } from '@/api/landing'
import type { Logo, Testimonial, PricingTier } from '@/api/landing'
import {
  FolderKanban,
  FileText,
  Wallet,
  Heart,
} from 'lucide-react'
import { ensureArray } from '@/lib/data-helpers'

const FEATURES = [
  {
    icon: FolderKanban,
    title: 'Projects',
    description:
      'Automate roadmaps, tickets, PRs, and CI with AI triage and release governance.',
    gradient: 'from-primary/20 to-primary/5',
    href: '/help/projects',
  },
  {
    icon: FileText,
    title: 'Content',
    description:
      'End-to-end content pipeline with AI idea generation, versioning, and multi-platform publishing.',
    gradient: 'from-success/20 to-success/5',
    href: '/help/content',
  },
  {
    icon: Wallet,
    title: 'Finance',
    description:
      'Automated monthly close, transaction categorization, anomaly detection with full auditability.',
    gradient: 'from-warning/20 to-warning/5',
    href: '/help/finance',
  },
  {
    icon: Heart,
    title: 'Health',
    description:
      'Habit tracking, training plans, recovery metrics with privacy-first wearable integrations.',
    gradient: 'from-destructive/20 to-destructive/5',
    href: '/help/health',
  },
]

export function LandingPage() {
  const [logos, setLogos] = useState<Logo[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [pricing, setPricing] = useState<PricingTier[]>([])

  useEffect(() => {
    Promise.all([fetchLogos(), fetchTestimonials(), fetchPricing()])
      .then(([logoData, testimonialData, pricingData]) => {
        setLogos(ensureArray(logoData))
        setTestimonials(ensureArray(testimonialData))
        setPricing(ensureArray(pricingData))
      })
      .catch(() => {
        setLogos([])
        setTestimonials([])
        setPricing([])
      })
  }, [])

  useEffect(() => {
    document.title = 'LifeOps — Modular Multi-Agent AI Operating System'
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Automate projects, content, finances, and health through coordinated AI agents. Cronjobs-first orchestration with explainability, approvals, and full audit trails.'
      )
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content =
        'Automate projects, content, finances, and health through coordinated AI agents. Cronjobs-first orchestration with explainability, approvals, and full audit trails.'
      document.head.appendChild(meta)
    }
  }, [])

  return (
    <div className="min-h-screen">
      <GlobalHeader
        loginSignupLinks={{
          loginHref: '/login',
          signupHref: '/signup',
          loginLabel: 'Log in',
          signupLabel: 'Get Started',
        }}
        brandMark={
          <span className="flex items-center gap-1.5">
            <SparkleOrnament size="sm" />
            LifeOps
          </span>
        }
      />

      <HeroBlock
        title={
          <>
            The AI Operating System for{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Your Life & Work
            </span>
          </>
        }
        subtitle="Automate projects, content, finances, and health through coordinated AI agents. Cronjobs-first orchestration with explainability, approvals, and full audit trails."
        ctasConfig={[
          {
            label: 'Get Started',
            href: '/signup',
            primary: true,
          },
          {
            label: 'Request Demo',
            href: '/signup?demo=1',
            variant: 'outline',
          },
        ]}
      />

      <main id="main-content">
      <section
        className="py-24 lg:py-32 px-4 lg:px-8"
        aria-labelledby="features-heading"
      >
        <div className="max-w-7xl mx-auto">
          <h2
            id="features-heading"
            className="text-3xl lg:text-4xl font-bold text-center mb-4"
          >
            One System. Four Modules.
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16">
            LifeOps brings Projects, Content, Finance, and Health under a single
            orchestration layer.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(FEATURES ?? []).map((feature, i) => (
              <FeaturePanelCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                actionLabel="Learn more"
                href={feature.href}
                gradient={feature.gradient}
                className="animate-in-up opacity-0"
                style={{
                  animationDelay: `${i * 100}ms`,
                  animationFillMode: 'forwards',
                }}
              />
            ))}
          </div>
        </div>
      </section>

      <CronjobsExplainer ctaHref="/dashboard" />

      <PricingTeaser
        tiers={pricing}
        disclaimers="14-day free trial on Growth. No credit card required."
        signupHref="/signup"
      />

      <TestimonialsCarousel items={testimonials} autoRotateInterval={5000} />

      <LogosCarousel logos={logos} />
      </main>

      <FooterLinks />
    </div>
  )
}
