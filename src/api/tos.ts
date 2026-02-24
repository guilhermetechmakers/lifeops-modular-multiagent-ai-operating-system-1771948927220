/**
 * Terms of Service API stubs.
 * Mock implementation - no external APIs connected.
 */

export interface ToSSection {
  id: string
  title: string
  content: string
  subsections?: { title: string; content: string }[]
}

export interface ToSContentResponse {
  sections: ToSSection[]
  effectiveDate: string
  billingTerms: string[]
  version: string
}

export interface ConsentResponse {
  success: boolean
  nextRoute?: string
}

const MOCK_SECTIONS: ToSSection[] = [
  {
    id: '1',
    title: 'Acceptance of Terms',
    content:
      'By accessing or using LifeOps, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.',
  },
  {
    id: '2',
    title: 'Description of Service',
    content:
      'LifeOps is a modular, multi-agent AI operating system that automates projects, content, finances, and health through coordinated AI agents. The service includes module-specific dashboards, cronjob orchestration, and human-in-the-loop approval workflows.',
  },
  {
    id: '3',
    title: 'Subscription and Billing Terms',
    content:
      'Subscription plans are billed monthly or annually. The following terms apply to all paid plans:',
    subsections: [
      {
        title: 'Billing Cycle',
        content:
          'Plans are billed at the start of each billing cycle. Annual plans receive a discount.',
      },
      {
        title: 'Cancellation',
        content:
          'You may cancel at any time. Access continues until the end of the current billing period.',
      },
      {
        title: 'Usage Metering',
        content:
          'Usage metering applies to agents, cronjobs, and API calls. Overage may incur additional charges.',
      },
    ],
  },
  {
    id: '4',
    title: 'User Responsibilities',
    content:
      'You are responsible for maintaining the confidentiality of your account, ensuring compliance with applicable laws, and the accuracy of data you provide. You must not use the service for illegal purposes or to violate third-party rights.',
  },
  {
    id: '5',
    title: 'Data & Privacy',
    content:
      'Our Privacy Policy governs data collection, retention, export, and deletion. Sensitive data (finance, health) is processed with additional safeguards.',
  },
  {
    id: '6',
    title: 'Limitation of Liability',
    content:
      'LifeOps is provided "as is." We are not liable for indirect, incidental, or consequential damages. Our total liability is limited to fees paid in the twelve months preceding the claim.',
  },
  {
    id: '7',
    title: 'Dispute Resolution',
    content:
      'Disputes shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. Class action waivers apply.',
  },
  {
    id: '8',
    title: 'Modification of Terms',
    content:
      'We may modify these terms. Material changes will be communicated via email or in-app notice. Continued use constitutes acceptance.',
  },
  {
    id: '9',
    title: 'Contact',
    content: 'For questions about these terms, contact us at legal@lifeops.io.',
  },
]

const MOCK_BILLING_TERMS = [
  'Plans billed monthly or annually at the start of each cycle.',
  'Annual plans receive up to 20% discount.',
  'Cancel anytime; access continues until period end.',
  'Usage metering for agents, cronjobs, and API calls.',
  'Refunds per our Refund Policy.',
]

export async function getToSContent(): Promise<ToSContentResponse | null> {
  await new Promise((r) => setTimeout(r, 300))
  return {
    sections: MOCK_SECTIONS,
    effectiveDate: '2025-02-24',
    billingTerms: MOCK_BILLING_TERMS,
    version: '1.0.0',
  }
}

export async function submitConsent(
  consent: boolean,
  _userId?: string
): Promise<ConsentResponse> {
  await new Promise((r) => setTimeout(r, 400))
  if (consent) {
    return { success: true, nextRoute: '/signup' }
  }
  return { success: true, nextRoute: '/' }
}
