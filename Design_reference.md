# Modern Design Best Practices

## Philosophy

Create unique, memorable experiences while maintaining consistency through modern design principles. Every project should feel distinct yet professional, innovative yet intuitive.

---

## Landing Pages & Marketing Sites

### Hero Sections
**Go beyond static backgrounds:**
- Animated gradients with subtle movement
- Particle systems or geometric shapes floating
- Interactive canvas backgrounds (Three.js, WebGL)
- Video backgrounds with proper fallbacks
- Parallax scrolling effects
- Gradient mesh animations
- Morphing blob animations


### Layout Patterns
**Use modern grid systems:**
- Bento grids (asymmetric card layouts)
- Masonry layouts for varied content
- Feature sections with diagonal cuts or curves
- Overlapping elements with proper z-index
- Split-screen designs with scroll-triggered reveals

**Avoid:** Traditional 3-column equal grids

### Scroll Animations
**Engage users as they scroll:**
- Fade-in and slide-up animations for sections
- Scroll-triggered parallax effects
- Progress indicators for long pages
- Sticky elements that transform on scroll
- Horizontal scroll sections for portfolios
- Text reveal animations (word by word, letter by letter)
- Number counters animating into view

**Avoid:** Static pages with no scroll interaction

### Call-to-Action Areas
**Make CTAs impossible to miss:**
- Gradient buttons with hover effects
- Floating action buttons with micro-interactions
- Animated borders or glowing effects
- Scale/lift on hover
- Interactive elements that respond to mouse position
- Pulsing indicators for primary actions

---

## Dashboard Applications

### Layout Structure
**Always use collapsible side navigation:**
- Sidebar that can collapse to icons only
- Smooth transition animations between states
- Persistent navigation state (remember user preference)
- Mobile: drawer that slides in/out
- Desktop: sidebar with expand/collapse toggle
- Icons visible even when collapsed

**Structure:**
```
/dashboard (layout wrapper with sidebar)
  /dashboard/overview
  /dashboard/analytics
  /dashboard/settings
  /dashboard/users
  /dashboard/projects
```

All dashboard pages should be nested inside the dashboard layout, not separate routes.

### Data Tables
**Modern table design:**
- Sticky headers on scroll
- Row hover states with subtle elevation
- Sortable columns with clear indicators
- Pagination with items-per-page control
- Search/filter with instant feedback
- Selection checkboxes with bulk actions
- Responsive: cards on mobile, table on desktop
- Loading skeletons, not spinners
- Empty states with illustrations or helpful text

**Use modern table libraries:**
- TanStack Table (React Table v8)
- AG Grid for complex data
- Data Grid from MUI (if using MUI)

### Charts & Visualizations
**Use the latest charting libraries:**
- Recharts (for React, simple charts)
- Chart.js v4 (versatile, well-maintained)
- Apache ECharts (advanced, interactive)
- D3.js (custom, complex visualizations)
- Tremor (for dashboards, built on Recharts)

**Chart best practices:**
- Animated transitions when data changes
- Interactive tooltips with detailed info
- Responsive sizing
- Color scheme matching design system
- Legend placement that doesn't obstruct data
- Loading states while fetching data

### Dashboard Cards
**Metric cards should stand out:**
- Gradient backgrounds or colored accents
- Trend indicators (↑ ↓ with color coding)
- Sparkline charts for historical data
- Hover effects revealing more detail
- Icon representing the metric
- Comparison to previous period

---

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Elevated surfaces for depth

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)

### Typography
**Create hierarchy through contrast:**
- Large, bold headings (48-72px for heroes)
- Clear size differences between levels
- Variable font weights (300, 400, 600, 700)
- Letter spacing for small caps
- Line height 1.5-1.7 for body text
- Inter, Poppins, or DM Sans for modern feel

### Shadows & Depth
**Layer UI elements:**
- Multi-layer shadows for realistic depth
- Colored shadows matching element color
- Elevated states on hover
- Neumorphism for special elements (sparingly)

---

## Interactions & Micro-animations

### Button Interactions
**Every button should react:**
- Scale slightly on hover (1.02-1.05)
- Lift with shadow on hover
- Ripple effect on click
- Loading state with spinner or progress
- Disabled state clearly visible
- Success state with checkmark animation

### Card Interactions
**Make cards feel alive:**
- Lift on hover with increased shadow
- Subtle border glow on hover
- Tilt effect following mouse (3D transform)
- Smooth transitions (200-300ms)
- Click feedback for interactive cards

### Form Interactions
**Guide users through forms:**
- Input focus states with border color change
- Floating labels that animate up
- Real-time validation with inline messages
- Success checkmarks for valid inputs
- Error states with shake animation
- Password strength indicators
- Character count for text areas

### Page Transitions
**Smooth between views:**
- Fade + slide for page changes
- Skeleton loaders during data fetch
- Optimistic UI updates
- Stagger animations for lists
- Route transition animations

---

## Mobile Responsiveness

### Mobile-First Approach
**Design for mobile, enhance for desktop:**
- Touch targets minimum 44x44px
- Generous padding and spacing
- Sticky bottom navigation on mobile
- Collapsible sections for long content
- Swipeable cards and galleries
- Pull-to-refresh where appropriate

### Responsive Patterns
**Adapt layouts intelligently:**
- Hamburger menu → full nav bar
- Card grid → stack on mobile
- Sidebar → drawer
- Multi-column → single column
- Data tables → card list
- Hide/show elements based on viewport

---

## Loading & Empty States

### Loading States
**Never leave users wondering:**
- Skeleton screens matching content layout
- Progress bars for known durations
- Animated placeholders
- Spinners only for short waits (<3s)
- Stagger loading for multiple elements
- Shimmer effects on skeletons

### Empty States
**Make empty states helpful:**
- Illustrations or icons
- Helpful copy explaining why it's empty
- Clear CTA to add first item
- Examples or suggestions
- No "no data" text alone

---

## Unique Elements to Stand Out

### Distinctive Features
**Add personality:**
- Custom cursor effects on landing pages
- Animated page numbers or section indicators
- Unusual hover effects (magnification, distortion)
- Custom scrollbars
- Glassmorphism for overlays
- Animated SVG icons
- Typewriter effects for hero text
- Confetti or celebration animations for actions

### Interactive Elements
**Engage users:**
- Drag-and-drop interfaces
- Sliders and range controls
- Toggle switches with animations
- Progress steps with animations
- Expandable/collapsible sections
- Tabs with slide indicators
- Image comparison sliders
- Interactive demos or playgrounds

---

## Consistency Rules

### Maintain Consistency
**What should stay consistent:**
- Spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- Border radius values
- Animation timing (200ms, 300ms, 500ms)
- Color system (primary, secondary, accent, neutrals)
- Typography scale
- Icon style (outline vs filled)
- Button styles across the app
- Form element styles

### What Can Vary
**Project-specific customization:**
- Color palette (different colors, same system)
- Layout creativity (grids, asymmetry)
- Illustration style
- Animation personality
- Feature-specific interactions
- Hero section design
- Card styling variations
- Background patterns or textures

---

## Technical Excellence

### Performance
- Optimize images (WebP, lazy loading)
- Code splitting for faster loads
- Debounce search inputs
- Virtualize long lists
- Minimize re-renders
- Use proper memoization

### Accessibility
- Keyboard navigation throughout
- ARIA labels where needed
- Focus indicators visible
- Screen reader friendly
- Sufficient color contrast
- Respect reduced motion preferences

---

## Key Principles

1. **Be Bold** - Don't be afraid to try unique layouts and interactions
2. **Be Consistent** - Use the same patterns for similar functions
3. **Be Responsive** - Design works beautifully on all devices
4. **Be Fast** - Animations are smooth, loading is quick
5. **Be Accessible** - Everyone can use what you build
6. **Be Modern** - Use current design trends and technologies
7. **Be Unique** - Each project should have its own personality
8. **Be Intuitive** - Users shouldn't need instructions


---

# Project-Specific Customizations

**IMPORTANT: This section contains the specific design requirements for THIS project. The guidelines above are universal best practices - these customizations below take precedence for project-specific decisions.**

## User Design Requirements

# Content Dashboard Prompt

## Overview
You are building the LifeOps Content Dashboard, a modular, agent-powered Content Pipeline and operational cockpit. This task delivers a multi-page, integrated frontend + backend system that enables idea generation, research, drafting, editing, scheduling, and publishing with agent-assisted tasks. The system includes global search and advanced filters across content, runs, cronjobs, projects, and transactions; a Content PipelineModule for end-to-end automation; a Scoped Shared Memory & Vector DB for persistent, access-controlled memory with TTLs; a Content List / Library for browsing content states; and a Master Dashboard as a single command center with cronjobs, approvals, notifications, and health indicators. The UI is dark-mode first, card-based, responsive, and accessible, with 12-column grid layout, clear visual hierarchy, and modular components.

Key constraints:
- All runtime code must guard against null/undefined values before calling array methods.
- Supabase results must use data ?? [] pattern.
- Initialize React state for arrays/objects with proper defaults: useState<T[]>([]) or useState<MyType>({} as any) if needed.
- Validate API response shapes before usage.
- Use optional chaining for deeply nested API responses.
- Provide thorough error handling, loading states, and audit-friendly run artifacts.

## Page Description (Full Detail)
What this page is:
- The Content Dashboard page is the Pipeline view for content, orchestrating ideation, research, drafting, editing, scheduling, and publishing with agent-assisted tasks. It serves as the primary operational cockpit for content teams, AI agents, and governance.

Goals:
- Provide an at-a-glance, actionable pipeline with drag-and-drop scheduling, state transitions, and cross-module visibility.
- Enable global search and advanced filtering across core domains: content items, runs, cronjobs, projects, and transactions.
- Support end-to-end content automation through the Content Pipeline Module (idea generation, research, drafting, editing, multi-platform publishing, and scheduling).
- Enable persistent, scoped memory for agents via Scoped Shared Memory & Vector DB (read/write, access controls, TTLs; retrieval backed by vector DB; metadata in relational store).
- Offer Content List / Library for browsing drafts, published items, and templates with powerful filters.
- Provide a Master Dashboard with quick agent actions, a Cronjobs overview, an Approvals queue, notifications, and system health indicators.

UI elements and guidance:
- Pipeline board with columns: Idea → Research → Draft → Edit → Review → Scheduled → Published. Drag-and-drop to move items between stages; support for batch transitions and inline editing of statuses.
- AI-assisted panels:
  - Idea Generator: prompt builder, sample ideas, quick accept/reject, auto-branch to Research.
  - Research Panel: summarize sources, attach notes, generate outlines, link to content items.
- Scheduling controls:
  - Calendar view (content calendar) with drag-and-drop to assign publish times.
  - Per-item scheduling options: immediate, scheduled, recurring (where applicable).
- Templates library: templates for briefs, outlines, and standard content structures; quick insert into ideas/drafts.
- Publishing integrations:
  - CMSs, social platforms, and newsletters; show publish status per platform; retry/pause controls.
- Memory & vector storage:
  - UI to read/write scoped memory entries per agent, configure TTLs, access controls, and visibility constraints.
  - Visualization for memory usage, recent reads/writes, and access logs.
- Master Dashboard:
  - High-level status cards for each module (Content, Pipeline, Memory/Vector DB, Cronjobs, Approvals, Notifications, System Health).
  - Quick-action toolbar for creating new content, starting agent tasks, or triggering runs.
  - Cronjobs summary with next run, last run outcome, per-run details, and ability to pause/resume.
  - Approvals queue with items requiring human review, with inline actions (Approve, Reject, Edit).

Connected Pages & Features:
- Content List / Library: Browse, search, and filter existing content drafts, published items, and templates.
- Master Dashboard: Command center + Cronjobs system overview.
- Search & Filter: Global search + advanced filters for content, runs, cronjobs, projects, transactions.
- Content Pipeline Module: End-to-end automation for content lifecycle.
- Scoped Shared Memory & Vector DB: Persistent scoped memory with access control and TTLs.

API integrations:
- No external APIs specified for this task beyond internal system layers and (optional) simulated endpoints for demo purposes. All APIs should be designed with clear input/output contracts and be ready for integration.

## Components to Build
- ContentDashboardPage
  - Layout: header, left navigation, main content panels, right-side quick actions.
  - State: pipeline items, search filters, selected item, loading states, error state.
- PipelineBoard
  - Columns for Idea, Research, Draft, Edit, Review, Scheduled, Published.
  - Drag-and-drop reordering and item movement; micro-interactions on hover.
  - Per-item actions: open details, start/stop tasks, quick edits, schedule, publish.
- IdeaGeneratorPanel
  - Prompt builder, idea suggestions, accept/branch flow to Research.
- ResearchPanel
  - Source aggregation, outline generation, notes, links to content items.
- DraftEditorPanel
  - Rich text or structured editor; autosave; versioning.
- EditingPanel
  - Revision tracking, comments, approval gates.
- SchedulingPanel
  - Calendar view, time zone handling, recurrence rules, conflict checks.
- PublishingPanel
  - Platform integrations status, per-platform publish controls, retry/logs.
- TemplatesLibrary
  - Catalog of templates; insert templates into ideas/drafts; template versioning.
- MemoryViewport
  - Read/write scoped memory entries, TTL controls, access permissions, memory usage analytics.
- VectorDBBridge
  - Memory index viewer, search by embeddings, TTL-driven pruning, access controls.
- MasterDashboard
  - Summary cards, cronjobs overview, approvals queue, notifications panel, health indicators.
- ApprovalsQueue
  - List of items requiring human review; inline actions and audit trail.
- ContentListLibrary
  - Browse, search, filter content items by state, template, author, publish status.
- AuthDecorator / AccessControl
  - Role-based access checks for modules, actions, and memory scope.

All components must adhere to the runtime safety requirements described in the "Mandatory Coding Standards" section below.

## Implementation Requirements

### Frontend
- Framework and runtime: React + TypeScript; state management with React hooks and context where appropriate; if using a state library, ensure compatibility with the runtime safety rules.
- UI components:
  - Reusable Card, Button, Input, Select, DatePicker, Calendar, Tabs, Tag, Badge, IconButton.
  - Drag-and-drop: Use a robust library (e.g., React DnD or SortableJS) with accessible drag handles.
  - Data grids/tables with filtering, sorting, and bulk actions.
  - Charts: Light-weight charts for memory usage, pipeline throughput, and cronjob status (flat, dark-theme compatible).
- Accessibility: ARIA attributes for all interactive components; keyboard navigability; screen reader friendly labels.
- State defaults:
  - useState<T[]>([]) for all arrays; useState<MemoryEntry>({} as MemoryEntry) for memory shapes if needed.
  - Initial loading and empty states must render gracefully with skeletons or empty-state cards.
- Data handling:
  - Fetch data with safe guards; always coerce to arrays: const items = data ?? [].
  - Guard array methods: (items ?? []).map(...), Array.isArray(items) ? items.map(...) : [].
- API contracts:
  - Define clear types for API responses; validate response shapes: const list = Array.isArray(response?.data) ? response.data : [].
  - Use optional chaining when accessing nested response fields.
- Routing:
  - Pages: /content-dashboard (Pipeline), /content-dashboard/library (ContentListLibrary), /content-dashboard/master (MasterDashboard or consolidated).
- Persisted state and caching:
  - Implement client-side caching for lists where appropriate; invalidate on mutations.

### Backend
- Data models (tables or schemas):
  - ContentItem: id, title, summary, status (Idea/Research/Draft/Edit/Review/Scheduled/Published), templatesId, authorId, createdAt, updatedAt, publishAt, platforms[].
  - PipelineRun: id, contentItemId, stage, startedAt, endedAt, status, logs, artifacts, agentTraceId.
  - IdeaMemory: id, agentId, scope, key, value, ttl, createdAt, updatedAt.
  - VectorMemory: id, contentItemId, agentId, embeddings, ttl, permissions, createdAt.
  - CronJob: id, name, enabled, scheduleCron, timezone, triggerType, target, inputPayload, permissions, constraints, safetyRails, retryPolicy, outputs, createdAt, updatedAt.
  - Approvals: id, runId, contentItemId, requestedBy, status, reason, createdAt, reviewedAt, reviewerId.
  - Projects, Transactions, Runs (for search/filter scope): schemas aligned to LifeOps conventions.
  - Platforms: id, name, type (CMS/Social/Newsletter), config.
- API endpoints (examples; secure with auth):
  - GET /api/content-items?filters... -> ContentItem[]
  - POST /api/content-items -> ContentItem
  - PUT /api/content-items/:id -> ContentItem
  - GET /api/pipeline-runs?contentItemId=... -> PipelineRun[]
  - POST /api/pipeline-runs -> PipelineRun
  - GET /api/cronjobs -> CronJob[]
  - POST /api/cronjobs -> CronJob
  - PATCH /api/cronjobs/:id -> CronJob
  - GET /api/approvals -> Approval[]
  - POST /api/approvals/:id/approve -> void
  - GET /api/memory/scope -> MemoryEntry[]
  - POST /api/memory/scope -> MemoryEntry
  - GET /api/vector-memory/:scope -> VectorMemoryBlock
  - POST /api/vector-memory -> VectorMemoryBlock
- Database queries:
  - Ensure null-safe access; coerce results to arrays: data ?? [].
  - Validate shapes on every response; error handling with structured messages.
  - Implement TTL eviction jobs for memory and TTL-based pruning for vector memory.
- Security:
  - Role-based access control; permissions per module and per action; audit logging for all mutations.
  - Input validation with strong schemas; reject invalid prompts, payloads, or TTL values.
- Validation:
  - Schema validation on write; ensure required fields present; default values where applicable.

### Integration
- Frontend ↔ Backend:
  - Strong type contracts (TypeScript interfaces/types) for data payloads.
  - Centralized API client with error handling, loading indicators, and retry logic.
  - Use a single source of truth for global search across Content Items, Runs, Cronjobs, Projects, and Transactions.
- Shared Memory & Vector DB integration:
  - Memory API endpoints to read/write scoped memory with access controls.
  - Vector DB integration for embeddings search; provide TTL-based pruning and ACL checks.
  - Metadata store for memory entries stored in relational DB; vector embeddings stored in vector DB; ensure cross-reference integrity.
- Cronjobs:
  - UI to create/edit cronjobs; time zone aware; schedule builder or cron expression support.
  - Trigger logic to run agent workflows, collect outputs, and push results into ContentItem state or Approvals queue.
- Observability:
  - Logging and audit trails for runs, memory ops, and vector DB actions.
  - Health indicators and status endpoints for Master Dashboard widgets.

## User Experience Flow
- Step 1: User lands on Content Dashboard (Pipeline view). Global search bar at top-right is populated with current context (content items, runs, cronjobs, projects, transactions).
- Step 2: User uses global search or advanced filters to locate ideas with status Idea or Research items; filters include author, template, platform, publish status, date ranges, and tags.
- Step 3: User drags an Idea item into Research column; AI assistant suggests research tasks and attaches notes. User can accept, modify, or reject suggestions.
- Step 4: Research item moves to Draft; DraftEditorPanel opens for author to draft content. Autosave enabled; versioning captured.
- Step 5: Editor reviews and moves item to Edit; comments and revision history visible; approval gate configured if required.
- Step 6: Scheduling; user chooses a publish date/time, time zone, recurrence, and per-platform scheduling rules; calendar view updates accordingly.
- Step 7: Publishing; per-platform status shows success, in-progress, or failed; retries available; artifacts/logs accessible.
- Step 8: Memory interactions; user creates/reads scoped memory entries for agents; TTLs set; permissions enforced.
- Step 9: Master Dashboard provides at-a-glance health, Quick Actions, Cronjobs summary, and Approvals queue. User reviews and approves items as needed.
- Step 10: Notifications appear in the dashboard; user can navigate to item details or run artifacts for traceability.

## Technical Specifications

Data Models: (illustrative, TypeScript-like definitions)
- ContentItem
  - id: string
  - title: string
  - summary?: string
  - status: "Idea" | "Research" | "Draft" | "Edit" | "Review" | "Scheduled" | "Published"
  - templatesId?: string
  - authorId: string
  - createdAt: string
  - updatedAt: string
  - publishAt?: string
  - platforms: string[] // platform IDs
  - memoryScope?: string
  - version?: number
- PipelineRun
  - id: string
  - contentItemId: string
  - stage: string
  - startedAt: string
  - endedAt?: string
  - status: "pending" | "running" | "success" | "failed"
  - logs?: string[]
  - artifacts?: string[]
  - agentTraceId?: string
- IdeaMemory
  - id: string
  - agentId: string
  - scope: string
  - key: string
  - value: any
  - ttl?: number
  - createdAt: string
  - updatedAt: string
- VectorMemory
  - id: string
  - contentItemId?: string
  - agentId: string
  - embeddings: number[]
  - ttl?: number
  - permissions: string[]
  - createdAt: string
- CronJob
  - id: string
  - name: string
  - enabled: boolean
  - scheduleCron?: string
  - timezone: string
  - triggerType: "time" | "event" | "conditional"
  - target: string // agent or workflow template
  - inputPayload: string // prompt template + variables + scope
  - permissions: string
  - constraints: object
  - safetyRails: object
  - retryPolicy: { maxRetries: number; backoffMs: number; deadLetter?: string }
  - outputs: object
  - createdAt: string
  - updatedAt: string
- Approval
  - id: string
  - runId: string
  - contentItemId: string
  - requestedBy: string
  - status: "pending" | "approved" | "rejected"
  - reason?: string
  - createdAt: string
  - reviewedAt?: string
  - reviewerId?: string

API Endpoints (examples; secure with authentication tokens):
- GET /api/content-items?filters&page&limit&search
- POST /api/content-items
- GET /api/content-items/:id
- PUT /api/content-items/:id
- GET /api/pipeline-runs?contentItemId=
- POST /api/pipeline-runs
- GET /api/cronjobs
- POST /api/cronjobs
- PATCH /api/cronjobs/:id
- GET /api/approvals
- POST /api/approvals/:id/approve
- GET /api/memory/scope?scope=<scope>&agentId=
- POST /api/memory/scope
- GET /api/vector-memory?scope=
- POST /api/vector-memory

Security
- Authentication: OAuth 2.0 / JWT with refresh; access tokens per user; permissions per module/actions.
- Authorization: Role-based access control (RBAC) at module and action level; memory access controls per scope; per-item permissions for edits and publishing.
- Audit: All writes must produce audit logs with user, timestamp, action, and before/after state.
- Validation: Strong input validation for all endpoints; reject malformed prompts or TTLs; sanitize content.

Validation Rules
- All API responses must be validated: const list = Array.isArray(response?.data) ? response.data : [].
- Optional chaining for nested properties: obj?.nested?.field.
- Destructure with defaults: const { items = [], count = 0 } = response ?? {}.
- For array calls: (items ?? []).map(...) or Array.isArray(items) ? items.map(...) : [].
- Supabase-like results: const dataList = data ?? [] when reading from queries.
- Initialize React state with correct defaults: useState<ItemType[]>([]) and similar for all arrays/collections.

Acceptance Criteria
- The Content Dashboard renders a fully functional Pipeline board with all columns, drag-and-drop, and per-item actions.
- Global search + advanced filters across Content Items, Runs, Cronjobs, Projects, Transactions return accurate results; results are guarded against null data.
- IdeaGeneratorPanel and ResearchPanel integrate with the pipeline: accepting ideas moves items to Research; research generates outlines that flow to Draft.
- Scheduling supports calendar view, timezone handling, and per-platform publish rules; no runtime crashes when data is missing.
- Memory & Vector DB features are accessible in UI with proper access control; TTLs configured; memory reads/writes persist and reflect in the memory panel.
- Master Dashboard aggregates status from all modules, shows cronjobs next run, pending approvals count, and health indicators; all data flows are robust to empty responses.
- All API calls and UI interactions pass the runtime safety tests (null/undefined guards, array method guards, proper initialization).

UI/UX Guidelines
- Apply the provided Visual Style consistently:
  - Dark background with deep charcoal surfaces, subtle borders, neon-tinged accents.
  - 12-column grid, generous spacing, card-based modular layout.
  - Primary action color: blue (#4F8CFF); secondary actions in gray; success/ok in green (#5ED36D); warnings in yellow (#FFD66C); errors in red (#EF6464).
  - Typography: Inter-like sans-serif, bold headings, semibold subheads, regular body text.
  - Cards: 12–16px radius, soft shadows, hover lift; content hierarchy prioritized with bold titles.
  - Navigation: Sidebar with icons + labels; active state highlighted with accent bar; collapsible groups with chevrons.
  - Data Visualizations: Flat charts with neon accents on dark background; minimal labels.

Mandatory Coding Standards — Runtime Safety
- Supabase-like data handling:
  - const items = data ?? [].
- Array methods safety:
  - (events ?? []).map(...), Array.isArray(events) ? events.map(...) : [].
- React useState defaults:
  - const [items, setItems] = useState<Item[]>([]);
- API response validation:
  - const list = Array.isArray(response?.data) ? response.data : [].
- Optional chaining:
  - const v = obj?.property?.nested;
- Destructuring with defaults:
  - const { items = [], count = 0 } = response ?? {};

Project Context Alignment
- System is LifeOps — Modular Multi-Agent AI Operating System.
- Each module (Content, Projects, Finance, Health) is represented on dashboards; agents communicate via orchestration with traceable messages, shared scoped memory, and conflict resolution rules.
- Master Dashboard consolidates high-level status, cronjobs, approvals, notifications, and health indicators.
- All components support auditability, rollback possibilities, and explainable actions.

Deliverables
- A fully coded frontend (React + TypeScript) implementing the Content Dashboard with all described components and flows.
- Backend API contracts, data models, and repository/service layers for content items, runs, cronjobs, memory, and approvals with null-safe patterns.
- Documentation of data models, API contracts, and integration points.
- E2E/Unit tests for key components and API endpoints with guardrails for null safety.
- Design tokens and styling that reflect the provided Visual Style.

If you need more granular API contracts, UI wireframes, or a step-by-step task breakdown for sprints, I can provide them in a follow-up.

## Implementation Notes

When implementing this project:

1. **Follow Universal Guidelines**: Use the design best practices documented above as your foundation
2. **Apply Project Customizations**: Implement the specific design requirements stated in the "User Design Requirements" section
3. **Priority Order**: Project-specific requirements override universal guidelines when there's a conflict
4. **Color System**: Extract and implement color values as CSS custom properties in RGB format
5. **Typography**: Define font families, sizes, and weights based on specifications
6. **Spacing**: Establish consistent spacing scale following the design system
7. **Components**: Style all Shadcn components to match the design aesthetic
8. **Animations**: Use Motion library for transitions matching the design personality
9. **Responsive Design**: Ensure mobile-first responsive implementation

## Implementation Checklist

- [ ] Review universal design guidelines above
- [ ] Extract project-specific color palette and define CSS variables
- [ ] Configure Tailwind theme with custom colors
- [ ] Set up typography system (fonts, sizes, weights)
- [ ] Define spacing and sizing scales
- [ ] Create component variants matching design
- [ ] Implement responsive breakpoints
- [ ] Add animations and transitions
- [ ] Ensure accessibility standards
- [ ] Validate against user design requirements

---

**Remember: Always reference this file for design decisions. Do not use generic or placeholder designs.**
