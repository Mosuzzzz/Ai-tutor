# Frontend Redesign Baseline (R00)

Branch: `chore/00-frontend-redesign-baseline`

Purpose: record the verified frontend state before the redesign roadmap begins. This baseline does not introduce frontend behavior, dependency, or application-source changes.

## Verified frontend stack

| Area | Verified version / implementation |
| --- | --- |
| Framework | Next.js 16.2.6, App Router |
| UI runtime | React 19.2.4 and React DOM 19.2.4 |
| Language | TypeScript 5.9.3 with `strict: true` |
| Styling | Tailwind CSS 3.4.19 |
| Tests | Vitest 4.1.8, jsdom, `@testing-library/react` 16.3.2 |
| Validation | Zod 4.4.3 |
| Icons | Lucide React 0.468.0 |
| Animation runtime | No Framer Motion, Three.js, or WebGL dependency |

The existing UI foundation is Tailwind tokens in `tailwind.config.ts`, global styles in `src/app/globals.css`, shared `Button` and `Card` primitives, and the `AppShell` layout. Motion is CSS-only for Home/Auth and includes reduced-motion rules.

## Current routes

| Route | Access | Current behavior |
| --- | --- | --- |
| `/` | Public | Redirects to `/home` |
| `/home` | Public | Marketing landing page; session-aware CTA |
| `/login` | Public | Login form; authenticated visitors redirect to `/home` |
| `/register` | Public | Registration form; authenticated visitors redirect to `/home` |
| `/dashboard` | Protected | Personal dashboard with API-backed state |
| `/documents` | Protected | Document workspace, upload and library |
| `/documents/[fileId]` | Protected | Document summary detail |
| `/chat` | Protected | Document-scoped AI chat |
| `/quiz` | Protected | Quiz generation, preview, publishing, and attempt submission |
| `/analytics` | Protected | Learning analytics |
| `/settings` | Protected | Placeholder route |
| `/courses` | Protected | Placeholder route |

## Verification results

| Command | Result |
| --- | --- |
| `npm ci` | Passed. Lifecycle-script approval warnings were reported but no dependency changes were made. |
| `npm run test` | Passed: 82 test files and 347 tests. |
| `npm run lint` | Passed. |
| `npm run build` | Passed when outbound access to Google Fonts was available. |
| `npm audit --audit-level=high` | Failed: 13 dependency vulnerabilities (6 high, 7 moderate). |
| `git diff --check` | Passed at baseline verification. |

### Google Fonts network limitation

The first build attempt in the restricted environment failed because `next/font/google` could not fetch Noto Sans Thai from Google Fonts. Re-running with network access passed. This is an environment/network limitation, not a current TypeScript or production-build failure.

### Dependency vulnerabilities

`npm audit` reported 6 high and 7 moderate vulnerabilities in the installed dependency tree, including advisories involving Next.js, PostCSS, Sharp, brace-expansion, js-yaml, and nanoid. No automatic audit fix was applied because dependency remediation is outside this documentation-only R00 scope.

## API and security boundary

The current request path is:

```text
Browser -> same-origin Next.js /api/* -> HttpOnly cookie on server -> Backend -> Zod validation -> mapper/ViewModel -> UI
```

- Browser clients use `credentials: "same-origin"` for BFF calls.
- Tokens are stored in `__Host-` cookies with `HttpOnly`, `Secure`, `SameSite=Strict`, and `Path=/` attributes.
- BFF mutation handlers perform Origin/CSRF checks.
- BFF handlers validate incoming payloads and Backend responses with Zod.
- CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, and Referrer Policy are configured in `next.config.ts`.
- Production code uses local storage only for Home language/theme preferences, not authentication tokens.

## Route UX/UI baseline

| Route | Layout and primary action | States/data |
| --- | --- | --- |
| `/home` | Navbar, hero, image, three feature cards; CTA to register or documents | Session-aware; language/theme preferences are local-only |
| `/login` | Auth shell and form | Validation, submitting, and error status; social buttons are placeholders |
| `/register` | Auth shell and registration form | Validation, submitting, and error status; social buttons are placeholders |
| `/dashboard` | AppShell dashboard cards and next actions | API-backed loading, error, empty, and ready states |
| `/documents` | AppShell document hero, upload, selected document, library dialog | API-backed loading, error, empty, processing, and ready states |
| `/documents/[fileId]` | AppShell summary detail with related actions | API-backed loading, error, empty, and ready states |
| `/chat` | AppShell document selector, thread, summary panel | API-backed loading/error; empty state routes users to documents |
| `/quiz` | AppShell source selection, generation, preview, attempt panels | API-backed loading/error/empty plus generation, publish, and submit states |
| `/analytics` | AppShell metrics, trend, skill and activity panels | API-backed loading, error, empty, and ready states |
| `/settings` | AppShell placeholder | No real API feature yet |
| `/courses` | AppShell placeholder | No real API feature yet; wording still reflects legacy course concepts |

Source review found responsive constraints such as `min-w-0`, overflow protection, a skip link, focus-visible styling, mobile navigation, and reduced-motion support. This is source/test evidence only; it is not browser-rendered QA.

## Shared UI inventory

| Area | Path | Reuse / regression scope |
| --- | --- | --- |
| Button | `frontend/src/components/ui/Button.tsx` | Broad: actions, loading states, focus, variants |
| Card | `frontend/src/components/ui/Card.tsx` | Broad: workspace surfaces and spacing |
| App shell | `frontend/src/features/app-shell/` | High: navigation, sidebar, mobile dialog, topbar |
| Auth shell | `frontend/src/features/auth/AuthShell.tsx` | Auth route layout and CSS motion |
| Placeholder shell | `frontend/src/features/foundation/PlaceholderPage.tsx` | Settings and courses routes |
| Design foundation | `frontend/tailwind.config.ts`, `frontend/src/app/globals.css` | Product-wide tokens, typography, motion, global focus behavior |

## Legacy and placeholder inventory

| Concept | Current state | Recommended owner |
| --- | --- | --- |
| `publish`, `trainer`, `learner`, `tenant` | Active quiz contracts/BFF and analytics mapping | R08 Quiz & Review, R09 Analytics |
| `/api/quiz/[examId]/publish` | Active legacy BFF route | R08 Quiz & Review |
| `courses` | Active protected placeholder and legacy wording | R10 Settings + Supporting Routes |
| `api-ready-mock` defaults | Present in dashboard, documents, chat, quiz, and analytics component defaults/fixtures | Each corresponding redesign branch; preserve API-honest states |
| `teacher` / `student` language | Mostly fixtures, translations, and legacy support paths; some analytics concepts remain active | R04 App Shell, R08, and R09 as applicable |

## Browser QA limitation

Browser QA at 375px, 768px, and 1280px could not be performed because no browser surface was available in the session. Consequently, visual overflow, console errors, hydration behavior, and interactive focus behavior require a later browser-enabled verification pass.

## Risks and blockers

- Six high and seven moderate dependency vulnerabilities remain in the audit report.
- Production build currently relies on downloading Google Fonts during a fresh build, so restricted-network environments can fail.
- The quiz generation BFF validates and returns a trainer-oriented quiz response. Confirm that answer-key fields never reach a learner-facing browser before submit.
- `DESIGN.md`, `AI_TUTOR_DESIGN.md`, and `FRONTEND.md` require source-of-truth reconciliation outside this baseline report: the newer redesign document describes itself as a replacement while the older document remains relevant to the checkout state.
- `FRONTEND.md` describes Jest, Playwright, and Shadcn/Radix, whereas the repository currently uses Vitest and has no Playwright/Radix dependency.

## Recommendation for R01

`feat/01-design-foundation` should focus only on the visual foundation: consolidated design tokens, shared primitives, responsive container conventions, motion/reduced-motion policy, and a small Home direction prototype. It should not absorb dependency remediation, legacy contract cleanup, route behavior changes, or the unresolved quiz answer-key contract. Those need dedicated, evidence-backed follow-up work.
