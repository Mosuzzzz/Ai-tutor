# AI Tutor Frontend SRS

เอกสารนี้สรุปโครงสร้างและสถานะของ Frontend ปัจจุบันสำหรับ Web app AI Tutor Platform ตามแนวทางใน `AGENTS_FRONTEND.md`

## 1. Project Overview

AI Tutor Frontend เป็น Next.js 16 App Router application สำหรับแพลตฟอร์มผู้ช่วยเรียนรู้ด้วย AI โดยช่วงปัจจุบันมีฐาน UI, หน้า Auth แบบ mock และหน้า Student Dashboard แบบ mock/API-ready ก่อนเชื่อมต่อ Backend จริง

### Technology Stack

| Area | Current Choice |
| --- | --- |
| Framework | Next.js 16 App Router |
| Language | TypeScript strict mode |
| UI | React 19, Tailwind CSS |
| Icons | Lucide React |
| Validation | Zod |
| Test Runner | Vitest |
| Component Tests | React Testing Library |
| Styling | Tailwind tokens + global CSS helpers |

### NPM Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js dev server on `127.0.0.1` |
| `npm run build` | Build production app |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest test suite |
| `npm run test:watch` | Run Vitest watch mode |

## 2. Current Feature Scope

### Completed Phase 1: Frontend Foundation

Foundation provides the shared app shell, navigation, theme tokens, placeholder pages, and reusable UI primitives needed for the AI Tutor application.

Included:

- Shared responsive `AppShell`
- Sidebar navigation for desktop
- Mobile navigation dialog
- Sticky top bar with search, notification, help, and profile controls
- Foundation dashboard preview
- Placeholder pages for upcoming modules
- Shared UI primitives: `Button`, `Card`
- Base design tokens in Tailwind config and global CSS

### Completed Phase 2: Auth: Login + Register

Auth is currently frontend-only mock UI while waiting for Backend APIs.

Included:

- `/login` route
- `/register` route
- Login form with email/password validation
- Register form with role selection, profile fields, password confirmation, and terms acceptance
- Zod validation schemas
- Mock success states
- Disabled mock social auth buttons
- Local WebP slideshow visual panel on auth pages
- Security headers configured in Next.js
- Tests for validation, routes, components, and security headers

Out of scope until Backend is ready:

- Real login/register API calls
- Session creation
- HttpOnly Secure cookie handling
- Refresh token rotation
- Auth redirect after successful login
- Protected route enforcement
- Role/permission checks from real user session
- Backend error mapping

### Completed Phase 3: App Shell + Student Dashboard

หน้าแรกของแอป (`/`) ถูกเปลี่ยนจาก Foundation Preview เป็น Student Dashboard สำหรับผู้เรียนแล้ว โดยยังใช้ mock data ที่แยก type และ data shape ให้ใกล้กับ Backend analytics endpoint เพื่อให้เชื่อมต่อ API จริงภายหลังได้ง่าย

Included:

- `/` route render ผ่าน shared `AppShell`
- Student Dashboard UI ภาษาไทย
- Hero summary สำหรับผู้เรียน
- Metric cards: แบบทดสอบที่ทำแล้ว, คะแนนเฉลี่ย, สตรีกการเรียน, เอกสารที่อ่านแล้ว
- Continue learning list
- AI action prompt cards
- Recent scores list
- Score trend chart แบบ lightweight CSS
- Mock/API-ready data module พร้อม type สำหรับ learner dashboard response
- Test coverage สำหรับ route `/` ที่ยืนยัน shell, dashboard, metric และ `data-source="api-ready-mock"`

Out of scope until Backend is ready:

- Real analytics API fetch
- Zod validation สำหรับ response จาก API จริง
- Authenticated user/session binding
- Role-based redirect ระหว่าง student/teacher dashboard
- Backend error/loading/empty states
- Permission checks จาก session จริง

## 3. Route Map

| Route | File | Status | Purpose |
| --- | --- | --- | --- |
| `/` | `src/app/page.tsx` | Student Dashboard mock/API-ready | Main learner dashboard |
| `/courses` | `src/app/courses/page.tsx` | Placeholder | Courses module shell |
| `/documents` | `src/app/documents/page.tsx` | Placeholder | AI document summary module shell |
| `/chat` | `src/app/chat/page.tsx` | Placeholder | AI chat module shell |
| `/quiz` | `src/app/quiz/page.tsx` | Placeholder | AI quiz generator module shell |
| `/analytics` | `src/app/analytics/page.tsx` | Placeholder | Learning analytics module shell |
| `/settings` | `src/app/settings/page.tsx` | Placeholder | Settings module shell |
| `/login` | `src/app/login/page.tsx` | Mock UI ready | Login screen |
| `/register` | `src/app/register/page.tsx` | Mock UI ready | Register screen |

## 4. Frontend Folder Structure

```text
frontend/
├── public/
│   └── auth/
│       ├── login-slide-1.webp
│       ├── login-slide-2.webp
│       └── login-slide-3.webp
├── src/
│   ├── app/
│   │   ├── analytics/page.tsx
│   │   ├── chat/page.tsx
│   │   ├── courses/page.tsx
│   │   ├── documents/page.tsx
│   │   ├── login/page.tsx
│   │   ├── quiz/page.tsx
│   │   ├── register/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── AppShell.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── navigation.ts
│   │   └── page.tsx
│   ├── components/
│   │   └── ui/
│   │       ├── Button.tsx
│   │       └── Card.tsx
│   ├── features/
│   │   ├── auth/
│   │   │   ├── AuthFormFields.tsx
│   │   │   ├── AuthShell.tsx
│   │   │   ├── authValidation.ts
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── foundation/
│   │   │   ├── FoundationPreview.tsx
│   │   │   └── PlaceholderPage.tsx
│   │   └── student-dashboard/
│   │       ├── StudentDashboardPage.tsx
│   │       └── studentDashboardData.ts
│   ├── lib/
│   │   └── cn.ts
│   └── test/
│       └── setup.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

## 5. Architecture Summary

The current frontend follows a feature-oriented structure inside `src/features` and keeps route entry points thin inside `src/app`.

### App Layer

`src/app` contains App Router routes, app layout, global CSS, navigation config, and shell-level tests.

Responsibilities:

- Define public routes
- Compose route pages from feature components
- Own global shell/navigation
- Configure global styles

### Feature Layer

`src/features` contains business-facing UI modules.

Current feature modules:

- `features/foundation`: foundation dashboard and placeholder route content
- `features/auth`: login/register UI, auth form helpers, and auth validation
- `features/student-dashboard`: learner dashboard UI and mock/API-ready dashboard data

### Shared UI Layer

`src/components/ui` contains reusable atomic components used across feature modules.

Current shared components:

- `Button`
- `Card`

### Utility Layer

`src/lib` contains shared utilities.

Current utilities:

- `cn`: safe class name join helper

## 6. Auth Module Specification

### Auth Routes

| Route | Component | Behavior |
| --- | --- | --- |
| `/login` | `LoginPage` | Collect email/password, validate locally, show mock success |
| `/register` | `RegisterPage` | Collect role/account fields, validate locally, show mock success |

### Validation Rules

Validation lives in `src/features/auth/authValidation.ts` and uses Zod.

Login fields:

- `email`: required, trimmed, lowercased, valid email format
- `password`: required, minimum 8 characters

Register fields:

- `role`: required, must be `student` or `teacher`
- `fullName`: required, trimmed
- `email`: required, trimmed, lowercased, valid email format
- `password`: required, minimum 8 characters
- `confirmPassword`: required, must match password
- `acceptedTerms`: must be true

### Auth Security Rules

Current auth is mock-only and intentionally does not:

- call Backend APIs
- store access tokens
- store refresh tokens
- use `localStorage`
- use `sessionStorage`
- read/write cookies
- log credentials

Future backend integration must use HttpOnly Secure cookies for auth session/token handling.

## 7. Visual Design Summary

### Foundation UI

Foundation screens use a calm learning-platform design with:

- persistent app shell
- left sidebar on desktop
- mobile navigation dialog
- top bar with search and utility actions
- consistent card radius, spacing, and tokens

### Auth UI

Auth screens use a split layout on desktop:

- left visual panel
- right form panel
- local WebP image slideshow
- fade transition between 3 images
- dark overlay and reduced brightness for better text contrast
- mobile layout hides the visual panel and prioritizes the form

Auth visual assets:

```text
public/auth/login-slide-1.webp
public/auth/login-slide-2.webp
public/auth/login-slide-3.webp
```

### Student Dashboard UI

Student Dashboard ใช้หน้าจอแบบ dashboard จริง ไม่ใช่ landing page โดยเน้นข้อมูลที่ผู้เรียนต้อง scan ซ้ำได้เร็ว:

- Hero summary สี navy + amber
- Metric cards สำหรับความคืบหน้าหลัก
- Action prompts สำหรับ AI Tutor
- Continue learning list
- Recent scores panel
- Score trend visualization
- Copy บนหน้าจอเป็นภาษาไทยเพื่อให้ตรงกับผู้ใช้หลักของโปรเจกต์

Dashboard ยังไม่มี API call และยังไม่เก็บข้อมูลผู้ใช้จริงใน client storage

## 8. Security Configuration

Security headers are configured in `next.config.ts`.

Configured headers:

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`

Environment protection:

- `.env`
- `.env.local`
- `.env.*.local`

are ignored in `.gitignore`.

### Security Notes

Current CSP still includes development-friendly allowances for Next.js runtime:

- `'unsafe-inline'`
- `'unsafe-eval'`

Before production hardening, this should be revisited with nonce/hash strategy when deployment requirements are clear.

## 9. Testing Coverage

Current test files:

```text
src/app/AppShell.test.tsx
src/app/auth-routes.test.tsx
src/app/page.test.tsx
src/app/routes.test.tsx
src/app/security-headers.test.ts
src/features/auth/AuthShell.test.tsx
src/features/auth/LoginPage.test.tsx
src/features/auth/RegisterPage.test.tsx
src/features/auth/authValidation.test.ts
```

Current coverage focus:

- student dashboard page rendering
- app shell navigation
- route rendering
- auth route links
- auth form rendering
- login validation
- register validation
- Zod schema behavior
- auth slideshow assets
- security header config
- mock/API-ready dashboard marker

Current latest verification:

- `npm test`: 9 test files, 23 tests
- `npm run lint`: passing
- `npm run build`: passing
- `npm audit --audit-level=high`: 0 vulnerabilities

## 10. Known Deferred Work

The following items should wait until Backend/API contracts are available:

- Auth API client
- Login/register use cases that call repositories
- Session cookie handling
- Auth callback/refresh handling
- Route protection
- Role-based dashboard routing
- Student dashboard analytics API client
- Dashboard response validation with Zod
- Student dashboard loading/error/empty states
- Teacher dashboard route and role split
- Backend validation error mapping
- Playwright E2E for real auth flow
- Logout behavior
- Real social login providers

The following items can be done before Backend if needed:

- Production CSP hardening plan
- `.env.example` once required public environment variables are known
- Better image generation/asset pipeline
- shadcn/Radix component expansion for forms and dialogs

## 11. Commit Scope Recommendation

For the current Student Dashboard phase commit, include:

```text
frontend/src/app/page.tsx
frontend/src/app/page.test.tsx
frontend/src/features/student-dashboard/
frontend/SRS.md
```

Do not include unrelated local/backend files in this commit unless intentionally requested:

```text
AGENTS_FRONTEND.md
DESIGN.md
frontend/next-env.d.ts
backend/docker-compose.yml
```
