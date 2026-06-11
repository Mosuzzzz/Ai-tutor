# AI Tutor Frontend SRS

เอกสารนี้สรุปโครงสร้างและสถานะของ Frontend ปัจจุบันสำหรับ Web app AI Tutor Platform ตามแนวทางใน `AGENTS_FRONTEND.md`

## 1. Project Overview

AI Tutor Frontend เป็น Next.js 16 App Router application สำหรับแพลตฟอร์มผู้ช่วยเรียนรู้ด้วย AI โดยช่วงปัจจุบันมีฐาน UI, หน้า Auth แบบ mock, หน้า Student Dashboard, Teacher Dashboard, Document Summary, AI Chat & Summary, AI Quiz Generator และ Learning Analytics ที่เชื่อม Backend แบบ API-integrated ผ่าน server-side HttpOnly cookie boundary

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

Auth started as frontend-only mock UI and has since been connected through the Next.js BFF cookie-session boundary.

Included:

- `/login` route
- `/register` route
- Login form with email/password validation
- Register form with role selection, profile fields, password confirmation, and terms acceptance
- Zod validation schemas
- API-ready auth client with async submit wrappers
- Centralized auth types and display copy
- Submitting/success/error states with pending tone separated from final success
- Disabled mock social auth buttons
- Local WebP slideshow visual panel on auth pages
- Security headers configured in Next.js
- Tests for validation, auth client, routes, components, and security headers

### EmailVerificationDevFlow Update

Local/dev registration now supports Backend email verification without exposing verification tokens to browser code.

Included:

- Next.js BFF `/api/auth/register` can auto-call Backend `/api/auth/verify-email` when Backend returns a `dev_token` and the BFF is running outside production.
- The `dev_token` is used only inside the server-side BFF handler and is never returned to `authApiClient`, React state, DOM, URL, `localStorage`, or `sessionStorage`.
- Production behavior keeps the normal email-verification requirement because the dev verification switch defaults off when `NODE_ENV=production`.
- Register UI shows a safe success state and a direct `/login` action after local dev verification succeeds.
- Tests cover BFF server-side verification, disabled-switch behavior, client response sanitization, and Register UI login CTA.

Security notes:

- This flow is for local/test developer ergonomics only; real email verification must remain enforced by Backend in staging/production.
- The browser continues to use same-origin BFF calls with `credentials: "same-origin"` and does not store auth or verification tokens client-side.

Out of scope until Backend/Auth follow-up branches:

- Backend error mapping
- OAuth/social provider integration
- End-to-end Playwright tests for real deployed auth

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

### Completed Phase 3.1: Student Dashboard API Integration

StudentDashboardApiIntegration connects the learner home dashboard to the Backend analytics contract while preserving the existing UI composition.

Included:

- `/` calls `loadStudentDashboardForSession()` after `requirePageSession("/")` returns the current session.
- `src/features/student-dashboard/studentDashboardApi.ts` reads only the server-side HttpOnly access cookie and calls Backend `/api/analytics/dashboard` through the shared API client.
- `src/features/student-dashboard/studentDashboardContract.ts` validates the learner dashboard payload with Zod before UI mapping.
- `src/features/student-dashboard/studentDashboardMapper.ts` maps Backend response data into the existing Thai student dashboard view model and uses the sanitized session display name/email.
- Student Dashboard supports API `ready`, `empty`, and `error` states without exposing Backend endpoint details or auth tokens in the DOM.
- Frontend does not send or trust a `user_id` from the URL/client state; it relies on Backend to scope `/api/analytics/dashboard` from the current HttpOnly-cookie session token. Backend should confirm this endpoint is learner-scoped, not only tenant-scoped.

Out of scope for this branch:

- Real continue-learning recommendations from Backend
- Learner-specific activity/skill breakdown UI from the extra Backend fields
- Playwright E2E against a running Backend

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

Superseded by TeacherDashboardApiIntegration:

- Real teacher analytics API fetch
- Role guard เช่น `RequireRole("teacher")`
- Session-based permission check ก่อน render teacher UI
- Zod validation สำหรับ response จาก API จริง
- Loading/error/empty states จาก network จริง
- Backend error mapping

### Completed Phase 4.1: Teacher Dashboard API Integration

TeacherDashboardApiIntegration connects `/teacher` to the Backend trainer analytics contract while preserving the existing Thai dashboard composition.

Included:

- `/teacher` calls `loadTeacherDashboardForSession()` after `requirePageSession("/teacher")` returns a sanitized teacher or tenant admin session.
- `src/features/teacher-dashboard/teacherDashboardApi.ts` reads only the server-side HttpOnly access cookie and calls Backend `/api/analytics/trainer` plus `/api/analytics/trainer/students` through the shared API client.
- `src/features/teacher-dashboard/teacherDashboardContract.ts` validates both trainer analytics and student-list payloads with Zod before UI mapping.
- `src/features/teacher-dashboard/teacherDashboardMapper.ts` maps Backend `total_employees`, `total_quizzes_taken`, `department_stats`, `skill_gaps`, and student stats into the existing teacher dashboard view model.
- Teacher Dashboard supports API `ready`, `empty`, and `error` states without exposing Backend endpoint details or auth tokens in the DOM.
- Route protection maps Backend `trainer` to frontend `teacher`, allows `teacher`/`tenant_admin` on `/teacher`, and redirects `global_admin` to `/analytics` because Backend trainer endpoints do not accept global admin sessions.

Out of scope for this branch:

- Backend-provided class/course-level teacher dashboard data beyond the current trainer analytics endpoints
- Real-time teacher analytics refresh
- Playwright E2E against a running Backend

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

Superseded by DocumentsApiIntegration:

- Real `/api/files/dashboard` fetch
- Real `/api/files/{file_id}/detail` fetch
- Cached `GET /api/recap/{file_id}` fallback
- Zod validation สำหรับ response จาก API จริง
- Tenant/session permission checks ก่อน render document data
- Backend error mapping และ empty states จาก API จริง

Still out of scope:

- Delete/download document flow
- Export/share implementation
- POST recap generation request

### DocumentsApiIntegration Update

The `/documents` route now uses the protected session boundary and reads document data through the shared server-side API client instead of rendering only static mock data.

Included:

- `/documents` calls `requirePageSession("/documents")` before loading any document data.
- `src/features/document-summary/documentSummaryApi.ts` reads only the server-side HttpOnly access cookie and calls Backend document endpoints through `backendJsonRequest`.
- `src/features/document-summary/documentSummaryContract.ts` validates `/api/files/dashboard`, `/api/files/{file_id}/detail`, `/api/files/{file_id}/status`, and `/api/recap/{file_id}` responses with Zod.
- `src/features/document-summary/documentSummaryMapper.ts` maps Backend dashboard/detail/recap responses into the existing Document Summary view model.
- The selected document defaults to a ready document with an available summary, falls back to ready documents, then falls back to the first document in the library.
- If a ready detail response has no `summary_markdown`, the loader attempts cached `GET /api/recap/{file_id}` and uses that markdown when available.
- Empty, error, processing, ready, and no-summary states map into UI-safe states without exposing backend endpoints or auth tokens in the DOM.
- Delete/download are not wired in this branch because they are state-changing or file-streaming operations and should be added through dedicated Next.js BFF routes with CSRF/origin checks.

Out of scope for this branch:

- Document delete BFF route
- Original-file download proxy/streaming route
- Export/share summary actions
- POST recap generation from the browser

### DocumentUploadProcessingState Update

The `/documents` route now includes the first real Phase 5 document upload flow through a same-origin Next.js BFF boundary.

Included:

- `/documents` passes session role information into the Document Summary page and shows upload UI only for `teacher`, `tenant_admin`, and `global_admin` sessions.
- Learner/student sessions see a non-upload informational state instead of an active file input.
- `src/features/document-summary/DocumentUploadPanel.tsx` provides client-side file selection, validation, upload status copy, processing progress semantics, and status polling.
- `src/features/document-summary/documentUploadApiClient.ts` posts browser uploads only to same-origin `/api/documents/upload` with `credentials: "same-origin"` and does not set a manual multipart `Content-Type`.
- `src/app/api/documents/upload/route.ts` proxies multipart uploads to Backend `/api/files/upload` through a server-side BFF handler.
- `src/app/api/documents/[fileId]/status/route.ts` loads processing status through the same server-side cookie boundary.
- `src/app/api/documents/_lib/documentBffHandlers.ts` applies same-origin CSRF/Origin checks for upload, reads only the HttpOnly access cookie, validates file type/size/name, sanitizes filenames, and returns only safe response fields to the browser.
- `src/lib/api/backendClient.ts` now supports `backendFormDataRequest()` for server-side multipart requests without leaking auth tokens or forcing JSON `Content-Type`.
- Upload validation currently allows `.pdf`, `.docx`, `.doc`, `.pptx`, `.ppt`, `.png`, `.jpg`, `.jpeg`, and `.webp` files up to 50MB.
- Upload success refreshes the route and polls `/api/documents/{fileId}/status` while the document remains `pending` or `processing`.

Security notes:

- Browser code still never reads or stores access/refresh tokens in `localStorage` or `sessionStorage`.
- The frontend role gate is UX only; Backend `require_role` / tenant scoping must remain the real authorization boundary for upload and status endpoints.
- BFF upload responses intentionally do not expose Backend `storage_url` or bearer tokens to the DOM.

Still out of scope:

- Delete/download document flow
- Export/share implementation
- POST recap generation request
- Playwright E2E against a running Backend upload pipeline

### DocumentSummaryDetailPage Update

The document workspace now supports deep-linked summary detail pages for individual documents.

Included:

- `/documents/[fileId]` renders a protected document detail page inside `AppShell`.
- The route validates the path segment before loading protected data and rejects empty, path-like, or overly long file ids.
- The route calls `requirePageSession("/documents")` and then `loadDocumentSummaryDetailForSession()` with the normalized file id.
- `loadDocumentSummaryDetailForSession()` reuses the server-side HttpOnly cookie API loader and requires an exact document match from `/api/files/dashboard`; it does not fall back to another document when the route id is missing.
- The detail page shows the selected document filename, status, uploader label, generated date, summary sections, key topics with accessible progressbars, optional source preview, and related document deep links.
- The main `/documents` page now exposes a safe "ดูรายละเอียดเอกสาร" link to `/documents/{fileId}` for the selected document.
- Related document links are now generated as `/documents/{fileId}` with `encodeURIComponent()` instead of pointing back to the generic document workspace.
- Detail actions link to `/quiz?documentId={fileId}` and `/chat?documentId={fileId}` so quiz/chat integration branches can consume document context.

Security notes:

- The URL contains only the document id; Backend tenant/session scoping remains the authorization boundary.
- The detail page does not expose Backend endpoint paths, `storage_url`, bearer tokens, or session tokens in the DOM.
- Browser code still does not read or store auth tokens in `localStorage` or `sessionStorage`.

Still out of scope:

- Delete/download document flow
- Export/share implementation
- POST recap generation request
- Playwright E2E against a running Backend detail page

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

Superseded by ChatApiIntegration and remaining out of scope:

- Superseded: BFF-backed real `/api/chat/query` request path
- Superseded: Real `/api/chat/history` fetch
- Superseded: visible composer enablement through ChatWithDocumentContext
- Still deferred: conversation persistence beyond Backend audit history
- Still deferred: streaming response UI
- Superseded: Auth/session cookie binding via HttpOnly cookie
- Tenant/session permission checks ก่อน render chat data
- Zod validation สำหรับ response จาก API จริง
- Backend error mapping และ rate-limit/error states จาก API จริง

### ChatApiIntegration Update

Included:

- `/chat` now loads document context and chat history from Backend through the server-side API client.
- The loader reads auth only from the HttpOnly access cookie and never from `localStorage` or `sessionStorage`.
- Backend `/api/chat/history` responses are validated with Zod and mapped into the existing chat UI view model.
- Backend audit-lite citation payloads are normalized into the UI citation shape before rendering.
- `POST /api/chat/query` is proxied through a Next.js BFF route with Origin/CSRF guard, safe input validation, and sanitized error messages.
- The initial integration kept the visible composer disabled until a dedicated document-context interaction branch.

Remaining out of scope:

- Streaming assistant responses.
- Retry UX after failed chat submissions.
- Optional double-submit CSRF token if the team requires it beyond Origin guard.
- Rate-limit-specific UI copy once Backend returns final error semantics.

### ChatWithDocumentContext Update

The `/chat` workspace now supports asking the AI about the currently selected ready document through the existing same-origin BFF route.

Included:

- `/chat` accepts an optional `documentId` query param, normalizes `string`/`string[]` values, and passes the selected document id into the server-side chat loader.
- Document Summary action links now preserve context by sending users to `/chat?documentId={fileId}` with `encodeURIComponent()`.
- `AiChatSummaryPage` enables the visible composer for the selected ready document, appends the learner question and assistant answer to the thread, and keeps the submit button disabled while empty or submitting.
- `submitDocumentChatQuestion()` validates input with Zod, posts to `/api/chat/query` using same-origin credentials, validates the Backend response shape, and maps backend/fetch/malformed-response failures to safe Thai UI copy.
- `toDocumentContextChatMessages()` maps a successful chat query response into learner and assistant messages with document-grounded citations.
- Browser code still does not read or store bearer tokens in `localStorage` or `sessionStorage`; auth remains inside the HttpOnly cookie + BFF boundary.
- Tests cover route query normalization, chat query client success/error paths, mapper citation fallback, component submit UX, safe error rendering, document-summary chat links, and endpoint/token/storage hiding.

Remaining out of scope:

- Streaming assistant responses.
- Durable threaded conversation persistence beyond Backend chat history/audit behavior.
- Retry-specific UI beyond the safe error message.
- Rate-limit-specific UI copy once Backend returns final error semantics.
- Optional double-submit CSRF token if the team requires it beyond Origin guard.

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
- Visible generate action ผ่าน BFF และ publish button ยัง disabled จนกว่าจะมี dedicated publish UI
- Safe question preview พร้อมตัวเลือกและ citation โดยไม่ render `correct_index` หรือเฉลยลง DOM
- Empty state guard สำหรับกรณีไม่มี source ที่พร้อมสร้างควิซ
- Layout overflow guard สำหรับชื่อไฟล์/คำถามภาษาไทยยาว ๆ
- Mock/API-ready data module ที่ map shape ใกล้กับ Backend exam generate response
- Pure helper functions สำหรับ difficulty/status/source labels, question count clamp, source sorting/fallback, duration estimate และ citation label
- Test coverage สำหรับ helper, component, route `/quiz`, loading/error/empty state, disabled actions, safe preview และการไม่ expose backend endpoint ลง DOM

Out of scope until Backend/Auth is ready:

- Superseded: BFF-backed real `/api/exams/generate` request path
- Superseded: Real `/api/exams/{exam_id}` fetch
- Superseded: BFF-backed real `/api/exams/{exam_id}/publish` request path
- Upload/manual/course source switching แบบ interactive
- Trainer/tenant_admin role guard สำหรับ generate/publish
- Superseded: learner-safe exam view และ submit flow จริง
- Zod validation สำหรับ response จาก API จริง
- Backend error mapping และ rate-limit/error states จาก API จริง

### QuizApiIntegration Update

Included:

- `/quiz` now loads document sources from Backend through the server-side API client.
- The loader reads auth only from the HttpOnly access cookie and never from `localStorage` or `sessionStorage`.
- Backend `/api/exams/{exam_id}` responses are validated with Zod when a selected exam id is provided.
- Trainer exam payloads are mapped into safe preview questions without `correct_index` or `explanation` in the UI view model.
- Learner exam payloads are strict and reject answer-key fields if Backend accidentally returns them.
- Same-origin BFF routes proxy quiz generation, update, publish, and submit actions with Origin/CSRF guard.
- UI generate and learner submit interactions are wired through dedicated interaction branches; publish remains disabled until its own UI branch.

Remaining out of scope:

- Visible update/publish UI interactions.
- Richer learner quiz discovery/listing beyond direct `/quiz?examId=...` links.
- Rate-limit-specific UI copy once Backend returns final error semantics.
- Optional double-submit CSRF token if the team requires it beyond Origin guard.

### SaveQuizAttemptAndScore Update

The `/quiz` workspace now supports learner-safe published quiz attempts and score feedback through the existing same-origin BFF route.

Included:

- `/quiz` accepts an optional `examId` query param, normalizes `string`/`string[]` values, and passes the selected exam id into the server-side quiz loader.
- Student sessions are allowed to open `/quiz` deep links for published exam attempts, while the main app navigation still keeps the generator entry scoped to teacher/tenant admin roles.
- Quiz view-model capabilities hide trainer-only generation settings/actions from learner sessions even when learners open `/quiz?examId=...`.
- Published learner-safe exam payloads render a "ทำควิซ" attempt panel with radio options and a disabled submit button until every question has an answer.
- `submitQuizAttempt()` validates exam id and answer map, posts to `/api/quiz/{examId}/submit` with same-origin credentials, validates the Backend score response, and maps invalid input/backend/malformed/fetch failures to safe UI messages.
- `toQuizAttemptResult()` maps score, pass/fail state, chosen answers, correct answers, explanations, and citations into a UI view model without passing raw `correct_index` field names into the DOM.
- Browser code still does not read or store bearer tokens in `localStorage` or `sessionStorage`; auth remains inside the HttpOnly cookie + BFF boundary.
- Tests cover attempt client success/error paths, route `examId` forwarding, learner route access, component answer selection/submission, score feedback rendering, mapper safety, and no raw answer-key field leakage.

Remaining out of scope:

- Published quiz discovery/list page for learners.
- Dedicated publish/update UI for trainers.
- Learner retake policy and duplicate-attempt UX once Backend semantics are final.
- Rate-limit-specific UI copy once Backend returns final error semantics.
- Optional double-submit CSRF token if the team requires it beyond Origin guard.

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

### AnalyticsApiIntegration Update

The `/analytics` route now uses the protected session boundary and reads role-aware analytics data through the shared server-side API client instead of rendering only static mock data.

Included:

- `/analytics` calls `requirePageSession("/analytics")` before loading any analytics data.
- `src/features/learning-analytics/learningAnalyticsApi.ts` reads only the server-side HttpOnly access cookie and calls Backend analytics endpoints through `backendJsonRequest`.
- Student/learner sessions call `/api/analytics/dashboard` and map `score_trend`, `recent_activity`, and `skill_breakdown` into the shared analytics workspace.
- Teacher sessions call `/api/analytics/trainer` and `/api/analytics/trainer/students` only.
- Tenant admin sessions call trainer analytics plus `/api/analytics/audit-logs`.
- Global admin sessions call `/api/analytics/usage?days=30` plus `/api/analytics/audit-logs` and do not call trainer-only endpoints.
- `src/features/learning-analytics/learningAnalyticsContract.ts` validates learner, trainer, student list, usage, and audit-log payloads with Zod before UI mapping.
- `src/features/learning-analytics/learningAnalyticsMapper.ts` maps Backend responses into the existing Learning Analytics view model while avoiding token, IP address, and `user_id` exposure in UI state.
- Learning Analytics supports API `ready`, `empty`, and `error` states with `data-source="api"` on the route-rendered page.

Still out of scope:

- Real-time analytics/event stream refresh
- Dedicated admin audit table UI beyond the current shared activity table mapping
- Playwright E2E against a running Backend
- Rate-limit-specific analytics error copy once Backend returns final error semantics

## 3. Route Map

| Route | File | Status | Purpose |
| --- | --- | --- | --- |
| `/` | `src/app/page.tsx` | Student Dashboard API-integrated | Main learner dashboard |
| `/teacher` | `src/app/teacher/page.tsx` | Teacher Dashboard API-integrated | Main teacher dashboard |
| `/courses` | `src/app/courses/page.tsx` | Placeholder | Courses module shell |
| `/documents` | `src/app/documents/page.tsx` | Document Summary API-integrated + upload processing | AI document summary workspace |
| `/documents/[fileId]` | `src/app/documents/[fileId]/page.tsx` | Document Summary detail API-integrated | Deep-linked document summary detail |
| `/chat` | `src/app/chat/page.tsx` | AI Chat & Summary API-integrated | Grounded document chat workspace |
| `/quiz` | `src/app/quiz/page.tsx` | AI Quiz Generator API-integrated | AI quiz generation workspace |
| `/analytics` | `src/app/analytics/page.tsx` | Learning Analytics API-integrated | Learning insight workspace |
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
│   │   ├── api/auth/_lib/authBffHandlers.ts
│   │   ├── api/auth/login/route.ts
│   │   ├── api/auth/logout/route.ts
│   │   ├── api/auth/refresh/route.ts
│   │   ├── api/auth/register/route.ts
│   │   ├── api/auth/session/route.ts
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
│   │   │   ├── learningAnalyticsApi.ts
│   │   │   ├── learningAnalyticsApi.test.ts
│   │   │   ├── learningAnalyticsContract.ts
│   │   │   ├── learningAnalyticsContract.test.ts
│   │   │   ├── learningAnalyticsHelpers.ts
│   │   │   ├── learningAnalyticsHelpers.test.ts
│   │   │   ├── learningAnalyticsMapper.ts
│   │   │   ├── learningAnalyticsMapper.test.ts
│   │   │   ├── learningAnalyticsTestData.ts
│   │   │   └── types.ts
│   │   ├── ai-quiz-generator/
│   │   │   ├── AiQuizGeneratorPage.tsx
│   │   │   ├── AiQuizGeneratorPage.test.tsx
│   │   │   ├── quizAttemptClient.ts
│   │   │   ├── quizAttemptClient.test.ts
│   │   │   ├── quizGenerationClient.ts
│   │   │   ├── quizGenerationClient.test.ts
│   │   │   ├── quizGeneratorApi.ts
│   │   │   ├── quizGeneratorApi.test.ts
│   │   │   ├── quizGeneratorContract.ts
│   │   │   ├── quizGeneratorContract.test.ts
│   │   │   ├── quizGeneratorData.ts
│   │   │   ├── quizGeneratorHelpers.ts
│   │   │   ├── quizGeneratorHelpers.test.ts
│   │   │   ├── quizGeneratorMapper.ts
│   │   │   ├── quizGeneratorMapper.test.ts
│   │   │   ├── quizGeneratorTestData.ts
│   │   │   └── types.ts
│   │   ├── ai-chat/
│   │   │   ├── AiChatSummaryPage.tsx
│   │   │   ├── AiChatSummaryPage.test.tsx
│   │   │   ├── aiChatApi.ts
│   │   │   ├── aiChatApi.test.ts
│   │   │   ├── aiChatContract.ts
│   │   │   ├── aiChatContract.test.ts
│   │   │   ├── aiChatData.ts
│   │   │   ├── aiChatHelpers.ts
│   │   │   ├── aiChatHelpers.test.ts
│   │   │   ├── aiChatMapper.ts
│   │   │   ├── aiChatMapper.test.ts
│   │   │   ├── aiChatQueryClient.ts
│   │   │   ├── aiChatQueryClient.test.ts
│   │   │   ├── aiChatTestData.ts
│   │   │   └── types.ts
│   │   ├── auth/
│   │   │   ├── AuthFormFields.tsx
│   │   │   ├── AuthShell.tsx
│   │   │   ├── authApiClient.ts
│   │   │   ├── authContent.ts
│   │   │   ├── authValidation.ts
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── types.ts
│   │   ├── foundation/
│   │   │   ├── PlaceholderPage.tsx
│   │   │   ├── PlaceholderPage.test.tsx
│   │   │   ├── placeholderContent.ts
│   │   │   ├── placeholderContent.test.ts
│   │   │   └── types.ts
│   │   ├── document-summary/
│   │   │   ├── DocumentSummaryDetailPage.tsx
│   │   │   ├── DocumentSummaryDetailPage.test.tsx
│   │   │   ├── DocumentSummaryPage.tsx
│   │   │   ├── DocumentSummaryPage.test.tsx
│   │   │   ├── DocumentUploadPanel.tsx
│   │   │   ├── DocumentUploadPanel.test.tsx
│   │   │   ├── documentUploadApiClient.ts
│   │   │   ├── documentUploadApiClient.test.ts
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
- `features/document-summary`: document summary UI, deep-linked detail UI, upload panel, browser-side BFF wrappers, backend-like data contracts, types, and pure helpers
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
- `lib/api/backendClient`: typed JSON/FormData request helpers with timeout, backend error mapping, Bearer forwarding from server cookies, and Zod response validation
- `lib/api/authContract`: Backend auth/session/token schemas and `student -> learner`, `teacher -> trainer` role mapping helpers
- `lib/api/authCookies`: HttpOnly Secure SameSite=Strict cookie descriptors for access/refresh tokens
- `lib/api/csrf`: Origin header guard helpers for state-changing BFF routes

## 6. Auth Module Specification

### Auth Routes

| Route | Component | Behavior |
| --- | --- | --- |
| `/login` | `LoginPage` | Collect email/password, validate locally, submit to same-origin BFF |
| `/register` | `RegisterPage` | Collect role/account fields, validate locally, submit to same-origin BFF |

### Validation Rules

Validation lives in `src/features/auth/authValidation.ts` and uses Zod.
Shared auth input/result types live in `src/features/auth/types.ts`.
Display copy and initial mock form state live in `src/features/auth/authContent.ts`.
Browser-side BFF wrappers live in `src/features/auth/authApiClient.ts`.

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

Current auth uses a Next.js BFF cookie-session boundary:

- Browser calls only same-origin `/api/auth/*` route handlers.
- Next.js BFF calls FastAPI using `AI_TUTOR_BACKEND_URL`.
- FastAPI token JSON is consumed by the BFF only.
- BFF sets `HttpOnly; Secure; SameSite=Strict` access/refresh cookies.
- Browser responses are sanitized and do not include `access_token` or `refresh_token`.
- Browser code must not use `localStorage` or `sessionStorage` for auth tokens.
- Login/Register submit tone separates pending `submitting` from final `success`.

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

### Auth Integration Cookie Session

Implemented BFF routes:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/session`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

Integration details:

- `POST /api/auth/login` calls FastAPI `/api/auth/login`, then `/api/auth/session`, sets auth cookies, and returns sanitized session metadata.
- `POST /api/auth/register` maps frontend roles to backend roles: `student -> learner`, `teacher -> trainer`.
- `GET /api/auth/session` reads the access token cookie server-side and returns sanitized session metadata.
- `POST /api/auth/refresh` reads the refresh token cookie server-side, rotates both cookies, and returns sanitized session metadata.
- `POST /api/auth/logout` forwards the access token server-side when available and always clears auth cookies.
- Auth mutation routes apply same-origin Origin checks before reaching FastAPI.

### AuthGuard Role Routing

Implemented server-side route protection and role-aware shell routing:

- `src/features/auth/authGuard.ts` reads HttpOnly auth cookies only on the server and never exposes tokens to client components.
- `src/features/auth/sessionMapping.ts` converts Backend session responses into sanitized frontend sessions.
- `src/features/auth/authRoutePolicy.ts` centralizes protected route rules, default role redirects, and navigation filtering.
- Protected app routes call `requirePageSession()` before rendering sensitive UI.
- `/login` and `/register` call `redirectAuthenticatedRoute()` so an authenticated user is sent to the correct dashboard.
- Student users can access `/`, `/courses`, `/documents`, `/chat`, `/analytics`, and `/settings`.
- Teacher and tenant admin users can access `/teacher`, `/courses`, `/documents`, `/chat`, `/quiz`, `/analytics`, and `/settings`.
- Global admin users are routed to `/analytics` and do not receive teacher-only `/teacher` or `/quiz` navigation unless Backend expands those trainer endpoints to accept global admin sessions.
- App shell navigation is filtered by the current session role before rendering.
- The shell profile initial/display label comes from sanitized session metadata, not from URL or client storage.

### Frontend API Safety Fixes

Implemented frontend safety guards before wiring more real API payloads:

- `src/lib/percent.ts` centralizes percent normalization for student progress, teacher completion rates, and learning analytics charts.
- AI Quiz Generator treats `draft.questions` as API-controlled data and safely handles `null`, `undefined`, and empty arrays without crashing.
- AI Quiz Generator renders an empty draft state instead of mapping directly over a missing question list.
- Learning Analytics renders panel-level empty states for empty `score_trend`, `skill_gaps`, `activities`, and `department_stats` lists.
- `next.config.ts` now builds CSP by environment: development/test keep Next.js-compatible script allowances, while production removes `unsafe-eval` and `unsafe-inline` from `script-src`.
- Production `style-src` still allows inline styles because current chart/progress surfaces use React inline style values; full nonce/hash styling can be revisited during production hardening.

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
- Composer สำหรับถามเอกสารที่เลือกผ่าน BFF `/api/chat/query` พร้อม disabled/submitting/error states
- Copy บนหน้าจอเป็นภาษาไทย

หน้านี้ใช้ API ผ่าน server-side loader/BFF และ route guard แล้ว แต่ยังไม่มี streaming response, durable threaded persistence beyond Backend chat history, rate-limit-specific UX หรือ optional double-submit CSRF token

### AI Quiz Generator UI

AI Quiz Generator ใช้ layout แบบ workspace สำหรับสร้างแบบร่างควิซจากเอกสารและดูคำถามก่อนเผยแพร่:

- Hero สีเขียวเข้ม + gold เพื่อโยงกับ teacher workflow และแยกจาก Document/Chat
- Metric cards สำหรับจำนวนข้อ, เวลาโดยประมาณ และ source readiness
- Source panel สำหรับเลือกเอกสารที่พร้อมสร้างควิซ
- Settings panel สำหรับ source mode, question count, difficulty และ AI instructions
- Question preview พร้อมตัวเลือกและ citation แบบ plain text
- Attempt panel สำหรับ published learner-safe exam พร้อม radio options, submit state และ score feedback หลัง Backend ตอบกลับ
- ไม่ render เฉลยหรือ `correct_index` ใน DOM
- Generate และ learner submit ใช้ BFF แล้ว ส่วน publish ยัง disabled จนกว่า trainer publish UI จะพร้อม
- Layout guard กันชื่อไฟล์/คำถามภาษาไทยยาวดัน column จนซ้อน
- Copy บนหน้าจอเป็นภาษาไทย

หน้านี้ใช้ API ผ่าน server-side loader/BFF และ route guard แล้ว แต่ยังไม่มี interactive source switching, publish จริง, learner quiz discovery/list page, retake policy หรือ rate-limit-specific UX

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

Development/test CSP still includes Next.js-compatible script allowances:

- `'unsafe-inline'`
- `'unsafe-eval'`

Production `script-src` is hardened to `script-src 'self'` and removes `unsafe-inline` / `unsafe-eval`.
Production `style-src` still allows inline styles because the current chart/progress surfaces use React inline style values; full nonce/hash styling can be revisited when deployment requirements are clear.

## 9. Testing Coverage

Current test files:

```text
src/app/analytics/page.test.tsx
src/app/api/chat/_lib/chatBffHandlers.test.ts
src/app/api/documents/_lib/documentBffHandlers.test.ts
src/app/api/quiz/_lib/quizBffHandlers.test.ts
src/app/auth-routes.test.tsx
src/app/chat/page.test.tsx
src/app/documents/[fileId]/page.test.tsx
src/app/documents/page.test.tsx
src/app/page.test.tsx
src/app/protected-routes.test.tsx
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
src/features/ai-chat/aiChatApi.test.ts
src/features/ai-chat/aiChatContract.test.ts
src/features/ai-chat/aiChatHelpers.test.ts
src/features/ai-chat/aiChatMapper.test.ts
src/features/ai-chat/aiChatQueryClient.test.ts
src/features/ai-quiz-generator/AiQuizGeneratorPage.test.tsx
src/features/ai-quiz-generator/quizGeneratorApi.test.ts
src/features/ai-quiz-generator/quizGeneratorContract.test.ts
src/features/ai-quiz-generator/quizGeneratorHelpers.test.ts
src/features/ai-quiz-generator/quizGeneratorMapper.test.ts
src/features/auth/AuthShell.test.tsx
src/features/auth/authApiClient.test.ts
src/features/auth/authGuard.test.ts
src/features/auth/authRoutePolicy.test.ts
src/features/auth/LoginPage.test.tsx
src/features/auth/RegisterPage.test.tsx
src/features/auth/authValidation.test.ts
src/features/foundation/PlaceholderPage.test.tsx
src/features/foundation/placeholderContent.test.ts
src/features/learning-analytics/LearningAnalyticsPage.test.tsx
src/features/learning-analytics/learningAnalyticsApi.test.ts
src/features/learning-analytics/learningAnalyticsContract.test.ts
src/features/learning-analytics/learningAnalyticsHelpers.test.ts
src/features/learning-analytics/learningAnalyticsMapper.test.ts
src/features/document-summary/DocumentSummaryDetailPage.test.tsx
src/features/document-summary/DocumentSummaryPage.test.tsx
src/features/document-summary/DocumentUploadPanel.test.tsx
src/features/document-summary/documentSummaryContract.test.ts
src/features/document-summary/documentSummaryHelpers.test.ts
src/features/document-summary/documentUploadApiClient.test.ts
src/features/student-dashboard/StudentDashboardPage.test.tsx
src/features/student-dashboard/studentDashboardApi.test.ts
src/features/student-dashboard/studentDashboardContract.test.ts
src/features/student-dashboard/dashboardHelpers.test.ts
src/features/student-dashboard/studentDashboardMapper.test.ts
src/features/teacher-dashboard/TeacherDashboardPage.test.tsx
src/features/teacher-dashboard/teacherDashboardApi.test.ts
src/features/teacher-dashboard/teacherDashboardContract.test.ts
src/features/teacher-dashboard/teacherDashboardHelpers.test.ts
src/features/teacher-dashboard/teacherDashboardMapper.test.ts
src/lib/cn.test.ts
src/lib/percent.test.ts
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
- server-side auth guard and sanitized session bootstrap
- protected route decision policy and role redirect rules
- auth-route redirect away from login/register for authenticated users
- role-filtered app shell navigation
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
- student dashboard Backend `/api/analytics/dashboard` Zod contract
- student dashboard server-side HttpOnly cookie API loader
- student dashboard current-session view-model mapping
- student dashboard API empty/error state mapping
- teacher dashboard route and API-ready mock marker
- teacher dashboard helper formatting/sorting/status labels
- teacher dashboard action links and accessible progressbar
- teacher dashboard Backend `/api/analytics/trainer` and `/api/analytics/trainer/students` Zod contracts
- teacher dashboard server-side HttpOnly cookie API loader
- teacher dashboard session-based view-model mapping
- teacher dashboard API empty/error state mapping
- document summary route and API-ready mock marker
- document summary helper status/sorting/markdown parsing
- document summary loading/error/empty states
- document summary action links, disabled export/share, and backend endpoint hiding
- document summary Backend `/api/files/dashboard`, `/api/files/{file_id}/detail`, `/api/files/{file_id}/status`, and `/api/recap/{file_id}` Zod contracts
- document summary upload response contract for Backend `/api/files/upload`
- document summary server-side HttpOnly cookie API loader
- document summary session-based view-model mapping and cached recap fallback
- document summary API empty/error state mapping
- document summary deep-linked detail route guard, route-id normalization, exact selected document loading, and safe missing-document behavior
- document summary detail page rendering with accessible summary regions, key-topic progressbars, source preview, safe quiz/chat context links, and endpoint/token/storage hiding
- document summary related document deep links generated with encoded frontend route ids
- document upload role-gated UI, client-side file validation, processing progressbar, polling state, and route refresh behavior
- document upload same-origin browser BFF client without token storage or manual multipart `Content-Type`
- document upload Next.js BFF handler with Origin guard, HttpOnly cookie forwarding, file type/size/name validation, filename sanitization, safe response shaping, and status polling proxy
- shared backend FormData request helper behavior for multipart uploads
- AI chat route and API-ready mock marker
- AI chat helper status/sorting/citation/grounded-message behavior
- AI chat loading/error/empty states
- AI chat action links, visible document-context composer, and backend endpoint hiding
- AI chat layout overflow guard for long Thai filenames and messages
- AI chat Backend `/api/chat/query` and `/api/chat/history` Zod contracts
- AI chat server-side HttpOnly cookie API loader
- AI chat session-based view-model mapping and citation normalization
- AI chat same-origin BFF query route with Origin/CSRF guard
- AI chat `documentId` route query normalization and selected-document context loading
- AI chat browser query client validation, same-origin credentials, safe error mapping, and no token storage
- AI chat document-context message mapping with citation fallback
- Document Summary to AI Chat context links generated with encoded selected document ids
- AI quiz route and API-ready mock marker
- AI quiz helper difficulty/status/source/count/citation behavior
- AI quiz loading/error/empty states
- AI quiz disabled generate/publish actions and backend endpoint hiding
- AI quiz safe preview without answer keys and layout overflow guard
- AI quiz null/empty draft question guard for API-controlled payloads
- AI quiz Backend `/api/exams/generate`, `/api/exams/{exam_id}`, `/api/exams/{exam_id}/publish`, and `/api/exams/{exam_id}/submit` Zod contracts
- AI quiz server-side HttpOnly cookie API loader
- AI quiz session-based source/exam view-model mapping without answer-key leakage
- AI quiz same-origin BFF action routes with Origin/CSRF guard
- AI quiz `examId` route query normalization and learner published-exam deep-link access
- AI quiz browser submit client validation, same-origin credentials, safe error mapping, and no token storage
- AI quiz attempt result mapping without raw answer-key field names in the DOM
- AI quiz learner answer selection, disabled-until-complete submit state, score feedback, explanations, and citations after submission
- AI quiz role capability mapping that hides trainer-only generation controls from learner sessions
- learning analytics route and API-ready mock marker
- learning analytics helper percent/risk/sorting/trend/metric behavior
- learning analytics loading/error/empty states
- learning analytics panel-level empty states for partial empty API lists
- learning analytics accessible score chart, skill progressbar, activity table, and backend endpoint hiding
- learning analytics layout overflow guard for long Thai content
- learning analytics Backend `/api/analytics/dashboard`, `/api/analytics/trainer`, `/api/analytics/trainer/students`, `/api/analytics/usage`, and `/api/analytics/audit-logs` Zod contracts
- learning analytics server-side HttpOnly cookie API loader
- learning analytics role-aware endpoint selection for student, teacher, tenant admin, and global admin sessions
- learning analytics session-based view-model mapping without token/IP/`user_id` leakage
- learning analytics API empty/error state mapping
- shared percent normalization helper behavior
- production CSP script-src hardening while keeping dev/test compatibility

Current latest verification:

- `npm test`: 73 test files, 295 tests
- `npm run lint`: passing
- `npm run build`: passing
- `npm audit --audit-level=high`: 0 vulnerabilities

## 10. Known Deferred Work

The following items should wait until Backend/API integration branches:

- OAuth callback handling
- Teacher dashboard real API integration and loading/error/empty states
- Document Summary delete/download BFF routes with CSRF/origin checks, POST recap generation, and export/share implementation
- AI Chat streaming response UI, richer retry UX, rate-limit UX, and optional double-submit CSRF token
- AI Quiz visible update/publish UI interactions, learner quiz discovery/list page, retake policy, and rate-limit UX
- Learning Analytics real-time event stream mapping, richer admin audit UI, and Backend-backed E2E verification
- Backend validation error mapping
- Playwright E2E for real auth flow
- Logout behavior
- Real social login providers
- Optional double-submit CSRF token if the team requires more than Origin guard
- Full nonce/hash CSP hardening for inline chart/progress styles

The following items can be done before Backend if needed:

- `.env.example` once required public environment variables are known
- Better image generation/asset pipeline
- shadcn/Radix component expansion for forms and dialogs

## 11. Commit Scope Recommendation

For the current SaveQuizAttemptAndScore commit, include:

```text
frontend/SRS.md
frontend/src/app/quiz/page.test.tsx
frontend/src/app/quiz/page.tsx
frontend/src/features/ai-quiz-generator/AiQuizGeneratorPage.test.tsx
frontend/src/features/ai-quiz-generator/AiQuizGeneratorPage.tsx
frontend/src/features/ai-quiz-generator/quizAttemptClient.test.ts
frontend/src/features/ai-quiz-generator/quizAttemptClient.ts
frontend/src/features/ai-quiz-generator/quizGeneratorContract.test.ts
frontend/src/features/ai-quiz-generator/quizGeneratorMapper.test.ts
frontend/src/features/ai-quiz-generator/quizGeneratorMapper.ts
frontend/src/features/ai-quiz-generator/quizGeneratorTestData.ts
frontend/src/features/ai-quiz-generator/types.ts
frontend/src/features/auth/authRoutePolicy.test.ts
frontend/src/features/auth/authRoutePolicy.ts
```

This feature enables learner-safe published quiz attempts through `/quiz?examId={examId}`, submits answers through the existing HttpOnly cookie + same-origin BFF boundary, maps score feedback into safe UI copy, and keeps raw answer-key fields out of the DOM before and after submit.

Do not include unrelated local/backend files in this commit unless intentionally requested:

```text
AGENTS_FRONTEND.md
DESIGN.md
frontend/next-env.d.ts
backend/docker-compose.yml
```
