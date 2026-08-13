# Public Home Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/home` the public entry page, redirect `/` to it, and preserve the authenticated study dashboard at `/dashboard`.

**Architecture:** The root route becomes redirect-only, `/home` is a backend-independent public server page, and the existing dashboard server page moves to `/dashboard`. Auth policy and all dashboard links use `/dashboard` as the protected personal-workspace route.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Vitest, Testing Library

## Global Constraints

- Do not add the final Home navbar, account menu, or Dashboard button.
- Do not change Login/Register presentation.
- Do not change backend code or contracts.
- Preserve the existing dashboard loading and error behavior.

---

### Task 1: Add public entry routing and move the dashboard

**Files:**
- Modify: `frontend/src/app/page.test.tsx`
- Modify: `frontend/src/app/page.tsx`
- Create: `frontend/src/app/home/page.test.tsx`
- Create: `frontend/src/app/home/page.tsx`
- Create: `frontend/src/app/dashboard/page.test.tsx`
- Create: `frontend/src/app/dashboard/page.tsx`
- Modify: `frontend/src/app/protected-routes.test.tsx`

**Interfaces:**
- Consumes: Next.js `redirect`, `requirePageSession`, `loadStudyDashboardForSession`, `AppShell`, and `StudyDashboardPage`.
- Produces: `/ → /home`, public `/home`, and protected `/dashboard`.

- [x] **Step 1: Write failing route tests**

Test that calling the root page invokes `redirect("/home")`; `/home` renders “AI Tutor”, “หน้า Home อยู่ระหว่างการออกแบบใหม่”, and links to `/login` and `/register`; `/dashboard` calls `requirePageSession("/dashboard")` and renders the existing dashboard states.

- [x] **Step 2: Run focused tests and verify RED**

Run: `npm test -- src/app/page.test.tsx src/app/home/page.test.tsx src/app/dashboard/page.test.tsx src/app/protected-routes.test.tsx`

Expected: FAIL because `/home` and `/dashboard` do not exist and `/` still renders the protected dashboard.

- [x] **Step 3: Implement the three routes**

Use `redirect("/home")` in `src/app/page.tsx`. Build a static responsive `/home` placeholder with semantic `main`, the existing `AiTutorLogo`, and plain Next.js links. Copy the current dashboard server-page behavior to `/dashboard`, changing its guard return path to `/dashboard`.

- [x] **Step 4: Run focused tests and verify GREEN**

Run: `npm test -- src/app/page.test.tsx src/app/home/page.test.tsx src/app/dashboard/page.test.tsx src/app/protected-routes.test.tsx`

Expected: All focused route tests pass.

### Task 2: Make `/dashboard` the authenticated workspace route

**Files:**
- Modify: `frontend/src/features/auth/authRoutePolicy.test.ts`
- Modify: `frontend/src/features/auth/authRoutePolicy.ts`
- Modify: `frontend/src/features/auth/LoginPage.test.tsx`
- Modify: `frontend/src/features/app-shell/navigationData.test.ts`
- Modify: `frontend/src/features/app-shell/navigationData.ts`
- Modify: `frontend/src/features/app-shell/AppShell.test.tsx`
- Modify: `frontend/src/features/document-summary/DocumentSummaryPage.test.tsx`
- Modify: `frontend/src/features/document-summary/DocumentSummaryPage.tsx`

**Interfaces:**
- Consumes: `getDefaultRouteForRole`, protected-route role mapping, app-shell navigation, and dashboard backlinks.
- Produces: One canonical authenticated dashboard URL: `/dashboard`.

- [x] **Step 1: Change expectations to `/dashboard` and verify RED**

Update tests so every authenticated role defaults to `/dashboard`, login replaces with `/dashboard`, app-shell Dashboard navigation points to `/dashboard`, and “กลับแดชบอร์ด” links to `/dashboard`.

- [x] **Step 2: Run focused tests and verify RED**

Run: `npm test -- src/features/auth/authRoutePolicy.test.ts src/features/auth/LoginPage.test.tsx src/features/app-shell/navigationData.test.ts src/features/app-shell/AppShell.test.tsx src/features/document-summary/DocumentSummaryPage.test.tsx`

Expected: FAIL with current `/` values.

- [x] **Step 3: Update route policy and dashboard links**

Replace `/` with `/dashboard` in the protected route type/map, authenticated default, app-shell Dashboard navigation item, and document-summary dashboard backlink. Keep `/home` public and absent from the protected route map.

- [x] **Step 4: Run focused tests and verify GREEN**

Run the same focused command from Step 2.

Expected: All focused policy and navigation tests pass.

### Task 3: Verify the complete frontend behavior

**Files:**
- Verify only; no production files added in this task.

**Interfaces:**
- Consumes: Completed routing and navigation changes.
- Produces: Evidence that tests, lint, build, and browser-visible routes work.

- [x] **Step 1: Run complete static and automated verification**

Run: `npm test && npm run lint && npm run build`

Expected: Vitest, ESLint, TypeScript, and Next.js build all exit successfully.

- [x] **Step 2: Verify routes with the development server**

Start `npm run dev`, then request `/`, `/home`, and `/dashboard` without authentication.

Expected: `/` redirects to `/home`; `/home` returns HTTP 200 with placeholder content; `/dashboard` redirects to `/login`.
