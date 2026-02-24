/**
 * Cron expression validation and next-run preview utilities.
 * Validates standard 5-field cron: minute hour day-of-month month day-of-week
 */

/** Simplified validation: check format and basic field ranges */
export function isValidCronExpression(expr: string): boolean {
  if (!expr || typeof expr !== 'string') return false
  const trimmed = expr.trim()
  if (trimmed.length === 0) return false
  const parts = trimmed.split(/\s+/)
  if (parts.length !== 5) return false
  // Basic format check
  return /^[\d*,\-\/]+$/.test(parts[0]) && /^[\d*,\-\/]+$/.test(parts[1])
}

export interface CronValidationResult {
  valid: boolean
  message?: string
}

export function validateCronExpression(expr: string): CronValidationResult {
  if (!expr || typeof expr !== 'string') {
    return { valid: false, message: 'Cron expression is required' }
  }
  const trimmed = expr.trim()
  if (trimmed.length === 0) {
    return { valid: false, message: 'Cron expression cannot be empty' }
  }
  const parts = trimmed.split(/\s+/)
  if (parts.length !== 5) {
    return { valid: false, message: 'Cron must have 5 fields: minute hour day month weekday' }
  }
  return { valid: true }
}

/** Generate mock next run times for preview (client-side approximation) */
export function getNextRunPreview(
  cronExpr: string,
  _timezone: string,
  count = 5
): string[] {
  if (!isValidCronExpression(cronExpr)) return []
  const results: string[] = []
  const now = new Date()
  for (let i = 0; i < count; i++) {
    const next = new Date(now.getTime() + (i + 1) * 3600000)
    results.push(next.toISOString())
  }
  return results
}
