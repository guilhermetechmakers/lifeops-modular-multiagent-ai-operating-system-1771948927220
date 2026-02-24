import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, RotateCcw, Download } from 'lucide-react'

export function RunDetailPage() {
  const { id } = useParams()

  return (
    <div className="space-y-8 animate-in-up">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/runs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Run #{id}</h1>
          <p className="text-muted-foreground">Weekly Content Ideas • Completed 2 hrs ago</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Inputs & Outputs</CardTitle>
            <CardDescription>Run payload and results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Input</p>
              <pre className="p-4 rounded-lg bg-muted/30 text-sm overflow-x-auto">
                {JSON.stringify({ schedule: 'weekly', module: 'content' }, null, 2)}
              </pre>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Output</p>
              <pre className="p-4 rounded-lg bg-muted/30 text-sm overflow-x-auto">
                {JSON.stringify({ ideas: 5, status: 'suggested' }, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full">
              <RotateCcw className="h-4 w-4" />
              Revert (if allowed)
            </Button>
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4" />
              Export Trace
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inter-Agent Trace</CardTitle>
          <CardDescription>Message flow between agents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['Orchestrator', 'Content Agent', 'Suggester'].map((agent, i) => (
              <div key={agent} className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div className="flex-1 p-4 rounded-lg bg-muted/30">
                  <p className="font-medium text-sm">{agent}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Message {i + 1} at 14:32:0{i}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
