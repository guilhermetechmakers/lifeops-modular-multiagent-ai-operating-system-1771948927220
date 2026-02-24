/**
 * Help & Documentation API stubs.
 * Mock implementation - no external APIs connected.
 */

export interface HelpCategory {
  id: string
  title: string
  slug: string
  order: number
}

export interface HelpDoc {
  id: string
  categoryId: string
  title: string
  slug: string
  excerpt: string
  content?: string
  contentHtml?: string
  updatedAt: string
}

const MOCK_CATEGORIES: HelpCategory[] = [
  { id: 'getting-started', title: 'Getting Started', slug: 'getting-started', order: 1 },
  { id: 'api-docs', title: 'API Docs', slug: 'api-docs', order: 2 },
  { id: 'tutorials', title: 'Tutorials', slug: 'tutorials', order: 3 },
  { id: 'faq', title: 'FAQ', slug: 'faq', order: 4 },
]

const MOCK_DOCS: HelpDoc[] = [
  {
    id: 'gs-1',
    categoryId: 'getting-started',
    title: 'Welcome to LifeOps',
    slug: 'welcome',
    excerpt: 'Learn the basics of the LifeOps platform and how to get started.',
    content:
      'LifeOps is a modular, multi-agent AI operating system. This guide walks you through the key concepts: modules, agents, cronjobs, and approvals. Start by selecting your modules in onboarding, then connect your integrations. Create your first cronjob to automate repetitive tasks with AI assistance.',
    updatedAt: '2025-02-24',
  },
  {
    id: 'gs-2',
    categoryId: 'getting-started',
    title: 'Connecting Integrations',
    slug: 'integrations',
    excerpt: 'Link your tools and accounts to LifeOps.',
    content:
      'LifeOps integrates with GitHub, Google Calendar, Stripe, Plaid, and health platforms. Each integration uses OAuth for secure access. Navigate to Settings > Integrations to connect. You can revoke access at any time.',
    updatedAt: '2025-02-24',
  },
  {
    id: 'api-1',
    categoryId: 'api-docs',
    title: 'REST API Overview',
    slug: 'rest-overview',
    excerpt: 'Introduction to the LifeOps REST API.',
    content:
      'The LifeOps API is RESTful. Base URL: https://api.lifeops.io/v1. Authenticate with Bearer tokens. Rate limits: 100 requests/minute for standard plans. See the Quick Start guide for a minimal example.',
    updatedAt: '2025-02-24',
  },
  {
    id: 'api-2',
    categoryId: 'api-docs',
    title: 'Quick Start',
    slug: 'quick-start',
    excerpt: 'Get started with the API in 5 minutes.',
    content: `\`\`\`bash
curl -X POST https://api.lifeops.io/v1/cronjobs \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Weekly Report","schedule":"0 9 * * 1"}'
\`\`\`

Replace YOUR_TOKEN with your API key from Settings > API Keys.`,
    updatedAt: '2025-02-24',
  },
  {
    id: 'tut-1',
    categoryId: 'tutorials',
    title: 'Your First Cronjob',
    slug: 'first-cronjob',
    excerpt: 'Step-by-step guide to creating a cronjob.',
    content:
      'Cronjobs run AI agents on a schedule. Step 1: Go to Cronjobs. Step 2: Click Create. Step 3: Choose a template or start from scratch. Step 4: Configure the schedule (cron expression). Step 5: Set approval mode (auto or manual). Step 6: Save and enable.',
    updatedAt: '2025-02-24',
  },
  {
    id: 'tut-2',
    categoryId: 'tutorials',
    title: 'Content Pipeline Setup',
    slug: 'content-pipeline',
    excerpt: 'Automate your content workflow.',
    content:
      'The content module helps you plan, draft, and publish content. Connect your blog or CMS. Create a cronjob that suggests content ideas weekly. Use the approval queue to review before publishing. Integrate with your calendar for topic relevance.',
    updatedAt: '2025-02-24',
  },
  {
    id: 'faq-1',
    categoryId: 'faq',
    title: 'How do I cancel my subscription?',
    slug: 'cancel-subscription',
    excerpt: 'Steps to cancel your LifeOps subscription.',
    content:
      'Go to Settings > Billing. Click Cancel subscription. Your access continues until the end of the current billing period. You can reactivate anytime before the period ends.',
    updatedAt: '2025-02-24',
  },
  {
    id: 'faq-2',
    categoryId: 'faq',
    title: 'What data does LifeOps store?',
    slug: 'data-storage',
    excerpt: 'Information about data storage and retention.',
    content:
      'We store account data, run history, agent traces, and integration metadata. Sensitive data (finance, health) is encrypted. See our Privacy Policy for full details. You can export or delete your data from Settings.',
    updatedAt: '2025-02-24',
  },
]

export async function getHelpCategories(): Promise<HelpCategory[]> {
  await new Promise((r) => setTimeout(r, 200))
  return [...MOCK_CATEGORIES].sort((a, b) => a.order - b.order)
}

export async function getDocsByCategory(categoryId: string): Promise<HelpDoc[]> {
  await new Promise((r) => setTimeout(r, 250))
  const docs = (MOCK_DOCS ?? []).filter((d) => d.categoryId === categoryId)
  return docs
}

export async function searchDocs(query: string): Promise<Pick<HelpDoc, 'id' | 'title' | 'excerpt' | 'slug'>[]> {
  await new Promise((r) => setTimeout(r, 200))
  const q = (query ?? '').trim().toLowerCase()
  if (!q) return []
  const docs = (MOCK_DOCS ?? []).filter(
    (d) =>
      (d.title ?? '').toLowerCase().includes(q) ||
      (d.excerpt ?? '').toLowerCase().includes(q) ||
      (d.content ?? '').toLowerCase().includes(q)
  )
  return docs.map((d) => ({ id: d.id, title: d.title, excerpt: d.excerpt, slug: d.slug }))
}

export async function getDocById(docId: string): Promise<HelpDoc | null> {
  await new Promise((r) => setTimeout(r, 150))
  const doc = (MOCK_DOCS ?? []).find((d) => d.id === docId || d.slug === docId)
  return doc ?? null
}

export async function submitSupportContact(_payload: {
  name: string
  email: string
  subject: string
  message: string
  attachment?: File
}): Promise<{ success: boolean; message?: string }> {
  await new Promise((r) => setTimeout(r, 500))
  return { success: true, message: 'Support request received. We will respond within 24 hours.' }
}
