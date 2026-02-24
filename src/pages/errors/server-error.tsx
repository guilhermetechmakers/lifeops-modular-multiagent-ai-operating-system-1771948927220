import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ServerCrash } from 'lucide-react'

export function ServerErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center max-w-md animate-in-up">
        <ServerCrash className="h-24 w-24 text-destructive mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-2">500</h1>
        <p className="text-muted-foreground mb-8">
          Something went wrong on our end. We&apos;re working to fix it.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/">
            <Button>Go home</Button>
          </Link>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      </div>
    </div>
  )
}
