import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export function PrivacyPage() {
  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Effective upon first commit/release</p>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <h3>1. Data We Collect</h3>
            <p>
              We collect account information (email, name, company), usage data (logs, run
              history, agent traces), integration data (OAuth tokens, synced content), and
              payment information (processed by Stripe).
            </p>

            <h3>2. How We Use Data</h3>
            <p>
              Data is used to provide the service, improve features, ensure security, comply
              with legal obligations, and communicate with you. We do not sell your data.
            </p>

            <h3>3. Data Retention</h3>
            <p>
              Account data is retained while your account is active. Audit logs and run
              history follow configurable retention policies. Deleted data is purged within
              30 days.
            </p>

            <h3>4. Data Export & Deletion</h3>
            <p>
              You may export your data (CSV, JSON, PDF) from the Settings page. You may
              request account deletion; we will process deletion within 30 days and confirm
              completion.
            </p>

            <h3>5. Cookies</h3>
            <p>
              We use essential cookies for authentication and session management. Optional
              analytics cookies may be used with your consent. You can manage cookie
              preferences in Settings.
            </p>

            <h3>6. Third-Party Services</h3>
            <p>
              We integrate with GitHub, Plaid, Stripe, Google, and health platforms.
              Each has its own privacy policy. We share only the data necessary for the
              integration.
            </p>

            <h3>7. Security</h3>
            <p>
              Data is encrypted in transit (TLS) and at rest. We follow industry best
              practices for access control, monitoring, and incident response.
            </p>

            <h3>8. Your Rights</h3>
            <p>
              Depending on your jurisdiction, you may have rights to access, rectify, erase,
              restrict processing, portability, and object. Contact privacy@lifeops.io to
              exercise these rights.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
