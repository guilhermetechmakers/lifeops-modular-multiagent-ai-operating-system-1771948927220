/**
 * ContentOverviewPanel - Pipeline stages: idea → research → draft → edit → schedule → publish.
 */

import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Lightbulb, Search, Edit, Calendar, Send } from 'lucide-react'

const STAGES = [
  { key: 'idea', label: 'Idea', icon: Lightbulb },
  { key: 'research', label: 'Research', icon: Search },
  { key: 'draft', label: 'Draft', icon: FileText },
  { key: 'edit', label: 'Edit', icon: Edit },
  { key: 'schedule', label: 'Schedule', icon: Calendar },
  { key: 'publish', label: 'Publish', icon: Send },
]

export function ContentOverviewPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Content Pipeline
        </CardTitle>
        <CardDescription>
          Idea → Research → Draft → Edit → Schedule → Publish
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {STAGES.map((s, i) => (
            <div key={s.key} className="flex items-center shrink-0">
              <Link
                to={`/dashboard/content?stage=${s.key}`}
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors min-w-[60px]"
              >
                <s.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs">{s.label}</span>
              </Link>
              {i < STAGES.length - 1 && (
                <div className="w-4 h-px bg-border shrink-0 mx-0.5" aria-hidden />
              )}
            </div>
          ))}
        </div>
        <Link to="/dashboard/content" className="block mt-4">
          <Button variant="outline" size="sm" className="w-full">
            Open Content Dashboard
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
