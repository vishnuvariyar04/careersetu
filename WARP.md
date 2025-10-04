`
# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.
``

Project: DevFlow AI (Next.js 14 App Router, TypeScript, Tailwind v4, Supabase)

Commands (Node/Next.js)
- Install deps (choose one package manager):
  - npm: npm install
  - pnpm: pnpm install
- Start dev server: npm run dev
- Build: npm run build
- Start production build: npm run start
- Lint: npm run lint
- Tests: No test runner configured in package.json. There is no jest/vitest/playwright config in the repo.

Environment and runtime
- Node: Next.js 14 (app/ directory) with TypeScript
- Styling: Tailwind CSS v4 via @tailwindcss/postcss; global theme tokens in app/globals.css
- UI kit: shadcn/ui components generated per components.json (aliases: @/components, @/components/ui, @/lib, @/hooks)
- Data: Supabase (client in lib/supabase.ts)
- Real-time: Supabase Realtime channel subscription in the Team Workspace page
- Analytics: @vercel/analytics enabled in app/layout.tsx
- Images: next.config.mjs sets images.unoptimized = true (no Image Optimization)
- Lint/Types: next.config.mjs ignores ESLint and TypeScript build errors during next build

How the app is structured (big picture)
- App Router pages (app/):
  - Top-level layout in app/layout.tsx applies fonts, theme, analytics.
  - Primary feature flow lives under dynamic, nested routes keyed by student/company/project/team IDs, e.g. app/student/[student_id]/company/[company_id]/project/[project_id]/team/[team_id]/workspace/page.tsx
  - Additional routes for auth (app/auth/...), dashboard, onboarding, etc.
- Core UI Components (components/):
  - shadcn/ui primitives in components/ui/*
  - Feature components: ai-chat.tsx (agent chat UI), teammates-list.tsx, learning-modal.tsx, real-time-* widgets
- Data layer:
  - lib/supabase.ts exposes a singleton Supabase client using browser env vars (NEXT_PUBLIC_*)
  - Team workspace fetches tasks from Supabase table "tasks-duo-1" and subscribes to Postgres realtime changes filtered by team_id
  - Teammates list joins team_members → students via Supabase select
- AI/Agents:
  - components/ai-chat.tsx renders a chat for two agent types (pm, learning)
  - It currently sends messages to an external webhook (n8n) and caches chat history in localStorage per (uid, team_id)
  - An internal Next API route exists at app/api/chat/route.ts (OpenAI generateText), but AIChat is wired to the webhook, not this route
- Demo/local data (optional):
  - lib/storage.ts contains a localStorage-backed demo dataset and helper methods for students/companies/projects/teams. Current pages rely on Supabase; storage.ts is not wired into the main flows.

Supabase setup essentials (from SUPABASE_SETUP.md + code expectations)
- Required env variables for the client (browser-side):
  - Code expects: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY in lib/supabase.ts
  - Docs file (SUPABASE_SETUP.md) instructs: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
  - Action: Ensure the variable name in .env.local matches what the code imports. Either:
    - Rename env in .env.local to NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY, or
    - Update lib/supabase.ts to read NEXT_PUBLIC_SUPABASE_ANON_KEY
- Tables referenced by the code:
  - students (docs include a schema; code expects columns: student_id, name, email)
  - companies (docs include a schema)
  - team_members (used by teammates-list.tsx and workspace page). Columns referenced: team_id, student_id, role; plus FK to students(student_id).
  - tasks-duo-1 (used by workspace page, realtime subscription). Fields referenced in mapping/transforms: id, task, task-description, status, assigned-to, priority, dueDate, created_at, tags, team_id
    - Realtime channel filter: schema: public, table: tasks-duo-1, filter: team_id=eq.<TEAM_ID>
- Security: SUPABASE_SETUP.md enables RLS for students and companies with basic policies. Extend appropriately per your needs.

Path aliases (tsconfig.json)
- @/* → project root
- Common: @/components, @/components/ui, @/lib, @/hooks (also declared in components.json)

Common development flows
- Run locally:
  1) Set .env.local with NEXT_PUBLIC_SUPABASE_URL and the publishable/anon key the client code reads
  2) npm install
  3) npm run dev
- Lint the project: npm run lint (Next.js ESLint). Note: next.config.mjs ignores lint errors during build.
- Build for production: npm run build; then run npm start

Gotchas and notes
- Env var mismatch: lib/supabase.ts uses NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY while SUPABASE_SETUP.md uses NEXT_PUBLIC_SUPABASE_ANON_KEY. Align these to avoid runtime auth errors.
- Missing tables: team_members and tasks-duo-1 are used by the UI but not created in SUPABASE_SETUP.md. Create them with the columns referenced above to enable teammates and task workflows.
- AI route vs. webhook: app/api/chat/route.ts is not currently used by AIChat; switching to it requires updating components/ai-chat.tsx fetch targets and ensuring required server env vars for the OpenAI provider are configured.
