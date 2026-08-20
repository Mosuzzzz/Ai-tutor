# AI Tutor Frontend Redesign Plan

สถานะเอกสาร: **Frontend UX/UI Redesign Roadmap — Source of Truth**

อัปเดต: 2026-08-20

ขอบเขตหลัก: `frontend/`

เอกสารนี้ **แทน DESIGN.md / Frontend roadmap เดิมสำหรับงาน UX/UI รอบใหม่ทั้งหมด**

เป้าหมายของรอบนี้คือออกแบบประสบการณ์ AI Tutor ใหม่ทั้งระบบให้มี visual language เดียวกัน ชัดเจน ใช้ง่าย มี motion ที่ช่วยอธิบาย product และพร้อมต่อยอดกับ Backend ที่ทีมดูแลอยู่

---

# 1. Product Direction

AI Tutor คือ **Personal AI Study Workspace** สำหรับผู้ใช้หนึ่งคน

Core journey:

```text
Discover AI Tutor
  -> Register / Login
  -> Personal Dashboard
  -> Upload Document
  -> Read AI Summary
  -> Chat With Selected Document
  -> Generate Review Quiz
  -> Submit Quiz
  -> Review Learning Progress
```

Product statement:

> เปลี่ยนเอกสารและโน้ตของเราให้กลายเป็นผู้ช่วยติวส่วนตัวที่สรุป ถามตอบ และสร้างควิซให้ได้ในที่เดียว

งาน redesign รอบนี้ต้องทำให้ผู้ใช้เข้าใจ journey นี้ได้ตั้งแต่หน้า Home โดยไม่ต้องอ่านคำอธิบายยาว

---

# 2. Redesign Goals

## 2.1 Visual Goal

AI Tutor ต้องให้ความรู้สึก:

- Clean
- Calm
- Smart
- Modern
- Student-friendly
- Premium but accessible
- Content-first
- Motion-enhanced, not motion-heavy

หน้าเว็บต้องมีพื้นที่หายใจ อ่านง่าย และไม่ใช้ card / border / effect มากเกินจำเป็น

## 2.2 UX Goal

ผู้ใช้ใหม่ต้องเข้าใจภายในไม่กี่วินาทีว่า AI Tutor ทำอะไรได้:

```text
Upload
  -> AI understands the material
  -> Summary
  -> Ask AI
  -> Quiz
  -> Review progress
```

ทุกหน้าหลัง Login ต้องตอบคำถามได้ชัดเจนว่า:

1. ตอนนี้ฉันอยู่ที่ไหน
2. ฉันกำลังทำอะไร
3. ฉันควรทำอะไรต่อ
4. สิ่งที่ AI แสดงมาจากข้อมูลจริงหรือยัง
5. ถ้าเกิด error ฉันแก้หรือไปต่ออย่างไร

---

# 3. Design Reference Direction

ภาพ reference ที่ใช้ในรอบนี้เป็น **direction reference เท่านั้น ไม่ใช่ template สำหรับ copy**

สิ่งที่นำมาใช้เป็นแนวทาง:

- Editorial spacing
- Large readable typography
- Off-white / neutral canvas
- Strong green accent
- Product-demo cards
- Clear storytelling sections
- Simple premium shadows
- Rounded surfaces แบบพอดี
- Motion ที่ช่วยเล่า workflow
- CTA ชัดและใช้ซ้ำอย่างมีระบบ

สิ่งที่ต้องสร้างให้แตกต่าง:

- Brand composition
- Hero copy
- Hero visual
- Product demo sequence
- Card composition
- Section order
- Illustration / motion language
- Testimonials / social proof treatment
- Pricing presentation
- FAQ arrangement
- Dashboard and authenticated product UI

ห้าม copy reference แบบ pixel-for-pixel

---

# 4. Home Page Creative Direction

หน้า Home เป็นหน้าแรกที่ต้องกำหนด visual language ของ redesign ทั้งหมด

## 4.1 Hero Goal

Hero ต้องสื่อสารภายใน viewport แรกว่า:

> AI Tutor เปลี่ยนเอกสารของผู้ใช้ให้กลายเป็นชุดเครื่องมือสำหรับอ่าน สรุป ถาม และทบทวน

โครงสร้างหลัก:

```text
Left:
  Eyebrow / value signal
  Large headline
  Supporting copy
  Primary CTA
  Secondary CTA / login
  Lightweight trust signal

Right:
  Animated AI Study Scene
```

## 4.2 Hero Animated AI Study Scene

พื้นที่ด้านขวาของ Hero ห้ามปล่อยโล่ง

ให้ใช้ motion scene ที่จำลอง workflow จริงแบบวนสั้น ๆ:

```text
Paper / Notes arrive
  -> important lines highlight
  -> AI summary card appears
  -> student asks a question
  -> AI answer appears
  -> quiz question appears
  -> answer is selected
  -> progress/result indicator appears
  -> scene resets naturally
```

องค์ประกอบที่ใช้ได้:

- Paper / exam sheet
- Note highlights
- Small document chips
- AI chat bubbles
- Quiz card
- Check marks
- Progress indicator
- Citation/source chip
- Cursor / typing indicator แบบ subtle

Motion ต้อง:

- อ่านเรื่องราวออก
- ไม่เร็วเกินไป
- ไม่แข่งกับ headline
- ไม่มี 3D / WebGL
- ไม่ใช้ particle effect ที่ไม่ช่วย UX
- รองรับ `prefers-reduced-motion`
- ลด complexity บน mobile

## 4.3 Home Storytelling Sections

ลำดับเริ่มต้น:

```text
01 Hero
02 Product Promise / What AI Tutor Does
03 One Upload Becomes a Study Kit
04 Interactive Product Walkthrough
05 Ask in Your Language
06 Quiz / Review Experience
07 Learning Progress
08 Why Students Use It / Social Proof
09 Pricing / Free Plan Positioning
10 FAQ
11 Final CTA
12 Footer
```

ลำดับนี้ปรับได้ใน implementation plan หาก Codex พบข้อจำกัดจาก content หรือ component เดิม แต่ต้องอธิบายเหตุผลก่อนแก้

---

# 5. Marketing UI vs Product UI

ต้องแยก mental model ชัดเจน

## Marketing UI

Routes เช่น:

```text
/home
/login
/register
```

หน้าที่:

- Explain
- Build trust
- Convert
- Demonstrate product
- Encourage sign-up

Motion ใช้ได้มากกว่า product workspace

## Product Workspace

Routes เช่น:

```text
/dashboard
/documents
/documents/[fileId]
/chat
/quiz
/analytics
/settings
```

หน้าที่:

- Complete tasks quickly
- Keep context visible
- Reduce cognitive load
- Show honest system states
- Make next action obvious

Motion ต้องเบากว่า Home และเน้น interaction feedback

---

# 6. Architecture Rules That Must Stay

แม้ redesign UI ใหม่ ห้ามทำลาย architecture ที่ใช้งานอยู่

## 6.1 Frontend Stack

ให้ยึด stack ปัจจุบัน:

- Next.js App Router
- React
- TypeScript strict mode
- Tailwind CSS
- Zod runtime validation
- Vitest
- Testing Library
- Lucide React

ห้ามเปลี่ยน framework หรือ state-management architecture โดยไม่มีเหตุผลที่พิสูจน์ได้

## 6.2 API Boundary

Read-only:

```text
Server Component
  -> HttpOnly access-token cookie
  -> frontend API layer
  -> FastAPI
  -> Zod
  -> mapper
  -> ViewModel
  -> UI
```

Mutation:

```text
Client Component
  -> same-origin /api/* BFF
  -> Origin / CSRF guard
  -> server reads HttpOnly cookie
  -> FastAPI
  -> Zod
  -> safe browser response
```

ห้าม:

- ย้าย token ไป `localStorage`
- ย้าย token ไป `sessionStorage`
- ให้ browser ถือ bearer token
- เรียก Backend โดยตรงเพื่อเลี่ยง BFF
- แสดง raw Backend error ต่อผู้ใช้
- สร้าง fake AI success เพื่อให้ UI ดูสมบูรณ์

## 6.3 Backend Ownership

Frontend redesign สามารถ:

- ปรับ UI
- ปรับ UX
- ปรับ frontend contracts เมื่อ Backend contract ยืนยันแล้ว
- ปรับ mapper
- ปรับ BFF ที่เป็น frontend responsibility
- เพิ่ม loading / error / empty / success states
- เพิ่ม test

Frontend redesign ห้ามแก้ Backend implementation เพื่อให้ UI ทำงานง่ายขึ้น

ถ้าต้องการ Backend เพิ่ม ให้ทำ Backend Handoff

---

# 7. Visual System Direction

Branch แรกต้องกำหนด token และ primitive ก่อนกระจายไปทุกหน้า

## 7.1 Color

Direction:

- Warm / soft neutral background
- White or near-white content surfaces
- Green primary accent
- Dark neutral text
- Muted secondary text
- Semantic success / warning / error
- Optional secondary cool accent สำหรับ data visualization

ห้ามใช้สี accent หลายชุดจนเสีย identity

## 7.2 Typography

ต้องมี hierarchy ชัด:

```text
Display
H1
H2
H3
Body Large
Body
Small
Label
Caption
```

Marketing heading ใช้ character และ scale ได้มากกว่า product workspace

Product UI ต้องให้ readability มาก่อน visual impact

## 7.3 Surfaces

ใช้:

- subtle border
- restrained shadow
- medium radius
- clear grouping

หลีกเลี่ยง:

- ทุกอย่างเป็น card
- shadow หนาหลายชั้น
- glassmorphism แบบอ่านยาก
- gradient มากเกินไป
- border ทุกองค์ประกอบ

## 7.4 Icons

ใช้ Lucide เป็นหลัก

Icon ต้องช่วยสื่อ meaning ไม่ใช่ decoration

## 7.5 Motion

Preferred strategy:

```text
Home:
  GSAP or equivalent timeline-based motion
  CSS transitions
  scroll reveal / lightweight parallax

Product:
  CSS transitions
  small React interaction motion only where needed
```

หากจะเพิ่ม dependency เช่น GSAP / `@gsap/react` ต้องระบุใน implementation plan ก่อนติดตั้ง

ห้ามใช้ WebGL / Three.js สำหรับ redesign นี้

---

# 8. Responsive Strategy

Target viewports อย่างน้อย:

```text
375px
768px
1024px
1280px+
```

Mobile ไม่ใช่ desktop ที่ย่อขนาด

ต้อง redesign behavior เช่น:

- navigation
- product demo
- hero motion
- document panels
- chat composer
- quiz choices
- analytics charts

Hero animation บน mobile สามารถ simplify หรือกลายเป็น sequence แบบ stacked ได้

---

# 9. Accessibility Rules

ทุก branch ต้องรักษา:

- Keyboard navigation
- Visible focus
- Accessible names
- Form labels
- Correct heading order
- Semantic buttons/links
- Dialog focus management
- Live status สำหรับ processing / success / error
- Sufficient contrast
- `prefers-reduced-motion`
- Long Thai and English text wrapping
- No horizontal overflow

Motion ห้ามเป็น requirement ในการเข้าใจข้อมูลสำคัญ

---

# 10. Testing and Verification Rules

ก่อนเริ่ม redesign branch แรก ให้สร้าง baseline ปัจจุบัน

จาก `frontend/`:

```bash
npm ci
npm run test
npm run lint
npm run build
npm audit --audit-level=high
```

ก่อน merge ทุก branch:

```bash
npm run test
npm run lint
npm run build
git diff --check
git status --short
```

ถ้า `npm audit` มี high-severity issue ใหม่จาก dependency ที่ branch เพิ่ม ต้องแก้หรือบันทึก blocker ก่อน merge

ห้ามแก้ tests เพียงเพื่อให้ผ่านโดยลด assertion ของ behavior ที่ยังควรทำงาน

---

# 11. New Branch Roadmap

Roadmap รอบใหม่นี้เริ่มใหม่จากศูนย์สำหรับ Frontend Redesign

```text
R00 Verification Baseline
  -> R00.1 Frontend Roadmap Source-of-Truth Cleanup
  -> R00.2 Frontend Dependency Security Remediation
  -> R01 Design Foundation + Home Direction
  -> R02 Home Landing Redesign
  -> R03 Auth Experience Redesign
  -> R04 App Shell Redesign
  -> R05 Dashboard Redesign
  -> R06 Documents Workspace Redesign
  -> R07 Chat Workspace Redesign
  -> R08 Quiz & Review Redesign
  -> R09 Analytics Redesign
  -> R10 Settings + Supporting Routes
  -> R11 Responsive + Motion + Accessibility Polish
  -> R12 Frontend Integration Release Gate
```

---

# R00 — Frontend Redesign Baseline

Branch:

```text
chore/00-frontend-redesign-baseline
```

Priority: P0

## Goal

ยืนยันว่า `main` ปัจจุบันอยู่ในสถานะใดก่อน redesign เพื่อไม่เอา pre-existing failure มาปนกับ regression

## Tasks

- `npm ci`
- run test/lint/build/audit
- บันทึก baseline failures
- แยก environment failure กับ code failure
- ตรวจ route ปัจจุบัน
- ตรวจ current responsive state
- ตรวจ existing reusable UI primitives
- ตรวจ current motion dependencies
- ตรวจ fonts/assets ที่มีอยู่
- ไม่ redesign หน้าใดใน branch นี้

## Acceptance

- มี baseline ที่ทำซ้ำได้
- รู้ว่า test ไหน fail ก่อน redesign
- ไม่มี behavior change
- ไม่มี dependency ใหม่ที่ไม่จำเป็น

---

# R00.1 — Frontend Roadmap Source-of-Truth Cleanup

Branch:

```text
chore/00-1-frontend-roadmap-source-of-truth
```

Depends on: R00

Priority: P0

## Goal

ทำให้ `DESIGN.md` เป็น roadmap frontend redesign ฉบับเดียว และทำให้ `FRONTEND.md` เป็นเอกสาร architecture/development reference ที่ตรงกับ implementation ปัจจุบัน

## Constraints

- เป็น documentation-only branch
- คง `docs/frontend-redesign-baseline.md` เป็น historical baseline
- ไม่แก้ Backend, application source, package dependency หรือ lockfile
- ไม่แก้ dependency vulnerabilities ใน branch นี้

## Acceptance

- ไม่มี roadmap frontend redesign ที่แข่งขันกับ `DESIGN.md`
- `FRONTEND.md` ระบุ stack, commands และ test tooling ตาม repository จริง
- `frontend/SRS.md` defer roadmap sequencing ไปที่ `DESIGN.md`
- `git diff --check` ผ่าน

---

# R00.2 — Frontend Dependency Security Remediation

Branch:

```text
fix/00-2-frontend-dependency-security
```

Depends on: R00.1

Priority: P0

## Goal

แก้ dependency vulnerabilities ที่ baseline พบ โดยแยกจาก redesign และตรวจผลกระทบของ dependency/lockfile อย่างชัดเจน

## Known baseline

- `npm audit --audit-level=high` รายงาน 6 high และ 7 moderate vulnerabilities
- ห้ามใช้ automatic or forced audit fix โดยไม่ review dependency impact

## Acceptance

- dependency remediation มี owner และ review แยกจาก UX/UI redesign
- `npm ci`, test, lint, build และ audit result ถูกบันทึก
- ไม่มี product behavior change ที่ไม่เกี่ยวกับ dependency remediation

---

# R01 — Design Foundation + Home Direction

Branch:

```text
feat/01-design-foundation
```

Depends on: R00.2

Readiness gate: R00, R00.1, and R00.2 must all be complete before R01 begins.

Priority: P0

## Goal

สร้าง visual foundation ของ AI Tutor redesign และ prototype direction ที่ Home จะใช้

## Tasks

### Design tokens

กำหนด:

- color palette
- text colors
- border colors
- semantic colors
- typography scale
- spacing
- radius
- shadows
- container widths
- responsive breakpoints usage
- animation durations/easing

### Shared primitives

Review / redesign เฉพาะ primitive ที่จำเป็น:

- Button
- Link treatment
- Input
- Textarea
- Select
- Badge
- Card / Surface
- Section container
- Empty state shell
- Loading skeleton
- Status chip
- Icon button
- Dialog fundamentals

### Motion foundation

กำหนด:

- reveal rules
- hover rules
- reduced-motion behavior
- hero animation architecture
- cleanup strategy
- client/server boundaries

### Home visual prototype

ทำ prototype section เล็กพอให้ review direction ได้ เช่น:

- hero typography
- CTA style
- one representative product card
- background/surface treatment

ห้ามทำ Home เต็มหน้าก่อน foundation ได้รับการ review

## Acceptance

- UI primitive ใหม่มี system เดียวกัน
- ไม่มี breaking API changes แบบไม่จำเป็นต่อ shared components
- Home prototype แสดง visual direction ได้ชัด
- responsive foundation ใช้งานได้
- reduced motion strategy ถูกกำหนด
- tests/lint/build ผ่าน

---

# R02 — Home Landing Redesign

Branch:

```text
feat/02-home-landing-redesign
```

Depends on: R01

Priority: P0

## Goal

สร้างหน้า Home ใหม่ทั้งหมดให้เป็นหน้าที่อธิบาย AI Tutor ได้ครบ สวย อ่านง่าย และมี motion storytelling

## Primary Route

```text
/home
```

และตรวจ root redirect policy ให้ชัดเจน:

```text
/ -> /home
```

หาก implementation ปัจจุบันต่างจากนี้ ให้รายงานก่อนเปลี่ยน route behavior

## Sections

อย่างน้อย:

1. Hero
2. Product promise
3. One upload becomes a study kit
4. Product walkthrough
5. Language / subject flexibility
6. Quiz and review experience
7. Progress / analytics preview
8. Social proof
9. Pricing / free positioning
10. FAQ
11. Final CTA
12. Footer

## Hero Motion

สร้าง animated AI study scene ตาม concept:

```text
Document
 -> Highlight
 -> Summary
 -> Chat
 -> Quiz
 -> Result
```

Motion ต้อง:

- loop ได้อย่างเนียน
- pause / simplify ตาม reduced-motion
- ไม่ block interaction
- ไม่ทำ performance แย่
- ไม่ shift layout
- ไม่ใช้ WebGL

## Content Rules

- copy ใหม่ต้องไม่ copy reference
- หน้า Home ต้องบอก core journey ได้ครบ
- ห้าม claim capability ที่ Backend/Product ยังไม่มี
- ไม่ใช้ fake live statistic ถ้าไม่มี source จริง
- testimonial / rating ถ้าไม่มีข้อมูลจริง ต้องใช้ placeholder content ที่ระบุว่าเป็น content fixture หรือเอา section ออกจนกว่าจะมีข้อมูลจริง

## Acceptance

- เข้า Home แล้วเข้าใจ product ได้โดยไม่ต้อง login
- Hero สื่อ upload -> AI study workflow
- CTA ไป Register/Login ถูกต้อง
- Motion ไม่มี layout shift รุนแรง
- mobile hero ไม่ overflow
- reduced-motion ใช้งานได้
- Lighthouse/performance regression ที่ชัดเจนต้องถูกอธิบาย
- tests/lint/build ผ่าน

---

# R03 — Auth Experience Redesign

Branch:

```text
feat/03-auth-experience-redesign
```

Depends on: R02

Priority: P1

## Routes

```text
/login
/register
```

## Goal

ให้ transition จาก Home -> Auth ต่อเนื่องทาง visual และ UX

## Tasks

- redesign login
- redesign register
- loading state
- validation state
- safe auth errors
- password visibility UX
- social login treatment เฉพาะของที่ contract รองรับจริง
- return/back-to-home behavior
- mobile optimization
- session redirect QA

## Acceptance

- visual language ต่อจาก Home
- auth error ไม่แสดง raw backend detail
- keyboard / screen reader ใช้งานได้
- no role confusion
- login/register flow ไม่เปลี่ยน security architecture

---

# R04 — App Shell Redesign

Branch:

```text
feat/04-app-shell-redesign
```

Depends on: R03

Priority: P0

## Goal

สร้าง authenticated workspace shell ใหม่ก่อน redesign feature pages

## Scope

- sidebar
- top navigation
- mobile navigation
- page header
- content container
- navigation active state
- user menu
- logout entry
- common layout states

Core navigation:

```text
Dashboard
Documents
Chat
Quiz
Analytics
Settings
```

Courses ไม่ควรกลับมาเป็น core navigation จนกว่าจะมี product spec ชัด

## UX Principles

- ใช้พื้นที่น้อย
- รู้ route ปัจจุบันชัด
- ไม่รบกวน content
- desktop และ mobile ไม่ใช้ navigation แบบเดียวกันโดยฝืน layout
- CTA หลักของแต่ละหน้าอยู่ใน content ไม่ยัดทุกอย่างไว้ sidebar

## Acceptance

- ทุก protected route ใช้ shell เดียวกัน
- active state ถูกต้อง
- mobile navigation keyboard accessible
- logout/session behavior ยังถูกต้อง
- ไม่มี duplicate navigation mental model

---

# R05 — Dashboard Redesign

Branch:

```text
feat/05-dashboard-redesign
```

Depends on: R04

Priority: P0

## Primary Route

```text
/dashboard
```

## Goal

ทำ Dashboard ให้เป็นหน้า “What should I study next?” ไม่ใช่หน้ารวม card อย่างเดียว

## Proposed Structure

```text
Welcome / Study focus
Quick actions
Recent documents
Continue studying
Recent quiz performance
Learning progress snapshot
Suggested next action
```

## UX Rules

- data จริงเท่านั้น
- ถ้าไม่มี data ให้ empty state สอน user ว่าควรเริ่มอย่างไร
- metric ที่ Backend ไม่มีห้ามสร้างขึ้นเพื่อความสวย
- Dashboard ต้องพา user เข้า Documents / Chat / Quiz ได้ง่าย

## Acceptance

- new user มี clear onboarding path
- returning user เห็นงานล่าสุดและ next action
- no mock analytics
- mobile layout ไม่กลายเป็น card stack ยาวโดยไม่มี hierarchy

---

# R06 — Documents Workspace Redesign

Branch:

```text
feat/06-documents-workspace-redesign
```

Depends on: R05

Priority: P0

## Routes

```text
/documents
/documents/[fileId]
```

## Goal

ทำ document workflow ให้รู้สถานะชัดและเชื่อมต่อไป Summary / Chat / Quiz อย่างเป็นธรรมชาติ

## Library Tasks

- upload zone
- recent/all documents layout
- document status
- processing feedback
- empty state
- error state
- delete confirmation
- responsive document list/cards

## Detail Tasks

- document identity
- processing state
- summary reading experience
- citations/source context
- clear action to Chat
- clear action to Quiz
- delete / destructive action placement

## Status UX

ต้องแยกชัด:

```text
Uploading
Pending
Processing
Ready
Failed
```

ห้ามทำ processing ให้ดูเหมือน summary พร้อมแล้ว

## Acceptance

- status อ่านออกทันที
- long filename ไม่พัง layout
- upload/delete ยังผ่าน BFF/CSRF
- user รู้ว่าทำอะไรต่อหลัง document ready
- error state มี recovery action

---

# R07 — Chat Workspace Redesign

Branch:

```text
feat/07-chat-workspace-redesign
```

Depends on: R06

Priority: P0

## Route

```text
/chat
```

## Goal

ทำ Chat เป็น core AI experience ที่รู้ context ชัด ไม่เหมือน generic chatbot

## Layout Direction

Desktop:

```text
Document context / selector
        |
Chat thread
        |
Composer
        |
Citation/source context
```

อาจใช้ side panel หากช่วยให้ context ชัดโดยไม่ทำให้หน้ารก

## Tasks

- selected document state
- ready-document selector
- message thread
- AI/user visual distinction
- composer
- send/loading state
- suggested prompts
- no-context state
- citations
- long answer formatting
- empty/error/retry states
- history behavior

## UX Rules

ผู้ใช้ต้องรู้เสมอว่า:

> AI กำลังตอบจากเอกสารไหน

ห้าม UI ทำให้ผู้ใช้คิดว่า AI มี source หาก Backend ไม่ส่ง citation

## Acceptance

- non-ready document ส่งไม่ได้
- selected document visible
- citation ไม่ overflow
- optimistic UI ไม่ทำ history หาย
- keyboard composer ใช้งานดี
- mobile composer ไม่บัง content
- no-context honest

---

# R08 — Quiz & Review Redesign

Branch:

```text
feat/08-quiz-review-redesign
```

Depends on: R07

Priority: P0

## Route

```text
/quiz
```

## Goal

ทำ quiz flow ให้เป็น personal review loop ที่เร็ว สนุก และอ่านง่าย

## Flow

```text
Choose document
 -> Configure quiz
 -> Generate
 -> Answer
 -> Submit
 -> Score
 -> Review explanation/citation
 -> Study again
```

## Tasks

- source selector
- quiz configuration
- generating state
- question navigation
- answer controls
- progress indicator
- submit state
- score/result
- answer review
- explanation
- citation
- retry / return to document / chat CTA

## Security / Contract Rule

ก่อน submit:

- ห้ามมี answer key ใน DOM
- ห้ามมี correct answer data ใน client ViewModel หาก Backend ไม่ควรส่ง

หลัง submit:

- แสดง answer review จาก Backend response จริง

## Acceptance

- ไม่มี publish mental model
- flow จบใน personal study journey
- user รู้ progress
- mobile choices กดง่าย
- result มี next action
- no answer leakage

---

# R09 — Analytics Redesign

Branch:

```text
feat/09-personal-analytics-redesign
```

Depends on: R08

Priority: P1

## Route

```text
/analytics
```

## Goal

เปลี่ยน analytics เป็น “progress I can act on” ไม่ใช่ collection ของ charts

## Data ที่ใช้ได้เมื่อ Backend รองรับ

- completed quizzes
- average score
- streak days
- ready/read documents
- recent scores
- score trend
- recent activity
- document/topic breakdown

## Proposed Structure

```text
Progress summary
Recent trend
What improved
What needs review
Recent quiz history
Study activity
Next action
```

## UX Rules

- ถ้า data น้อย ให้ onboarding analytics state
- chart ไม่ต้องมีทุก section
- text insight สำคัญกว่ากราฟที่ไม่ช่วยตัดสินใจ
- no tenant/trainer/classroom analytics ใน core page

## Acceptance

- ทุก metric trace ไป Backend field ได้
- no fake graph
- chart accessible
- mobile readable
- next study action ชัด

---

# R10 — Settings + Supporting Routes

Branch:

```text
feat/10-settings-supporting-routes
```

Depends on: R09

Priority: P2

## Routes

```text
/settings
/courses   # policy decision required
```

## Settings Goal

สร้าง Settings เฉพาะ capability ที่ product มีจริง

Possible sections:

- profile
- account
- language
- appearance
- session/account actions

ห้ามสร้าง switch/button ที่ดูเหมือน save ได้แต่ไม่มี Backend/storage รองรับ

## Courses Decision

ใน branch นี้ต้องตัดสินใจ:

```text
A. Keep as hidden future route
B. Remove from current product
C. Define as real feature in separate future roadmap
```

ห้ามใช้ `/courses` เป็น core CTA หากยังเป็น placeholder

## Acceptance

- no fake settings save
- supporting routes consistent กับ app shell
- future features ถูกระบุชัดว่า future

---

# R11 — Responsive, Motion, Accessibility & Visual Polish

Branch:

```text
fix/11-responsive-motion-a11y-polish
```

Depends on: R02-R10

Priority: P0 Release Gate

## Goal

ตรวจทั้งระบบหลัง visual structure นิ่งแล้ว

## Route Matrix

```text
/home
/login
/register
/dashboard
/documents
/documents/[fileId]
/chat
/quiz
/analytics
/settings
```

## Tasks

### Responsive

ตรวจอย่างน้อย:

```text
375
768
1024
1280+
```

### Motion

- timeline cleanup
- no duplicate GSAP contexts/listeners
- no animation on hidden mobile elements
- reduced motion
- no unnecessary continuous animation
- no layout-jank from scroll reveal

### Accessibility

- focus order
- focus visible
- labels
- heading order
- dialog focus
- keyboard navigation
- live regions
- contrast
- long text
- citation wrapping
- form errors

### Visual polish

- spacing consistency
- radius consistency
- shadow consistency
- button hierarchy
- empty states
- loading states
- icon alignment
- copy consistency

## Acceptance

- no horizontal overflow
- no major visual inconsistency
- motion is optional
- mobile core journey complete
- keyboard core journey complete
- tests/lint/build pass

---

# R12 — Frontend Integration Release Gate

Branch:

```text
test/12-frontend-redesign-release-gate
```

Depends on: R00-R11

Priority: P0

## Goal

ยืนยันว่า redesign ไม่ได้ทำลาย core product behavior

## Main Journey

```text
1. Open Home
2. Understand product and CTA
3. Register / Login
4. Open Dashboard
5. Upload Document
6. Wait until Ready
7. Read Summary
8. Ask question in Chat
9. Open citation
10. Generate Quiz
11. Answer and Submit
12. Review score/explanation
13. Open Analytics
14. Logout
```

## Negative Journey

- invalid upload
- unsupported file
- processing failure
- network timeout
- expired session
- unauthorized document
- Backend response failing Zod
- no-context chat
- quiz generate failure
- quiz submit failure
- no analytics data
- reduced-motion enabled
- mobile viewport

## Acceptance

- redesigned flow works end-to-end
- no frontend console error left unexplained
- safe failure states
- no secret/token in DOM/storage
- test/lint/build/audit gate documented
- Backend blockers handed off, not patched by hidden frontend mock

---

# 12. Recommended Branch Sequence

ใช้ branch ตามลำดับ:

```text
chore/00-frontend-redesign-baseline
chore/00-1-frontend-roadmap-source-of-truth
fix/00-2-frontend-dependency-security
feat/01-design-foundation
feat/02-home-landing-redesign
feat/03-auth-experience-redesign
feat/04-app-shell-redesign
feat/05-dashboard-redesign
feat/06-documents-workspace-redesign
feat/07-chat-workspace-redesign
feat/08-quiz-review-redesign
feat/09-personal-analytics-redesign
feat/10-settings-supporting-routes
fix/11-responsive-motion-a11y-polish
test/12-frontend-redesign-release-gate
```

Branch rule:

- เริ่มจาก `main` ล่าสุดหรือ branch ก่อนหน้าตาม dependency
- หนึ่ง branch มี objective เดียว
- ไม่แก้ Backend implementation
- ไม่ redesign หน้าที่อยู่นอก scope แบบ opportunistic
- ถ้าพบ shared issue ให้จดไว้สำหรับ branch ที่เหมาะสม
- behavior change ต้องมี test
- อย่า commit `.env`, `.next`, `node_modules`, secret หรือ generated local data
- ห้าม merge หาก build พังเพราะ branch โดยไม่มี blocker report

---

# 13. Milestones

## Milestone A — New Visual Identity

เสร็จเมื่อ:

```text
R00
R00.1
R00.2
R01
R02
R03
```

ผลลัพธ์:

- baseline ชัด
- roadmap และ development reference มี source of truth ชัด
- dependency security baseline ได้รับ remediation แยก branch
- design system ใหม่
- Home ใหม่
- Auth ใหม่
- public journey พร้อม

## Milestone B — Core Workspace Redesign

เสร็จเมื่อ:

```text
R04
R05
R06
R07
R08
```

ผลลัพธ์:

- app shell ใหม่
- dashboard
- documents
- chat
- quiz
- core study journey มี visual/UX เดียวกัน

## Milestone C — Complete Product Redesign

เสร็จเมื่อ:

```text
R09
R10
R11
```

ผลลัพธ์:

- analytics
- settings/supporting routes
- responsive
- accessibility
- motion polish

## Milestone D — Release Candidate

เสร็จเมื่อ:

```text
R12
```

ผลลัพธ์:

- redesigned frontend ผ่าน integration gate
- core journey พร้อม review/production candidate
- known Backend blockers มี owner ชัดเจน

---

# 14. Out of Scope for This Redesign

ยังไม่รวม:

- Teacher dashboard
- Classroom management
- Student roster
- Quiz publishing/assignment
- Course marketplace
- Community/social feed
- Full admin console redesign
- PDF export
- Native mobile app
- WebGL / 3D experience
- Major Backend architecture rewrite
- New state management library โดยไม่มี requirement
- AI capability ใหม่ที่ Backend ยังไม่มี

หากต้องการสิ่งเหล่านี้ ต้องสร้าง product specification และ roadmap ใหม่แยกจาก redesign นี้

---

# 15. Backend Handoff Format

หาก Frontend ต้องการ Backend เพิ่ม ให้บันทึก:

```text
Area:
Endpoint:
Method:
Current request:
Current response:
Expected contract:
User impact:
Frontend safe fallback:
Reproduction:
Priority:
```

ห้ามใส่:

- token
- password
- secret
- private file content
- storage credential

---

# 16. Definition of Done — Every Redesign Branch

Branch ถือว่าเสร็จเมื่อ:

- scope ตรงตาม branch
- visual direction ตรง design system
- responsive ตาม viewport หลัก
- keyboard ใช้งานได้
- focus state ชัด
- loading/empty/error/success ครบตาม flow
- long Thai/English text ไม่ overflow
- API data ผ่าน Zod ตาม architecture เดิม
- mutation ยังผ่าน BFF / CSRF guard
- no fake AI success
- no secret/token leakage
- tests ผ่าน
- lint ผ่าน
- build ผ่าน
- `git diff --check` ผ่าน
- มี screenshot/browser QA สำหรับหน้าที่ redesign
- ไม่มี unrelated refactor ขนาดใหญ่

---

# 17. Codex Workflow for Every Branch

ทุก branch ให้ใช้ workflow เดียวกัน:

```text
1. Checkout/Create branch
2. Read DESIGN.md
3. Inspect current implementation
4. Inspect related tests
5. Inspect reusable components
6. Run relevant baseline tests
7. Produce implementation plan
8. STOP and wait for user review
9. Implement only after approval
10. Run tests/lint/build
11. Browser QA
12. Summarize changed files, tradeoffs and blockers
```

Codex ห้ามเริ่มแก้ code ทันทีถ้ายังไม่ได้รับ approval จาก implementation plan

---

# 18. Immediate Next Action

เริ่มที่:

```text
R00 — Frontend Redesign Baseline
  -> R00.1 — Frontend Roadmap Source-of-Truth Cleanup
  -> R00.2 — Frontend Dependency Security Remediation
```

จากนั้น:

```text
R01 — Design Foundation + Home Direction
```

Readiness gate สำหรับ R01: ต้องปิด R00, R00.1 และ R00.2 ก่อนเริ่มงาน visual foundation

และ branch visual ตัวแรกที่ผู้ใช้จะเห็นเต็มรูปแบบคือ:

```text
R02 — Home Landing Redesign
```

Home จะเป็น source of visual language สำหรับ Auth และ authenticated workspace ทั้งหมด

ดังนั้นห้ามกระโดดไป redesign Dashboard / Chat / Quiz ก่อน Home direction และ design foundation ถูก review แล้ว
