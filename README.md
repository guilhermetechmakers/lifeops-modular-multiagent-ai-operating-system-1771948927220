# LifeOps — Modular Multi-Agent AI Operating System

A modular, multi-agent AI operating system that automates projects, content, finances, and health through coordinated AI agents. Cronjobs-first orchestration with explainability, approvals, and full audit trails.

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS v3
- **UI:** Radix UI primitives, Lucide icons
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **Routing:** React Router v6

## Getting Started

```bash
npm install
npm run build
```

## Project Structure

```
src/
├── components/     # UI components and layouts
├── lib/            # Utilities, API, Supabase
├── pages/          # Route pages
│   ├── auth/       # Login, signup, password reset
│   ├── dashboard/  # Master, Projects, Content, Finance, Health, Cronjobs, etc.
│   ├── errors/     # 404, 500
│   ├── landing/     # Landing page
│   ├── legal/      # Terms, Privacy
│   └── onboarding/ # Setup wizard
└── routes.tsx     # React Router config
```

## Routes

- `/` — Landing
- `/login`, `/signup`, `/password-reset`, `/verify-email` — Auth
- `/terms`, `/privacy` — Legal
- `/onboarding` — Setup wizard
- `/dashboard` — Master dashboard (redirects to overview)
- `/dashboard/overview` — Master command center
- `/dashboard/projects`, `/content`, `/finance`, `/health` — Module dashboards
- `/dashboard/cronjobs`, `/approvals`, `/runs`, `/agents`, `/workflows` — Orchestration
- `/dashboard/settings`, `/billing` — Account

## Design

Dark mode-first with LifeOps palette: `#18191C` background, `#4F8CFF` primary, `#5ED36D` success, `#FFD66C` warning, `#EF6464` destructive.
