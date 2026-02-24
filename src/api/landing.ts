/**
 * Landing page API - logos, testimonials, pricing.
 * Fetches from /api with fallback to mock data when API is unavailable.
 */

import { apiGet } from '@/lib/api'
import { ensureArray } from '@/lib/data-helpers'

export interface PricingTier {
  id: string
  name: string
  price: number
  currency?: string
  features: string[]
  highlight?: boolean
  cta?: string
  ctaHref?: string
}

export interface Testimonial {
  id: string
  quote: string
  author: string
  company?: string
  avatarUrl?: string
}

export interface Logo {
  id: string
  url: string
  alt?: string
}

interface LogosResponse {
  data?: Logo[] | null
}

interface TestimonialsResponse {
  data?: Testimonial[] | null
}

interface PricingResponse {
  data?: PricingTier[] | null
}

const MOCK_LOGOS: Logo[] = [
  { id: '1', url: '/placeholder-logo.svg', alt: 'Company A' },
  { id: '2', url: '/placeholder-logo.svg', alt: 'Company B' },
  { id: '3', url: '/placeholder-logo.svg', alt: 'Company C' },
  { id: '4', url: '/placeholder-logo.svg', alt: 'Company D' },
  { id: '5', url: '/placeholder-logo.svg', alt: 'Company E' },
]

const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    quote:
      'LifeOps transformed how we manage projects. The AI agents handle triage and our team focuses on what matters.',
    author: 'Sarah Chen',
    company: 'TechFlow Inc',
    avatarUrl: undefined,
  },
  {
    id: '2',
    quote:
      'The auditability and reversible actions give us confidence to automate finance workflows. Game changer.',
    author: 'Marcus Rodriguez',
    company: 'FinanceScale',
    avatarUrl: undefined,
  },
  {
    id: '3',
    quote:
      'Cronjobs-first orchestration with explainability. Finally, AI we can trust and audit.',
    author: 'Elena Park',
    company: 'HealthOps',
    avatarUrl: undefined,
  },
]

const MOCK_PRICING: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    currency: 'USD',
    features: ['3 agents', '10 cronjobs', 'Basic modules', 'Email support'],
    highlight: false,
    cta: 'Get Started',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 99,
    currency: 'USD',
    features: [
      '10 agents',
      '50 cronjobs',
      'All modules',
      'Priority support',
      'Approval workflows',
    ],
    highlight: true,
    cta: 'Start Free Trial',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0,
    currency: 'USD',
    features: [
      'Unlimited agents',
      'Unlimited cronjobs',
      'SSO',
      'Dedicated support',
      'Custom policies',
    ],
    highlight: false,
    cta: 'Request Demo',
    ctaHref: '/signup?demo=1',
  },
]

export async function fetchLogos(): Promise<Logo[]> {
  try {
    const res = await apiGet<LogosResponse>('/logos')
    const data = Array.isArray(res?.data) ? res.data : []
    return data.length > 0 ? data : MOCK_LOGOS
  } catch {
    return MOCK_LOGOS
  }
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    const res = await apiGet<TestimonialsResponse>('/testimonials')
    const data = ensureArray(res?.data)
    return data.length > 0 ? data : MOCK_TESTIMONIALS
  } catch {
    return MOCK_TESTIMONIALS
  }
}

export async function fetchPricing(): Promise<PricingTier[]> {
  try {
    const res = await apiGet<PricingResponse>('/pricing')
    const data = Array.isArray(res?.data) ? res.data : []
    return data.length > 0 ? data : MOCK_PRICING
  } catch {
    return MOCK_PRICING
  }
}
