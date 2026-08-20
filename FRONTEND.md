# Frontend Development Reference

เอกสารนี้เป็น architecture และ development reference สำหรับ frontend เท่านั้น. Roadmap และ branch sequence สำหรับ frontend redesign อยู่ใน `DESIGN.md`.

## Current stack

- Next.js 16, App Router
- React 19
- TypeScript strict mode
- Tailwind CSS 3
- Zod runtime validation
- Lucide React
- Vitest, jsdom, and React Testing Library

Shadcn UI, Radix UI, Jest, และ Playwright ไม่ใช่ tooling ที่ติดตั้งหรือ configure อยู่ใน repository ปัจจุบัน. ห้ามอ้างว่าเป็น implementation ปัจจุบันจนกว่าจะเพิ่มผ่าน branch ที่อนุมัติแล้ว.

## Repository layout

```text
frontend/
  src/app/          routes, layouts, and same-origin BFF route handlers
  src/components/   reusable UI primitives and branding
  src/features/     feature UI, API adapters, contracts, mappers, and view models
  src/lib/          shared utilities and Backend/BFF support
  src/test/         Vitest setup
```

## Routes and ownership

```text
/             -> /home
/home         public marketing landing
/login        public authentication route
/register     public authentication route
/dashboard    authenticated personal dashboard
```

The protected personal-workspace routes are `/dashboard`, `/documents`, `/documents/[fileId]`, `/chat`, `/quiz`, `/analytics`, `/settings`, and `/courses`.

Frontend owns UI, App Router pages, same-origin BFF handlers, frontend contracts, mappers, ViewModels, and user-safe states. Backend implementation and Backend contract changes remain Backend-owned.

## API and session boundary

```text
Browser -> same-origin Next.js /api/* -> HttpOnly cookie on server
        -> Backend -> Zod validation -> mapper/ViewModel -> UI
```

- Do not store access or refresh tokens in `localStorage` or `sessionStorage`.
- Client mutations call same-origin BFF routes with `credentials: "same-origin"`.
- BFF mutation handlers enforce Origin/CSRF checks and validate inputs.
- Validate Backend responses with Zod before mapping them to UI state.
- Do not expose raw Backend errors, tokens, secrets, or storage credentials in UI responses.
- Keep UI API-honest: show loading, empty, error, and incomplete-data states rather than inventing successful AI results.

## UI and code conventions

- Prefer Server Components; add `'use client'` only for browser APIs or interactive React state.
- Use functional components and explicit TypeScript types; avoid `any`.
- Use the established Tailwind token system in `tailwind.config.ts` and global conventions in `src/app/globals.css`.
- Reuse `src/components/ui/Button.tsx`, `Card.tsx`, and App Shell components before creating overlapping primitives.
- Keep feature API access, contracts, mappers, and ViewModels separated from presentation components.
- Support mobile layouts, visible focus, keyboard access, long Thai/English text, and `prefers-reduced-motion`.

## Development and verification

Run commands from `frontend/`:

```bash
npm ci
npm run test
npm run lint
npm run build
npm audit --audit-level=high
```

For documentation-only branches, run:

```bash
git diff --check
git status --short
```

The baseline found that builds need outbound access to Google Fonts and that `npm audit --audit-level=high` reports 6 high and 7 moderate vulnerabilities. Dependency remediation belongs to `fix/00-2-frontend-dependency-security`, not routine UI branches.

## Workflow

1. Read `DESIGN.md` and the relevant feature/source tests.
2. Produce an implementation plan and wait for approval before code changes.
3. Keep scope to one approved branch objective.
4. Run the verification commands appropriate to the change.
5. Do not stage or commit environment files, generated output, secrets, or unrelated local changes.
