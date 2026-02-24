import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FolderKanban,
  FileText,
  Wallet,
  Heart,
  Clock,
  Bot,
  Shield,
  Zap,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const FEATURES = [
  {
    icon: FolderKanban,
    title: 'Projects',
    description: 'Automate roadmaps, tickets, PRs, and CI with AI triage and release governance.',
    gradient: 'from-primary/20 to-primary/5',
  },
  {
    icon: FileText,
    title: 'Content',
    description: 'End-to-end content pipeline with AI idea generation, versioning, and multi-platform publishing.',
    gradient: 'from-success/20 to-success/5',
  },
  {
    icon: Wallet,
    title: 'Finance',
    description: 'Automated monthly close, transaction categorization, anomaly detection with full auditability.',
    gradient: 'from-warning/20 to-warning/5',
  },
  {
    icon: Heart,
    title: 'Health',
    description: 'Habit tracking, training plans, recovery metrics with privacy-first wearable integrations.',
    gradient: 'from-destructive/20 to-destructive/5',
  },
]

const PRICING_TIERS = [
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'For individuals getting started',
    features: ['3 agents', '10 cronjobs', 'Basic modules', 'Email support'],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Team',
    price: '$99',
    period: '/month',
    description: 'For growing teams',
    features: ['10 agents', '50 cronjobs', 'All modules', 'Priority support', 'Approval workflows'],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For organizations',
    features: ['Unlimited agents', 'Unlimited cronjobs', 'SSO', 'Dedicated support', 'Custom policies'],
    cta: 'Request Demo',
    highlighted: false,
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <nav className="relative flex h-16 items-center justify-between px-4 lg:px-8 max-w-7xl mx-auto">
          <span className="text-xl font-bold text-foreground">LifeOps</span>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl animate-in-up">
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-foreground">
              The AI Operating System for{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Your Life & Work
              </span>
            </h1>
            <p className="mt-6 text-lg lg:text-xl text-muted-foreground max-w-2xl">
              Automate projects, content, finances, and health through coordinated AI agents.
              Cronjobs-first orchestration with explainability, approvals, and full audit trails.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/signup">
                <Button size="lg" className="min-w-[160px]">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/signup?demo=1">
                <Button variant="outline" size="lg" className="min-w-[160px]">
                  Request Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Feature panels - Bento grid */}
      <section className="py-24 lg:py-32 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4">
            One System. Four Modules.
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16">
            LifeOps brings Projects, Content, Finance, and Health under a single orchestration layer.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <Card
                key={feature.title}
                className={cn(
                  'overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-glow',
                  `animate-in-up opacity-0`
                )}
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}
              >
                <div className={cn('h-1 bg-gradient-to-r', feature.gradient)} />
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={cn('rounded-lg p-2 bg-gradient-to-br', feature.gradient)}>
                      <feature.icon className="h-6 w-6 text-foreground" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cronjobs & Agents explainer */}
      <section className="py-24 lg:py-32 px-4 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Cronjobs & Agents,{' '}
                <span className="text-primary">First-Class</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Every cronjob is a first-class object: schedule, triggers, payloads, permissions,
                constraints, safety rails, retry policies. Agents communicate via a traceable message
                bus with shared scoped memory. All actions are schema-validated, permissioned,
                logged, explainable, and reversible.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Cronjobs Engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <span>Multi-Agent Orchestration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Policy Engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span>Suggest → Approve → Autopilot</span>
                </div>
              </div>
            </div>
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-card/50">
                  <span className="font-medium">Automation Level</span>
                  <span className="text-primary text-sm">Suggest-only (default)</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-card/50">
                  <span className="font-medium">Approval Required</span>
                  <span className="text-warning text-sm">Finance & Health</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-card/50">
                  <span className="font-medium">Bounded Autopilot</span>
                  <span className="text-success text-sm">With spend limits</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 lg:py-32 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4">Simple Pricing</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16">
            Start free, scale as you grow. No hidden fees.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {PRICING_TIERS.map((tier) => (
              <Card
                key={tier.name}
                className={cn(
                  'relative overflow-hidden transition-all duration-300 hover:scale-[1.02]',
                  tier.highlighted && 'border-primary shadow-glow'
                )}
              >
                {tier.highlighted && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                )}
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <span className="text-success">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup" className="block">
                    <Button
                      className="w-full"
                      variant={tier.highlighted ? 'default' : 'outline'}
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-semibold">LifeOps</span>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
