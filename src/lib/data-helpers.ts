/**
 * Data handling helpers for null-safe operations across the app.
 * Reusable across Landing, 404, Help, Signin, and other pages.
 */

/**
 * Returns the value if defined, otherwise the default.
 */
export function safeData<T>(maybeData: T | null | undefined, defaultValue: T): T {
  return maybeData ?? defaultValue
}

/**
 * Ensures the result is always an array, never null/undefined.
 */
export function ensureArray<T>(data: T[] | null | undefined): T[] {
  return Array.isArray(data) ? data : []
}

/**
 * Formats a price value for display. Handles null/undefined.
 */
export function formatPrice(value: number | null | undefined, currency = 'USD'): string {
  if (value == null || Number.isNaN(value)) return '$0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Maps over a list with null-safety. Returns empty array if list is null/undefined.
 */
export function mapOrEmpty<T, U>(
  list: T[] | null | undefined,
  mapper: (t: T) => U
): U[] {
  const arr = ensureArray(list)
  return arr.map(mapper)
}
