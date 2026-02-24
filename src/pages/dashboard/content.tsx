import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Lightbulb } from 'lucide-react'

export function ContentDashboard() {
  return (
    <div className="space-y-8 animate-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Content</h1>
          <p className="text-muted-foreground mt-1">
            End-to-end content pipeline with AI idea generation
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          New Content
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Drafts</CardTitle>
            <CardDescription>In progress</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">3</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Scheduled</CardTitle>
            <CardDescription>Ready to publish</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">5</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Published</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">12</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Pipeline</CardTitle>
          <CardDescription>Idea → Draft → Review → Schedule → Publish</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 overflow-x-auto pb-4">
            {['Ideas', 'Draft', 'Review', 'Scheduled', 'Published'].map((stage, i) => (
              <div
                key={stage}
                className="min-w-[200px] rounded-lg border border-border p-4 bg-card/50"
              >
                <p className="text-sm font-medium text-muted-foreground">{stage}</p>
                <p className="text-2xl font-bold mt-2">{i === 0 ? 8 : i === 1 ? 3 : i === 2 ? 2 : i === 3 ? 5 : 12}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center max-w-sm">
            Generate content ideas with AI. Select an idea to create a draft with AI research.
          </p>
          <Button variant="outline" className="mt-4">
            <Lightbulb className="h-4 w-4" />
            Generate Ideas
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
