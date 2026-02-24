/**
 * TermsCheckbox - Consent checkbox with links to Terms, Privacy, and Data Processing Addendum.
 */

import { Link } from 'react-router-dom'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface TermsCheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  error?: string
  disabled?: boolean
  id?: string
  className?: string
}

export function TermsCheckbox({
  checked,
  onCheckedChange,
  error,
  disabled = false,
  id = 'terms',
  className,
}: TermsCheckboxProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-start gap-2">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 rounded"
        />
        <Label
          htmlFor={id}
          className="font-normal cursor-pointer text-sm leading-relaxed text-muted-foreground"
        >
          I accept the{' '}
          <Link
            to="/terms"
            className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Terms of Service
          </Link>
          ,{' '}
          <Link
            to="/privacy"
            className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Privacy Policy
          </Link>
          , and{' '}
          <Link
            to="/privacy#data-processing"
            className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Data Processing Addendum
          </Link>
        </Label>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
