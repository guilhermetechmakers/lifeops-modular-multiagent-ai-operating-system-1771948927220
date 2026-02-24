import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderKanban, FileText, Wallet, Heart, Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 1, title: 'Choose modules', description: 'Select which areas to automate' },
  { id: 2, title: 'Connect integrations', description: 'Link your tools and accounts' },
  { id: 3, title: 'Create first cronjob', description: 'Set up your first automation' },
  { id: 4, title: 'Summary', description: 'Review and launch' },
]

const MODULES = [
  { id: 'projects', name: 'Projects', icon: FolderKanban, description: 'Roadmaps, tickets, PRs, CI' },
  { id: 'content', name: 'Content', icon: FileText, description: 'Content pipeline, publishing' },
  { id: 'finance', name: 'Finance', icon: Wallet, description: 'Transactions, reconciliation' },
  { id: 'health', name: 'Health', icon: Heart, description: 'Habits, training, recovery' },
]

export function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [selectedModules, setSelectedModules] = useState<string[]>(['content'])
  const navigate = useNavigate()

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    )
  }

  const handleComplete = () => {
    navigate('/dashboard/overview')
  }

  return (
    <div className="min-h-screen p-4 lg:p-8 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Welcome to LifeOps</h1>
          <p className="text-muted-foreground">Let&apos;s get you set up in a few steps</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-12">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={cn(
                'h-2 flex-1 rounded-full transition-colors',
                s.id <= step ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{STEPS[step - 1].title}</CardTitle>
            <CardDescription>{STEPS[step - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select the modules you want to use. You can enable more later.
                </p>
                <div className="grid gap-4">
                  {MODULES.map((mod) => (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => toggleModule(mod.id)}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-lg border text-left transition-all',
                        selectedModules.includes(mod.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div className="rounded-lg p-2 bg-card">
                        <mod.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{mod.name}</p>
                        <p className="text-sm text-muted-foreground">{mod.description}</p>
                      </div>
                      {selectedModules.includes(mod.id) && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect your accounts. Each integration uses OAuth for secure access.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-between">
                    Google Calendar
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    GitHub
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Stripe
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Create a sample cronjob. We&apos;ll set up a suggest-only weekly content idea
                  generator.
                </p>
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <p className="font-medium">Weekly Content Ideas</p>
                    <p className="text-sm text-muted-foreground">
                      Runs every Monday at 9am. Suggests content ideas based on your calendar
                      and preferences. Requires your approval before adding to pipeline.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Review your setup</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    Modules: {selectedModules.join(', ')}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    Sample cronjob created
                  </li>
                </ul>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
              >
                Back
              </Button>
              {step < 4 ? (
                <Button onClick={() => setStep((s) => s + 1)}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleComplete}>Launch LifeOps</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
