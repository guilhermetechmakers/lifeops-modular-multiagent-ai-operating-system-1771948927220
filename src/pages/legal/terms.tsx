import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export function TermsPage() {
  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Terms of Service</CardTitle>
            <p className="text-muted-foreground">Effective upon first commit/release</p>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <h3>1. Acceptance of Terms</h3>
            <p>
              By accessing or using LifeOps, you agree to be bound by these Terms of Service.
              If you do not agree, do not use the service.
            </p>

            <h3>2. Description of Service</h3>
            <p>
              LifeOps is a modular, multi-agent AI operating system that automates projects,
              content, finances, and health through coordinated AI agents. The service includes
              module-specific dashboards, cronjob orchestration, and human-in-the-loop approval
              workflows.
            </p>

            <h3>3. Subscription & Billing</h3>
            <p>
              Subscription plans are billed monthly or annually. You may cancel at any time.
              Refunds are handled according to our billing policy. Usage metering applies to
              agents, cronjobs, and API calls.
            </p>

            <h3>4. User Responsibilities</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account,
              ensuring compliance with applicable laws, and the accuracy of data you provide.
              You must not use the service for illegal purposes or to violate third-party rights.
            </p>

            <h3>5. Data & Privacy</h3>
            <p>
              Our Privacy Policy governs data collection, retention, export, and deletion.
              Sensitive data (finance, health) is processed with additional safeguards.
            </p>

            <h3>6. Limitation of Liability</h3>
            <p>
              LifeOps is provided &quot;as is.&quot; We are not liable for indirect, incidental,
              or consequential damages. Our total liability is limited to fees paid in the
              twelve months preceding the claim.
            </p>

            <h3>7. Changes</h3>
            <p>
              We may modify these terms. Material changes will be communicated via email or
              in-app notice. Continued use constitutes acceptance.
            </p>

            <h3>8. Contact</h3>
            <p>
              For questions about these terms, contact us at legal@lifeops.io.
            </p>
          </CardContent>
        </Card>
        <div className="mt-8 flex gap-4">
          <Link to="/signup">
            <Button>Accept</Button>
          </Link>
          <Link to="/">
            <Button variant="outline">Decline</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
