import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Check, X, MessageSquare } from 'lucide-react'

export function ApprovalDetailPage() {
  const { id } = useParams()

  return (
    <div className="space-y-8 animate-in-up">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/approvals">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Finance Close - January</h1>
          <p className="text-muted-foreground">Approval #{id}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Agent Trace</CardTitle>
            <CardDescription>Inter-agent messages and reasoning</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 font-mono text-sm">
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-muted-foreground mb-1">Agent: Finance Processor</p>
                <p>Suggested categorization for 47 transactions. 3 require manual review.</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-muted-foreground mb-1">Agent: Anomaly Detector</p>
                <p>1 anomaly flagged: Unusual subscription charge ($99).</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Approve, deny, or request changes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="success">
              <Check className="h-4 w-4" />
              Approve
            </Button>
            <Button variant="destructive" className="w-full">
              <X className="h-4 w-4" />
              Deny
            </Button>
            <Button variant="outline" className="w-full">
              <MessageSquare className="h-4 w-4" />
              Request Changes
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payload Diff</CardTitle>
          <CardDescription>Proposed changes</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="p-4 rounded-lg bg-muted/30 text-sm overflow-x-auto">
            {JSON.stringify(
              {
                transactions: 47,
                categorized: 44,
                pending: 3,
                anomalies: 1,
              },
              null,
              2
            )}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
