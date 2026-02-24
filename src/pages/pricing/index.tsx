import { useEffect } from 'react'
import { LandingPage } from '@/pages/landing'

/**
 * Pricing page - renders the landing page and scrolls to the pricing section.
 */
export function PricingPage() {
  useEffect(() => {
    const el = document.getElementById('pricing')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  return <LandingPage />
}
