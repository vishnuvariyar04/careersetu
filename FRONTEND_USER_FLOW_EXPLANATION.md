# CareerSetu Frontend Flow Guide

This document explains the current frontend flow for:

- Student GitHub auth and how it supports the current journey
- AI-based skill scoring
- Shared sidebar behavior
- Learning, PM, and Code Reviewer agent integrations
- Company onboarding and environment creation (manual + AI modes)

## Quick End-to-End  INTRODUCTION

- Student side: unified sidebar -> workspace navigation -> PM chat + task workflow + code review + learn interface.
- Skill scoring: AI first, fallback-safe, user-visible status.
- Company side: onboarding gate ensures setup quality, then AI/manual environment authoring with editable outputs and persistent tech stack.

---

## 1) Student GitHub Auth in Current Flow

### User flow

1. Student logs in on the app and reaches student dashboard/workspace pages.
2. During profile/onboarding flow, student can link GitHub and provide skill + repo information.
3. For environment task review flow, student is now asked to provide a repo URL mapped to `student_id + environment_id` before continuing tasks.
4. That stored repo is reused later for code review trigger (no repeated repo input required each time).

### Frontend implementation points

- Student profile + skill onboarding logic is in `app/student/[student_id]/dashboard/page.tsx`.
  - It reads provider token from session (`session.provider_token`) for GitHub-backed analysis path.
- Environment-specific repo capture is in `app/student/[student_id]/company/[company_id]/details/page.tsx`.
  - Fetches/stores repo URL in `github_repos`.
  - Uses an environment-level gate so the student connects repo before task progression/review flow.

### Why this matters

- Auth and repo linking provide trusted repository context.
- The same repo context is used consistently across onboarding, task workflow, and review flow.

---

## 2) How Skill Scoring is Determined Using AI

### User flow

1. Student adds a new skill and repo URL from profile/onboarding UI.
2. UI calls the analysis endpoint.
3. Backend analyzes repo context per skill and returns:
   - `experience_level` (`beginner` / `intermediate` / `advanced`)
   - `level_source` (`model` or `fallback`)
   - optional `fallback_reason`
4. UI shows status feedback:
   - AI-based level when model succeeds
   - fallback explanation when model path fails
5. Skill row is saved/updated in `student_skills`.

### Frontend + API wiring

- Caller/UI: `app/student/[student_id]/dashboard/page.tsx`
  - Sends payload to `/api/student/onboarding/analyze-repos`
  - Renders loader/status/fallback messaging in skill-add flow.
- Endpoint: `app/api/student/onboarding/analyze-repos/route.ts`
  - Normalizes model output and enforces valid levels.
  - Falls back to safe default when needed, with reason metadata.

### Result in product behavior

- No manual level picker dependency.
- Skill level feels automatic and explainable (model vs fallback).

---

## 3) How the Shared Sidebar Functions

### User flow

1. Student navigates any student page (`dashboard`, `learn`, `workspace details`).
2. The same sidebar remains mounted (no separate duplicate sidebars).
3. Sidebar content updates based on route/workspace context:
   - Global nav (environments, directory, profile, learn)
   - Workspace nav (board/chat, task details, environment learn)
   - Task list (in task details mode)
4. Sidebar can be collapsed/minimized and stays collapsed after refresh.

### Frontend architecture

- Persistent layout: `app/student/[student_id]/layout.tsx`
  - Wraps student pages with `SidebarProvider` + `StudentSidebar`.
- Shared state/context: `components/student/sidebar-context.tsx`
  - Stores `student`, `workspace`, and collapse state.
  - Persists collapse state to `localStorage`.
- UI renderer: `components/student/student-sidebar.tsx`
  - Reads route + workspace context and renders dynamic sections.
  - Drives mode switching and task selection callbacks.
- Workspace page wiring: `app/student/[student_id]/company/[company_id]/details/page.tsx`
  - Pushes environment/task/mode handlers into sidebar context.

### Why this matters

- Avoids refresh flicker and duplicate sidebar logic.
- Keeps navigation predictable across student pages.

---

## 4) Agent Integrations (Learning, PM, Code Reviewer)

## 4.1 Learning agent (`/learn`)

### User flow

1. Student opens `/student/[student_id]/learn`.
2. Learning interface opens directly (dashboard intro removed).
3. Student sends prompt, frontend connects via WebSocket, receives streamed updates (text/visual/code steps).
4. Visual canvas renders multi-step output and supports session continuation.

### Frontend implementation

- Main screen + stream handling: `app/student/[student_id]/learn/page.tsx`
  - WebSocket lifecycle, reconnect states, content rendering pipeline.
  - Session resume and canvas orchestration.

---

## 4.2 PM Agent (environment board/chat)

### User flow

1. Student enters an environment workspace.
2. In `Board & Chat`, they open PM chat and interact with project manager assistant.
3. They can switch sessions and continue conversation history.
4. Replies render in Markdown and can show tool usage hints.

### Frontend implementation

- UI component: `components/student/PmAgentChat.tsx`
  - Fetches sessions via `/api/agent/sessions`
  - Fetches messages via `/api/agent/sessions/[session_id]/messages`
  - Sends message via `/api/agent/chat`
  - Renders markdown with `react-markdown` + `remark-gfm`
- Integrated into environment details page:
  - `app/student/[student_id]/company/[company_id]/details/page.tsx`

---

## 4.3 Code Reviewer Agent

### User flow

1. Student works on environment tasks.
2. Student triggers manual review from workspace.
3. Frontend ensures task progress state is reviewable (`submitted`/`in_progress` path).
4. Frontend calls review API.
5. Review results (score/verdict/summary/issues) are shown from DB-backed data.

### Frontend implementation

- Review trigger and results integration:
  - `app/student/[student_id]/company/[company_id]/details/page.tsx`
- API proxy to reviewer service:
  - `app/api/agent/review/route.ts`
- Data dependencies:
  - repo mapping from `github_repos`
  - task status from `task_progress`
  - review records from `pr_reviews`

---

## 5) Company Side: Onboarding + Environment Creation (Manual and AI)

## 5.1 Company onboarding gate

### User flow

1. Company logs in and opens dashboard.
2. App checks if onboarding data is present.
3. If missing/incomplete, company is redirected to onboarding.
4. Once complete, dashboard and management areas are accessible.

### Frontend implementation

- Gate and redirect logic:
  - `app/company/[company_id]/dashboard/page.tsx`
- Onboarding UI stack:
  - `components/onboarding/*`
- Company basics tech-stack UX:
  - searchable options + custom add in `components/onboarding/OnboardingCompanyBasics.tsx`
  - options source in `components/onboarding/constants.ts`

---

## 5.2 Environment creation: AI mode and Manual mode

### User flow

1. Company opens create project panel.
2. Chooses:
   - **AI mode**: provide prompt (optional PDF), generate draft project/tasks.
   - **Manual mode**: start from empty template and edit directly.
3. Company reviews/edits title, description, tasks, tech stack.
4. Saves environment + tasks.

### Frontend implementation

- Panel UI and editing flow:
  - `components/company/create-project-panel.tsx`
  - supports both modes, task editing, AI task refinement, tech stack tags
- Generation endpoint:
  - `/api/company/generate-project` (`app/api/company/generate-project/route.ts`)
- Save endpoint:
  - `/api/company/save-environment` (`app/api/company/save-environment/route.ts`)
  - writes environment (`virtual_environments`) and ordered tasks (`tasks`)
  - includes `tech_stack` persistence

### Practical effect

- Teams can move fast with AI draft generation.
- They still retain full manual control before persisting.

---



