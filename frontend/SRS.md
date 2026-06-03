# AI Tutor Frontend SRS

เอกสารนี้สรุปโครงสร้างและสถานะของ Frontend ปัจจุบันสำหรับ Web app AI Tutor Platform ตามแนวทางใน `AGENTS_FRONTEND.md`

## 1. Project Overview

AI Tutor Frontend เป็น Next.js 16 App Router application สำหรับแพลตฟอร์มผู้ช่วยเรียนรู้ด้วย AI โดยช่วงปัจจุบันมีฐาน UI, หน้า Auth แบบ mock, หน้า Student Dashboard, Teacher Dashboard, Document Summary, AI Chat & Summary, AI Quiz Generator และ Learning Analytics แบบ mock/API-ready ก่อนเชื่อมต่อ Backend จริง

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
- Student Dashboard replacing the original foundation preview
- Placeholder pages for remaining upcoming modules
- Centralized placeholder route content in `src/features/foundation/placeholderContent.ts`
- App-level `PlaceholderRoute` wrapper for placeholder shell composition
- UI-only `PlaceholderPage` that can be replaced by real feature pages later
- Shared UI primitives: `Button`, `Card`
- Shared UI primitive tests for `Button`, `Card`, `cn`, and arrow-function conventions
- Frontend dependency security fix: Vitest upgraded to patched `4.1.8`, with PostCSS pinned/overridden to `8.5.15`
- Base design tokens in Tailwind config and global CSS
- Shared App Shell module in `src/features/app-shell`
- Compatibility exports from `src/app/AppShell.tsx` and `src/app/navigation.ts`
- App shell helper/data tests for active route behavior and navigation contract

### Completed Phase 2: Auth: Login + Register

Auth is currently frontend-only mock UI while waiting for Backend APIs.

Included:

- `/login` route
- `/register` route
- Login form with email/password validation
- Register form with role selection, profile fields, password confirmation, and terms acceptance
- Zod validation schemas
- API-ready mock auth client with async submit wrappers
- Centralized auth types and display copy
- Mock submitting/success/error states
- Disabled mock social auth buttons
- Local WebP slideshow visual panel on auth pages
- Security headers configured in Next.js
- Tests for validation, mock auth client, routes, components, and security headers

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
- Mock/API-ready data wrapper พร้อม type สำหรับ learner dashboard response
- Pure helper functions สำหรับ score formatting, grade label, top score sorting, relative time, progress clamp และ hero copy
- Loading/error states สำหรับ dashboard surface
- Accessible progressbar สำหรับ continue learning
- Test coverage สำหรับ helper, component, route `/` และ `data-source="api-ready-mock"`

Out of scope until Backend is ready:

- Real analytics API fetch
- Zod validation สำหรับ response จาก API จริง
- Authenticated user/session binding
- Role-based redirect ระหว่าง student/teacher dashboard
- Backend error mapping และ empty states จาก API จริง
- Permission checks จาก session จริง

### Completed Phase 4: Teacher Dashboard

หน้า `/teacher` ถูกเพิ่มเป็น dashboard สำหรับครูแบบ mock/API-ready เพื่อให้ทีมเห็น flow ฝั่ง teacher ก่อนเชื่อมต่อ Backend จริง

Included:

- `/teacher` route render ผ่าน shared `AppShell`
- เพิ่ม navigation item “แดชบอร์ดครู” ในเมนูหลัก
- Teacher Dashboard UI ภาษาไทย
- Hero summary สำหรับครู พร้อม quick action ไปยัง Quiz, Documents และ Analytics
- Metric cards: นักเรียนทั้งหมด, ควิซที่สร้างแล้ว, เอกสารที่ตรวจแล้ว, อัตราทำสำเร็จ
- Class summary พร้อม progressbar ที่มี accessible name
- Latest quiz summary พร้อม status label
- Recent activity feed สำหรับกิจกรรมฝั่งครู
- Mock/API-ready data module ที่ map shape ใกล้กับ Backend analytics/admin dashboard response
- Pure helper functions สำหรับ format rate, sort class, status label, activity label และ greeting
- Test coverage สำหรับ helper, component, route และ navigation regression

Out of scope until Backend/Auth is ready:

- Real teacher analytics API fetch
- Role guard เช่น `RequireRole("teacher")`
- Session-based permission check ก่อน render teacher UI
- Zod validation สำหรับ response จาก API จริง
- Loading/error/empty states จาก network จริง
- Backend error mapping

### Completed Phase 5: Document Summary

หน้า `/documents` ถูกเปลี่ยนจาก placeholder เป็นหน้า Document Summary แบบ mock/API-ready สำหรับ core AI flow แรกของ Phase 2 โดยวาง data shape ให้ใกล้กับ Backend route ที่มีอยู่ เช่น `/api/files/dashboard`, `/api/files/{file_id}/detail` และ `/api/recap/{file_id}`

Included:

- `/documents` route render ผ่าน shared `AppShell`
- Document Summary UI ภาษาไทย
- Hero summary สำหรับคลังเอกสาร AI Tutor
- Metric cards: เอกสารทั้งหมด, พร้อมสรุป, กำลังประมวลผล, เอกสารมีปัญหา
- Selected document summary พร้อม action ไปยัง Quiz และ Chat
- Disabled export/share buttons เพื่อกัน user เข้าใจผิดว่าส่งออกจริงแล้ว
- Empty state guard สำหรับกรณี API-ready payload ยังไม่มีเอกสารหรือไม่มี detail ที่พร้อมสรุป
- Document library list พร้อม status label จาก backend-like status (`ready`, `processing`, `pending`, `error`)
- Key topics พร้อม accessible `progressbar`
- Detailed breakdown และ related documents
- Markdown summary parser ที่ render เป็น text ผ่าน React เท่านั้น ไม่ใช้ `dangerouslySetInnerHTML`
- Mock/API-ready data module ที่ map shape ใกล้กับ Backend document dashboard/detail/recap response
- Pure helper functions สำหรับ status label, summary count, readiness sorting, selected document fallback และ markdown parsing
- Test coverage สำหรับ helper, component, route `/documents`, loading/error/empty state และการไม่ expose backend endpoint ลง DOM

Out of scope until Backend/Auth is ready:

- Real `/api/files/dashboard` fetch
- Real `/api/files/{file_id}/detail` fetch
- Real `/api/recap/{file_id}` generation request
- Upload document flow
- Export/share implementation
- Zod validation สำหรับ response จาก API จริง
- Tenant/session permission checks ก่อน render document data
- Backend error mapping และ empty states จาก API จริง

### Completed Phase 6: AI Chat & Summary

หน้า `/chat` ถูกเปลี่ยนจาก placeholder เป็นหน้า AI Chat & Summary แบบ mock/API-ready สำหรับ core AI flow ต่อจาก Document Summary โดยวาง data shape ให้ใกล้กับ Backend route ที่มีอยู่ เช่น `/api/chat/query`, `/api/chat/history` และ document dashboard context

Included:

- `/chat` route render ผ่าน shared `AppShell`
- AI Chat & Summary UI ภาษาไทย
- Hero summary สำหรับ workspace แชทกับเอกสาร
- Metric cards สำหรับคำตอบอ้างอิง, เอกสารพร้อมถาม และคำถามแนะนำ
- Document context list พร้อม status label จาก backend-like status (`ready`, `processing`, `error`)
- Selected document fallback เฉพาะเอกสารที่พร้อมสรุปและพร้อมถาม AI
- Chat thread สำหรับ learner/assistant message bubbles
- Citation cards ที่ render เป็น text ผ่าน React เท่านั้น ไม่ใช้ `dangerouslySetInnerHTML`
- Summary side panel พร้อม takeaways และ action ไปยัง Documents/Quiz
- Disabled mock composer เพื่อกัน user เข้าใจผิดว่าส่งคำถามจริงแล้ว
- Empty state guard สำหรับกรณีไม่มีเอกสารที่พร้อมให้ถาม AI
- Mock/API-ready data module ที่ map shape ใกล้กับ Backend chat query/history response
- Pure helper functions สำหรับ status label, readiness sorting, selected document fallback, citation label และ grounded message count
- Test coverage สำหรับ helper, component, route `/chat`, loading/error/empty state และการไม่ expose backend endpoint ลง DOM

Out of scope until Backend/Auth is ready:

- Real `/api/chat/query` request
- Real `/api/chat/history` fetch
- Conversation persistence
- Streaming response UI
- Auth/session cookie binding
- Tenant/session permission checks ก่อน render chat data
- Zod validation สำหรับ response จาก API จริง
- Backend error mapping และ rate-limit/error states จาก API จริง

### Completed Phase 7: AI Quiz Generator

หน้า `/quiz` ถูกเปลี่ยนจาก placeholder เป็นหน้า AI Quiz Generator แบบ mock/API-ready สำหรับ core AI flow ต่อจาก Document Summary และ AI Chat โดยวาง data shape ให้ใกล้กับ Backend exam route เช่น `/api/exams/generate`, `/api/exams/{exam_id}` และ `/api/exams/{exam_id}/publish`

Included:

- `/quiz` route render ผ่าน shared `AppShell`
- AI Quiz Generator UI ภาษาไทย
- Hero summary สำหรับ workspace สร้างควิซจากเอกสาร
- Metric cards สำหรับจำนวนคำถาม, เวลาโดยประมาณ และแหล่งข้อมูลพร้อมใช้
- Source selection list พร้อม status label จาก backend-like status (`ready`, `processing`, `error`)
- Selected source fallback เฉพาะ source ที่พร้อมสร้างควิซ
- Quiz settings panel สำหรับ source mode, question count, difficulty และ AI instructions
- Disabled generate/publish buttons เพื่อกัน user เข้าใจผิดว่าสร้างหรือเผยแพร่จริงแล้ว
- Safe question preview พร้อมตัวเลือกและ citation โดยไม่ render `correct_index` หรือเฉลยลง DOM
- Empty state guard สำหรับกรณีไม่มี source ที่พร้อมสร้างควิซ
- Layout overflow guard สำหรับชื่อไฟล์/คำถามภาษาไทยยาว ๆ
- Mock/API-ready data module ที่ map shape ใกล้กับ Backend exam generate response
- Pure helper functions สำหรับ difficulty/status/source labels, question count clamp, source sorting/fallback, duration estimate และ citation label
- Test coverage สำหรับ helper, component, route `/quiz`, loading/error/empty state, disabled actions, safe preview และการไม่ expose backend endpoint ลง DOM

Out of scope until Backend/Auth is ready:

- Real `/api/exams/generate` request
- Real `/api/exams/{exam_id}` fetch
- Real `/api/exams/{exam_id}/publish` request
- Upload/manual/course source switching แบบ interactive
- Trainer/tenant_admin role guard สำหรับ generate/publish
- Learner-safe exam view และ submit flow จริง
- Zod validation สำหรับ response จาก API จริง
- Backend error mapping และ rate-limit/error states จาก API จริง

### Completed Phase 8: Learning Analytics

หน้า `/analytics` ถูกเปลี่ยนจาก placeholder เป็นหน้า Learning Analytics แบบ mock/API-ready สำหรับ Data & Insight phase โดยวาง data shape ให้ใกล้กับ Backend analytics route เช่น `/api/analytics/trainer` และ `/api/analytics/dashboard`

Included:

- `/analytics` route render ผ่าน shared `AppShell`
- Learning Analytics UI ภาษาไทย
- Hero summary สำหรับ workspace วิเคราะห์การเรียน
- Metric cards สำหรับผู้เรียนทั้งหมด, คะแนนเฉลี่ย, ควิซที่ทำแล้ว และแนวโน้มคะแนน
- Score trend chart แบบ lightweight CSS พร้อม accessible `role="img"`
- Skill radar สำหรับหัวข้อที่ควรทบทวน พร้อม accessible `progressbar`
- Activity table สำหรับกิจกรรมการเรียนล่าสุด
- Document status side panel ที่ map จาก `department_stats`
- Action links ไปยัง Quiz และ Documents เพื่อทบทวนจาก insight
- Empty state guard สำหรับกรณียังไม่มีข้อมูลจากควิซ/กิจกรรม
- Layout overflow guard สำหรับข้อความไทยและ topic ยาว ๆ
- Mock/API-ready data module ที่ map shape ใกล้กับ Backend trainer analytics response
- Pure helper functions สำหรับ percent formatting, risk label, skill sorting, trend delta, department label และ metric card mapping
- Foundation placeholder cleanup ให้เหลือเฉพาะ route ที่ยังไม่มี feature จริง (`/courses`, `/settings`)
- Test coverage สำหรับ helper, component, route `/analytics`, loading/error/empty state, accessible chart/progressbar, layout guard และการไม่ expose backend endpoint ลง DOM

Out of scope until Backend/Auth is ready:

- Real `/api/analytics/trainer` fetch
- Real `/api/analytics/dashboard` fetch
- Role guard สำหรับ teacher/admin analytics
- Learner analytics view แยกจาก trainer analytics
- Zod validation สำหรับ response จาก API จริง
- Backend error mapping และ empty states จาก API จริง
- Real event stream จาก quiz/chat/document usage

## 3. Route Map

| Route | File | Status | Purpose |
| --- | --- | --- | --- |
| `/` | `src/app/page.tsx` | Student Dashboard mock/API-ready | Main learner dashboard |
| `/teacher` | `src/app/teacher/page.tsx` | Teacher Dashboard mock/API-ready | Main teacher dashboard |
| `/courses` | `src/app/courses/page.tsx` | Placeholder | Courses module shell |
| `/documents` | `src/app/documents/page.tsx` | Document Summary mock/API-ready | AI document summary workspace |
| `/chat` | `src/app/chat/page.tsx` | AI Chat & Summary mock/API-ready | Grounded document chat workspace |
| `/quiz` | `src/app/quiz/page.tsx` | AI Quiz Generator mock/API-ready | AI quiz generation workspace |
| `/analytics` | `src/app/analytics/page.tsx` | Learning Analytics mock/API-ready | Learning insight workspace |
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
│   │   ├── analytics/page.test.tsx
│   │   ├── analytics/page.tsx
│   │   ├── chat/page.test.tsx
│   │   ├── chat/page.tsx
│   │   ├── courses/page.tsx
│   │   ├── documents/page.test.tsx
│   │   ├── documents/page.tsx
│   │   ├── login/page.tsx
│   │   ├── quiz/page.test.tsx
│   │   ├── quiz/page.tsx
│   │   ├── register/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── teacher/page.tsx
│   │   ├── AppShell.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── navigation.ts
│   │   ├── PlaceholderRoute.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── ui/
│   │       ├── Button.test.tsx
│   │       ├── Button.tsx
│   │       ├── Card.test.tsx
│   │       ├── Card.tsx
│   │       └── sharedUiConventions.test.ts
│   ├── features/
│   │   ├── learning-analytics/
│   │   │   ├── LearningAnalyticsPage.tsx
│   │   │   ├── LearningAnalyticsPage.test.tsx
│   │   │   ├── learningAnalyticsData.ts
│   │   │   ├── learningAnalyticsHelpers.ts
│   │   │   ├── learningAnalyticsHelpers.test.ts
│   │   │   └── types.ts
│   │   ├── ai-quiz-generator/
│   │   │   ├── AiQuizGeneratorPage.tsx
│   │   │   ├── AiQuizGeneratorPage.test.tsx
│   │   │   ├── quizGeneratorData.ts
│   │   │   ├── quizGeneratorHelpers.ts
│   │   │   ├── quizGeneratorHelpers.test.ts
│   │   │   └── types.ts
│   │   ├── ai-chat/
│   │   │   ├── AiChatSummaryPage.tsx
│   │   │   ├── AiChatSummaryPage.test.tsx
│   │   │   ├── aiChatData.ts
│   │   │   ├── aiChatHelpers.ts
│   │   │   ├── aiChatHelpers.test.ts
│   │   │   └── types.ts
│   │   ├── auth/
│   │   │   ├── AuthFormFields.tsx
│   │   │   ├── AuthShell.tsx
│   │   │   ├── authContent.ts
│   │   │   ├── authValidation.ts
│   │   │   ├── LoginPage.tsx
│   │   │   ├── mockAuthClient.ts
│   │   │   ├── RegisterPage.tsx
│   │   │   └── types.ts
│   │   ├── foundation/
│   │   │   ├── PlaceholderPage.tsx
│   │   │   ├── PlaceholderPage.test.tsx
│   │   │   ├── placeholderContent.ts
│   │   │   ├── placeholderContent.test.ts
│   │   │   └── types.ts
│   │   ├── document-summary/
│   │   │   ├── DocumentSummaryPage.tsx
│   │   │   ├── DocumentSummaryPage.test.tsx
│   │   │   ├── documentSummaryData.ts
│   │   │   ├── documentSummaryHelpers.ts
│   │   │   ├── documentSummaryHelpers.test.ts
│   │   │   └── types.ts
│   │   ├── student-dashboard/
│   │   │   ├── StudentDashboardPage.tsx
│   │   │   ├── StudentDashboardPage.test.tsx
│   │   │   ├── dashboardHelpers.ts
│   │   │   ├── dashboardHelpers.test.ts
│   │   │   ├── mockData.ts
│   │   │   └── types.ts
│   │   └── teacher-dashboard/
│   │       ├── TeacherDashboardPage.tsx
│   │       ├── teacherDashboardData.ts
│   │       ├── teacherDashboardHelpers.ts
│   │       └── types.ts
│   ├── lib/
│   │   ├── cn.test.ts
│   │   └── cn.ts
│   └── test/
│       └── setup.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

App Shell feature module:

```text
src/features/app-shell/
├── AppShell.tsx
├── AppShell.test.tsx
├── AppShellBrand.tsx
├── AppShellIconButton.tsx
├── AppShellNavigationGroup.tsx
├── AppShellLogoutButton.tsx
├── AppShellTopBar.tsx
├── DesktopSidebar.tsx
├── MobileNavigationDialog.tsx
├── NavigationLink.tsx
├── appShellHelpers.ts
├── appShellHelpers.test.ts
├── navigationData.ts
├── navigationData.test.ts
└── types.ts
```

## 5. Architecture Summary

The current frontend follows a feature-oriented structure inside `src/features` and keeps route entry points thin inside `src/app`.

### App Layer

`src/app` contains App Router routes, app layout, global CSS, and thin compatibility exports for shared shell/navigation modules.

Responsibilities:

- Define public routes
- Compose route pages from feature components
- Re-export shared shell/navigation modules for existing route imports
- Compose placeholder routes through `PlaceholderRoute`
- Configure global styles

### Feature Layer

`src/features` contains business-facing UI modules.

Current feature modules:

- `features/foundation`: placeholder route content, UI-only placeholder surface, and tests for deferred modules
- `features/app-shell`: shared responsive app shell, navigation data, shell sub-components, and active route helpers
- `features/ai-chat`: grounded chat UI, backend-like mock data, types, and pure helpers
- `features/ai-quiz-generator`: quiz generator UI, backend-like mock data, types, and pure helpers
- `features/auth`: login/register UI, auth form helpers, auth validation, centralized copy/types, and API-ready mock auth client
- `features/document-summary`: document summary UI, backend-like mock data, types, and pure helpers
- `features/learning-analytics`: learning analytics UI, backend-like mock data, types, and pure helpers
- `features/student-dashboard`: learner dashboard UI, mock/API-ready wrapper, types, and pure helpers
- `features/teacher-dashboard`: teacher dashboard UI, mock/API-ready data, types, and pure helpers

### Shared UI Layer

`src/components/ui` contains reusable atomic components used across feature modules.

Current shared components:

- `Button`: arrow-export primitive with default `type="button"`, variant classes, native button attributes, and tests
- `Card`: arrow-export surface primitive with class merge/attribute forwarding tests

### Utility Layer

`src/lib` contains shared utilities.

Current utilities:

- `cn`: arrow-export safe class name join helper that preserves class order and filters falsey values
- `lib/api/backendConfig`: server-only Backend base URL normalization and relative path URL builder for BFF route handlers
- `lib/api/backendClient`: typed JSON request helper with timeout, backend error mapping, Bearer forwarding from server cookies, and Zod response validation
- `lib/api/authContract`: Backend auth/session/token schemas and `student -> learner`, `teacher -> trainer` role mapping helpers
- `lib/api/authCookies`: HttpOnly Secure SameSite=Strict cookie descriptors for access/refresh tokens
- `lib/api/csrf`: Origin header guard helpers for state-changing BFF routes

## 6. Auth Module Specification

### Auth Routes

| Route | Component | Behavior |
| --- | --- | --- |
| `/login` | `LoginPage` | Collect email/password, validate locally, show mock success |
| `/register` | `RegisterPage` | Collect role/account fields, validate locally, show mock success |

### Validation Rules

Validation lives in `src/features/auth/authValidation.ts` and uses Zod.
Shared auth input/result types live in `src/features/auth/types.ts`.
Display copy and initial mock form state live in `src/features/auth/authContent.ts`.
Mock API-ready submission wrappers live in `src/features/auth/mockAuthClient.ts`.

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
The current mock client returns a session-shaped result marked as `mode: "http-only-cookie"` and `storesTokenInClient: false` to keep the future integration direction explicit without storing real tokens in browser storage.

### API Client Foundation

Phase 4 starts with a server-side BFF contract:

- Browser calls same-origin Next.js route handlers.
- Next.js BFF calls FastAPI using `AI_TUTOR_BACKEND_URL`.
- FastAPI returns token JSON only to the BFF.
- BFF stores access/refresh tokens with HttpOnly Secure SameSite=Strict cookies.
- Browser code must not read tokens, store tokens, or call FastAPI directly with credentials.

Current foundation files:

- `src/lib/api/backendConfig.ts`
- `src/lib/api/backendClient.ts`
- `src/lib/api/authContract.ts`
- `src/lib/api/authCookies.ts`
- `src/lib/api/csrf.ts`

The first CSRF layer for BFF mutation routes is Origin header validation. Double-submit CSRF tokens can be added later if the team decides the extra friction is worth it.

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
Dashboard แยก type/mock/helper ออกจาก UI แล้ว และไม่มีการ expose API path ลง DOM

### Teacher Dashboard UI

Teacher Dashboard ใช้รูปแบบ operational dashboard สำหรับครู เน้น scan สถานะห้องเรียนและงานที่ต้องจัดการต่อ:

- Hero summary สีเขียวเข้ม + gold เพื่อแยกจาก Student Dashboard
- Quick action links ไปยังการสร้างควิซ, สรุปเอกสาร และ analytics
- Metric cards สำหรับภาพรวมการสอน
- Class progress list พร้อม `progressbar` ที่อ่านได้ด้วย assistive technology
- Latest quizzes พร้อม status label
- Recent activity feed สำหรับงานที่ควรติดตาม
- Copy บนหน้าจอเป็นภาษาไทย

Dashboard ยังไม่มี API call, role guard หรือ permission check จริงจนกว่า Auth/Backend contract จะพร้อม

### Document Summary UI

Document Summary ใช้ layout แบบ workspace สำหรับอ่านและต่อยอดเอกสาร ไม่ใช่หน้า landing:

- Hero สี navy เพื่อเชื่อมกับ AI Tutor platform
- Metric cards สำหรับสถานะเอกสาร
- Selected document panel สำหรับสรุปหลักและ action ต่อไปยัง Quiz/Chat
- Summary sections จาก Markdown ที่ render เป็น text อย่างปลอดภัย
- Key topics พร้อม confidence progressbar
- Detailed breakdown และ related documents สำหรับทบทวนต่อ
- Copy บนหน้าจอเป็นภาษาไทย

หน้านี้ยังไม่มี API call, upload จริง, export/share จริง หรือ permission check จริงจนกว่า Auth/Backend contract จะพร้อม

### AI Chat & Summary UI

AI Chat & Summary ใช้ layout แบบ workspace สำหรับถามต่อจากเอกสารและดูคำตอบพร้อมหลักฐาน:

- Hero สี teal เข้มเพื่อแยกจาก Document Summary แต่ยังอยู่ในโทน learning platform
- Metric cards สำหรับสถานะบทสนทนา
- Document context list สำหรับเลือกเอกสารที่พร้อมถาม AI
- Chat thread พร้อม learner/assistant message bubbles
- Citation cards ที่แสดง filename, chunk section และ matched text แบบ plain text
- Summary side panel สำหรับ takeaways และ action ต่อไปยัง Document Summary/Quiz
- Disabled composer สำหรับ mock phase
- Copy บนหน้าจอเป็นภาษาไทย

หน้านี้ยังไม่มี API call, streaming, conversation persistence หรือ permission check จริงจนกว่า Auth/Backend contract จะพร้อม

### AI Quiz Generator UI

AI Quiz Generator ใช้ layout แบบ workspace สำหรับสร้างแบบร่างควิซจากเอกสารและดูคำถามก่อนเผยแพร่:

- Hero สีเขียวเข้ม + gold เพื่อโยงกับ teacher workflow และแยกจาก Document/Chat
- Metric cards สำหรับจำนวนข้อ, เวลาโดยประมาณ และ source readiness
- Source panel สำหรับเลือกเอกสารที่พร้อมสร้างควิซ
- Settings panel สำหรับ source mode, question count, difficulty และ AI instructions
- Question preview พร้อมตัวเลือกและ citation แบบ plain text
- ไม่ render เฉลยหรือ `correct_index` ใน DOM
- Disabled generate/publish actions สำหรับ mock phase
- Layout guard กันชื่อไฟล์/คำถามภาษาไทยยาวดัน column จนซ้อน
- Copy บนหน้าจอเป็นภาษาไทย

หน้านี้ยังไม่มี API call, interactive source switching, publish จริง, learner submit flow หรือ permission check จริงจนกว่า Auth/Backend contract จะพร้อม

### Learning Analytics UI

Learning Analytics ใช้ layout แบบ insight workspace สำหรับครูหรือผู้ดูแลการเรียนที่ต้อง scan แนวโน้มและจุดอ่อนเร็ว:

- Hero สี teal เข้ม + amber เพื่อแยกจาก Quiz แต่ยังอยู่ในโทน learning platform
- Metric cards สำหรับภาพรวมผู้เรียน คะแนน และปริมาณควิซ
- Score trend chart แบบ CSS ที่อ่านได้ด้วย `role="img"`
- Skill radar สำหรับหัวข้อที่มี error rate สูง พร้อม progressbar สำหรับ assistive technology
- Activity table สำหรับกิจกรรมจาก quiz/document/chat
- Side panel สำหรับ strongest/weakest insight, action ไป Quiz/Documents และสถานะเอกสาร
- Layout guard กันข้อความไทยยาวดัน column จนซ้อน
- Copy บนหน้าจอเป็นภาษาไทย

หน้านี้ยังไม่มี API call, role guard, event stream จริง หรือ response validation จริงจนกว่า Auth/Backend contract จะพร้อม

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
src/app/analytics/page.test.tsx
src/app/auth-routes.test.tsx
src/app/chat/page.test.tsx
src/app/documents/page.test.tsx
src/app/page.test.tsx
src/app/quiz/page.test.tsx
src/app/routes.test.tsx
src/app/security-headers.test.ts
src/app/teacher/page.test.tsx
src/components/ui/Button.test.tsx
src/components/ui/Card.test.tsx
src/components/ui/sharedUiConventions.test.ts
src/features/app-shell/AppShell.test.tsx
src/features/app-shell/appShellHelpers.test.ts
src/features/app-shell/navigationData.test.ts
src/features/ai-chat/AiChatSummaryPage.test.tsx
src/features/ai-chat/aiChatHelpers.test.ts
src/features/ai-quiz-generator/AiQuizGeneratorPage.test.tsx
src/features/ai-quiz-generator/quizGeneratorHelpers.test.ts
src/features/auth/AuthShell.test.tsx
src/features/auth/LoginPage.test.tsx
src/features/auth/RegisterPage.test.tsx
src/features/auth/authValidation.test.ts
src/features/auth/mockAuthClient.test.ts
src/features/foundation/PlaceholderPage.test.tsx
src/features/foundation/placeholderContent.test.ts
src/features/learning-analytics/LearningAnalyticsPage.test.tsx
src/features/learning-analytics/learningAnalyticsHelpers.test.ts
src/features/document-summary/DocumentSummaryPage.test.tsx
src/features/document-summary/documentSummaryHelpers.test.ts
src/features/student-dashboard/StudentDashboardPage.test.tsx
src/features/student-dashboard/dashboardHelpers.test.ts
src/features/teacher-dashboard/TeacherDashboardPage.test.tsx
src/features/teacher-dashboard/teacherDashboardHelpers.test.ts
src/lib/cn.test.ts
```

Current coverage focus:

- student dashboard page rendering
- app shell navigation
- app shell active route helper
- app shell navigation data contract
- centralized placeholder route content
- UI-only placeholder page rendering
- shared UI primitive behavior
- shared UI arrow-function convention
- class name merge utility behavior
- route rendering
- auth route links
- auth form rendering
- login validation
- register validation
- mock auth client session shape and no token/password exposure
- Zod schema behavior
- auth slideshow assets
- security header config
- mock/API-ready dashboard marker
- student dashboard helper formatting/sorting/relative time
- student dashboard loading/error states
- student dashboard action links and accessible progressbar
- teacher dashboard route and API-ready mock marker
- teacher dashboard helper formatting/sorting/status labels
- teacher dashboard action links and accessible progressbar
- document summary route and API-ready mock marker
- document summary helper status/sorting/markdown parsing
- document summary loading/error/empty states
- document summary action links, disabled export/share, and backend endpoint hiding
- AI chat route and API-ready mock marker
- AI chat helper status/sorting/citation/grounded-message behavior
- AI chat loading/error/empty states
- AI chat action links, disabled composer, and backend endpoint hiding
- AI chat layout overflow guard for long Thai filenames and messages
- AI quiz route and API-ready mock marker
- AI quiz helper difficulty/status/source/count/citation behavior
- AI quiz loading/error/empty states
- AI quiz disabled generate/publish actions and backend endpoint hiding
- AI quiz safe preview without answer keys and layout overflow guard
- learning analytics route and API-ready mock marker
- learning analytics helper percent/risk/sorting/trend/metric behavior
- learning analytics loading/error/empty states
- learning analytics accessible score chart, skill progressbar, activity table, and backend endpoint hiding
- learning analytics layout overflow guard for long Thai content

Current latest verification:

- `npm test`: 40 test files, 135 tests
- `npm run lint`: passing
- `npm run build`: passing
- `npm audit --audit-level=high`: 0 vulnerabilities

## 10. Known Deferred Work

The following items should wait until Backend/API integration branches:

- Auth BFF route handlers for login/register/session/logout/refresh
- Login/register use cases that call BFF repositories
- Session cookie read/write inside Next.js route handlers
- Auth callback/refresh handling
- Route protection
- Role-based dashboard routing
- Student dashboard analytics API client
- Dashboard response validation with Zod
- Student dashboard empty states from real API
- Teacher dashboard real API integration, role guard, loading/error/empty states
- Document Summary real API integration, upload, recap generation, export/share, and response validation
- AI Chat real API integration, history fetch, streaming response, rate-limit handling, and response validation
- AI Quiz real API integration, role guard, publish flow, learner-safe exam view, submit flow, and response validation
- Learning Analytics real API integration, role guard, learner/trainer view split, event stream mapping, and response validation
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

For the current Learning Analytics commit, include:

```text
frontend/src/app/analytics/page.tsx
frontend/src/app/analytics/page.test.tsx
frontend/src/app/routes.test.tsx
frontend/src/features/foundation/PlaceholderPage.test.tsx
frontend/src/features/foundation/placeholderContent.ts
frontend/src/features/foundation/placeholderContent.test.ts
frontend/src/features/foundation/types.ts
frontend/src/features/learning-analytics/
frontend/SRS.md
```

This feature replaces the `/analytics` placeholder with a mock/API-ready Learning Analytics workspace while keeping Backend/Auth integration deferred.

Do not include unrelated local/backend files in this commit unless intentionally requested:

```text
AGENTS_FRONTEND.md
DESIGN.md
frontend/next-env.d.ts
backend/docker-compose.yml
```
