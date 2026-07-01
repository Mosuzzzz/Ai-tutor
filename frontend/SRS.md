# AI Tutor Frontend SRS

เอกสารนี้เป็น source of truth ฝั่ง Frontend สำหรับ AI Tutor หลังปรับ product direction เป็น **Personal AI Study Workspace** วันที่ 2026-06-15

## 1. Product Overview

AI Tutor Frontend เป็น Next.js 16 App Router application สำหรับผู้ใช้คนเดียวที่ต้องการทบทวนบทเรียนจากเอกสารของตัวเอง

Core product ไม่แยกประสบการณ์หลักเป็นครู/นักเรียน ผู้ใช้ทุกคนควรเข้า flow เดียวกัน:

```text
Register/Login
  -> แดชบอร์ดของฉัน
  -> เอกสารของฉัน
  -> สรุปเอกสาร
  -> แชทกับเอกสาร
  -> ควิซทบทวน
  -> คะแนนของฉัน
  -> สถิติการทบทวน
```

เป้าหมายของ Frontend คือทำให้ผู้ใช้รู้เสมอว่า:

- กำลังใช้เอกสารไหน
- AI สรุป/ตอบ/สร้างควิซจากข้อมูลอะไร
- ควรทำอะไรต่อเพื่อทบทวน
- สถานะไหนคือข้อมูลจริงจาก Backend และสถานะไหนคือยังรอ Backend

## 2. Technology Stack

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

## 3. Product Vocabulary

ใช้คำเหล่านี้เป็น copy หลัก:

| Concept | Thai Copy |
| --- | --- |
| Dashboard | แดชบอร์ดของฉัน |
| Workspace | พื้นที่เรียนของฉัน |
| Documents | เอกสารของฉัน |
| Summary | สรุปเอกสาร |
| Chat | แชทกับเอกสาร |
| Quiz | ควิซทบทวน |
| Score | คะแนนของฉัน |
| Analytics | สถิติการทบทวน |

คำที่ไม่ควรอยู่ใน core UI:

- แดชบอร์ดครู
- แดชบอร์ดนักเรียน
- ผู้สอนเท่านั้น
- รอครูแชร์
- เผยแพร่ให้นักเรียน
- ภาพรวมห้องเรียน
- รายชื่อนักเรียน

## 4. Core Functional Scope

### 4.1 Auth

ผู้ใช้ต้องสมัครและเข้าสู่ระบบได้โดยไม่ต้องเลือกบทบาทครู/นักเรียนใน core UI

Requirements:

- Login/Register ใช้ same-origin Next.js BFF routes
- BFF รับผิดชอบการคุยกับ Backend auth endpoint
- Browser ไม่เห็น access token หรือ refresh token
- ถ้า Backend ยังต้องใช้ role ให้ BFF ส่ง default ตาม contract โดยไม่ทำให้ผู้ใช้ต้องเลือก
- Success state ต้องตรงกับผลลัพธ์จริง ไม่แสดงว่าสำเร็จก่อน Backend ตอบ

Current implementation status after `UnifiedAuthAndSession`:

- Register UI เป็น single-user onboarding แล้ว ไม่มี radio/selector สำหรับบทบาทครูหรือนักเรียน
- Frontend validation ไม่รับ role จากฟอร์ม และ browser register payload ไม่ส่ง role ไปที่ BFF
- Next.js BFF `/api/auth/register` ส่งเฉพาะ `email`, `full_name`, และ `password` ให้ Backend ตาม single-user contract ล่าสุด
- Session contract รองรับ Backend role `user/admin`, `is_admin`, และ `accessible_route_groups` โดยไม่พึ่ง `tenant_id` หรือ legacy learner/trainer fields
- Login สำเร็จทุก role redirect เข้า workspace เดียวที่ `/`
- Core protected routes เช่น `/`, `/documents`, `/chat`, `/quiz`, `/analytics`, `/settings` ใช้ร่วมกันได้สำหรับ authenticated session
- Legacy `/teacher` ถูกถอดจาก core route policy แล้วเพื่อให้ product เป็น personal workspace เดียว
- Auth API client และ guard tests ยืนยันว่าไม่มี token ถูกเก็บใน `localStorage` หรือ `sessionStorage`
- Verification ล่าสุด: `npm run test`, `npm run lint`, `npm run build`, และ `npm audit --audit-level=high` ผ่าน

### 4.2 App Shell

App Shell ต้องเป็น navigation เดียวสำหรับทุก user

Core navigation:

- แดชบอร์ด
- เอกสาร
- แชท AI
- ควิซทบทวน
- สถิติ
- คอร์สเรียน หรือ ชุดบทเรียนของฉัน ถ้ายังเป็น placeholder
- การตั้งค่า

Requirements:

- Primary action ควรพาไปเริ่มที่เอกสาร
- User badge แสดงชื่อผู้ใช้ ไม่เน้น role
- Sidebar/topbar ต้อง keyboard-friendly และ responsive
- ไม่มี navigation หลักไปแดชบอร์ดครู

Current implementation status after `UnifiedAppShellNavigation`:

- Core navigation เป็นชุดเดียวสำหรับทุก authenticated session: แดชบอร์ด, เอกสารของฉัน, แชทกับเอกสาร, ควิซทบทวน, และสถิติการทบทวน
- Primary action เปลี่ยนเป็น `เริ่มจากเอกสาร` และพาไป `/documents`
- `/teacher` ถูกถอดออกจาก protected route policy และ app route หลักแล้ว
- User badge ใน topbar แสดงชื่อผู้ใช้กับข้อความกลาง `พื้นที่เรียนของฉัน` โดยไม่แสดง role ครู/นักเรียนใน core shell
- Search copy ใน topbar เปลี่ยนเป็น document-first: ค้นหาเอกสาร ควิซ หรือสรุป
- Desktop sidebar และ mobile navigation ใช้รายการเดียวกัน พร้อม focus trap/escape restore ตาม accessibility requirement

### 4.3 My Study Dashboard

หน้า `/` คือแดชบอร์ดส่วนตัว

Requirements:

- แสดง next action ที่ชัด: อัปโหลดเอกสาร, เปิดสรุปล่าสุด, ถาม AI, ทำควิซ, ดูสถิติ
- ถ้ายังไม่มีข้อมูล ต้องเป็น empty state ที่ตั้งใจและพาไปเริ่มจากเอกสาร
- ไม่ใช้คำว่าแดชบอร์ดครู/แดชบอร์ดนักเรียนใน core page
- Metrics ต้องมาจากข้อมูลของ current user เท่านั้น

Current implementation status after `UnifiedStudyDashboard`:

- หน้า `/` ใช้ `frontend/src/features/study-dashboard/` เป็น dashboard เดียวสำหรับผู้ใช้ทุกคน
- Legacy `frontend/src/features/student-dashboard/` และ `frontend/src/features/teacher-dashboard/` ถูกถอดออกจาก core frontend แล้ว
- Dashboard ใช้ข้อมูลจาก `/api/analytics/dashboard` ผ่าน server-side API wrapper และ validate response ด้วย Zod ก่อน map เข้า UI
- ไม่มีการเก็บ token ฝั่ง browser และไม่มีการส่ง user id จาก client เพื่อ scope data
- Empty state ตั้งใจให้เริ่มจากเอกสารเป็นลำดับแรก พร้อม CTA ไป `/documents`, `/quiz`, และ `/analytics`
- Copy หลักเป็น Thai-first และไม่ใช้คำว่าแดชบอร์ดครู/แดชบอร์ดนักเรียนใน core page
- Metric cards, onboarding steps, recent scores, score trend, and review targets แสดงเฉพาะข้อมูลของ current authenticated user

### 4.4 Documents

หน้า `/documents` คือพื้นที่เอกสารของผู้ใช้

Requirements:

- Upload document ได้ถ้า Backend session อนุญาต
- แสดง processing state หลัง upload
- แสดงเอกสารล่าสุดอย่างน้อย 2 รายการในพื้นที่หลักหรือ sidebar
- มีปุ่มเปิด popup เพื่อดูเอกสารทั้งหมดในคลัง
- มี delete action เมื่อ Backend contract พร้อม และต้องใช้ same-origin BFF + Origin/CSRF guard
- Long filename ต้องไม่ดัน layout พัง
- Summary/preview ต้องเป็นข้อมูลจริงจาก Backend หรือแสดง state ว่ายังไม่มีข้อมูล

### 4.5 Summary Detail

หน้า `/documents/[fileId]` คือหน้ารายละเอียดสรุปของเอกสารที่เลือก

Requirements:

- แสดงชื่อเอกสาร สถานะ วันที่ และสรุปเป็นภาษาไทยเมื่อ Backend ส่งมา
- Markdown หรือ summary text ต้อง render อย่างปลอดภัยผ่าน React ไม่ใช้ `dangerouslySetInnerHTML`
- ถ้า Backend ส่งสรุปทั่วไปหรือไม่ตรงเนื้อหา ต้องแสดงข้อความที่ไม่หลอกผู้ใช้ว่าเป็นสรุปสมบูรณ์
- มี CTA ต่อไปยังแชทกับเอกสารและสร้างควิซทบทวน

### 4.6 Chat With Document

หน้า `/chat` คือการถาม AI จากเอกสารของผู้ใช้

Requirements:

- ผู้ใช้เลือกเอกสารที่จะถามได้
- Chat composer ต้องบอกชัดว่ากำลังใช้เอกสารไหน
- AI answer ต้องแสดง citation ถ้ามี
- ถ้า Backend ไม่พบ context ต้องแสดง no-context state อย่างตรงไปตรงมา
- ไม่ควรตอบเหมือน chatbot ทั่วไปที่ไม่ผูกกับเอกสาร

### 4.7 Personal Review Quiz

หน้า `/quiz` คือควิซทบทวนส่วนตัว

Requirements:

- ผู้ใช้เลือกเอกสารเพื่อสร้างควิซ
- คำว่า publish/share/assign ไม่ควรเป็น core UI
- ผู้ใช้ทำควิซและส่งคำตอบได้
- ห้ามแสดง answer key หรือเฉลยก่อน submit
- หลัง submit แสดงคะแนน feedback และ citation/source ถ้ามี
- Quiz text ควรเป็นภาษาไทยเมื่อ Backend รองรับ

### 4.8 Personal Learning Analytics

หน้า `/analytics` คือสถิติการทบทวนของผู้ใช้

Requirements:

- แสดงคะแนนล่าสุด แนวโน้มคะแนน เอกสารที่ใช้เรียน และควิซที่ทำ
- Empty state ต้องพาไปอัปโหลดเอกสารหรือทำควิซ
- ไม่แสดงห้องเรียน รายชื่อนักเรียน หรือภาพรวม tenant/admin ใน core UI
- Analytics ต้อง scope ตาม current user จาก session เท่านั้น

## 5. Security Requirements

Frontend ต้องทำตาม `AGENTS_FRONTEND.md`:

- ใช้ HttpOnly Secure cookie session boundary
- ไม่เก็บ token ใน `localStorage` หรือ `sessionStorage`
- ใช้ same-origin BFF routes สำหรับ auth และ state-changing API
- BFF ต้องมี Origin/CSRF guard สำหรับ mutation เช่น upload, delete, quiz submit
- ห้ามรับ `user_id` จาก URL หรือ client state เพื่อ scope data
- Backend response ต้อง validate ด้วย Zod ก่อน map เข้า UI
- ห้าม expose bearer token, refresh token, backend endpoint detail, storage URL หรือ secret ลง DOM
- User-facing error ต้องปลอดภัย ไม่ leak stack trace หรือ raw backend error

## 6. Accessibility & UX Requirements

- Text contrast target WCAG AA
- Controls ต้องมี accessible name
- Focus visible ต้องชัดเจน
- Dialog/popup เช่น document library ต้อง trap/restore focus ได้
- Progressbar ต้องมี semantic attributes เมื่อใช้แสดง progress จริง
- Empty/loading/error/success state ต้องอ่านแล้วเข้าใจและมี next action
- Thai text, long filenames, citations, and markdown must not overflow or overlap
- เคารพ `prefers-reduced-motion`

## 7. Current Codebase Direction

Codebase ปัจจุบันหลัง Phase 5.5.1-5.5.3:

- Auth ไม่ให้ผู้ใช้เลือกบทบาทครู/นักเรียนใน core UI แล้ว
- App Shell ใช้ navigation เดียวสำหรับทุก authenticated user
- `/teacher` และ dashboard แยก role ถูกถอดออกจาก core route/dashboard flow แล้ว
- หน้า `/` เป็น single-user study dashboard ผ่าน `features/study-dashboard`

Phase 5.5 ที่เหลือต้องปรับหน้าที่เกี่ยวกับเอกสาร แชท ควิซ สถิติ คอร์ส และ settings ให้เป็น personal study workspace เดียวกัน โดยไม่ทำลาย auth/session/API security ที่ทำไว้แล้ว

## 8. Planned Branch Sequence

ลำดับ branch หลักอยู่ใน `DESIGN.md`

สรุปลำดับ:

1. `ProductDirectionSingleUser`
2. `UnifiedAuthAndSession`
3. `UnifiedAppShellNavigation`
4. `UnifiedStudyDashboard`
5. `PersonalDocumentWorkspace`
6. `PersonalChatWorkspace`
7. `PersonalQuizReviewFlow`
8. `PersonalLearningAnalytics`
9. `UnifiedCoursesAndSettingsPlaceholders`
10. `SingleUserResponsiveA11yFinal`

## 9. Verification Commands

รันจาก `frontend/`

```bash
npm run test
npm run lint
npm run build
npm audit --audit-level=high
```

สำหรับ docs-only branch ให้รันอย่างน้อย:

```bash
git diff --check
```

## 10. Backend Contract Questions

ต้องคุยกับ Backend ใน branch ที่เกี่ยวข้อง:

- Auth: default role สำหรับ single-user คืออะไร และ Frontend ต้องส่ง role หรือไม่
- Documents: delete endpoint, cascade behavior, title generation, OCR/image extraction, summary language
- Chat: `file_id` filter, citation shape, Thai answer behavior, no-context response shape
- Quiz: user ปกติ generate quiz ได้ไหม, submit attempt shape, score result shape, answer key separation
- Analytics: personal analytics endpoint และ event mapping จาก documents/chat/quiz

## 11. Out Of Core Scope

สิ่งเหล่านี้ไม่ใช่ core flow ตอนนี้:

- Teacher dashboard
- Classroom assignment
- Student roster
- Tenant/global admin analytics
- Social login จริง
- Export PDF จริง
- Public sharing
- Course marketplace

รายการเหล่านี้อาจกลับมาเป็น Phase 6+ ได้เมื่อ core personal study flow เสถียรแล้ว

## 12. Auth UI Polish Notes

- Login และ Register ใช้ panel ขนาดเท่ากันบน desktop เพื่อให้การสลับหน้าไม่กระโดดหรือรู้สึกเป็นคนละ layout
- Register ลด copy ที่ซ้ำซ้อนออก เหลือเฉพาะโลโก้ ฟอร์ม เงื่อนไข ปุ่มสมัคร และ social login mock
- AuthShell รองรับ mirror layout: หน้า Login วางภาพประกอบซ้ายและฟอร์มขวา ส่วนหน้า Register วางฟอร์มซ้ายและภาพประกอบขวา พร้อม transition และ `prefers-reduced-motion`
- Register form fields are stacked vertically on every viewport so the account creation flow reads top-to-bottom and does not feel cramped.
- Login/Register route changes use a subtle slide-and-fade panel motion to make the form/illustration swap visible while still honoring `prefers-reduced-motion`.

## 13. Personal Document Workspace Notes

- หน้า `/documents` ต้องเป็นพื้นที่เอกสารส่วนตัวของผู้ใช้คนเดียว ไม่ใช้ภาษา teacher/student หรือ share-to-classroom เป็น core flow
- Empty state ต้องอธิบายเส้นทางต่อไปแบบตั้งใจ: อัปโหลดเอกสาร รอประมวลผล แล้วต่อยอดเป็นสรุป แชทกับเอกสาร หรือควิซทบทวน
- คลังเอกสารด้านข้างแสดงเอกสารล่าสุด 2 รายการก่อน เพื่อลดความแน่นของหน้า
- ปุ่ม `ดูเอกสารทั้งหมดในคลัง` เปิด dialog รายการทั้งหมด พร้อมปิดด้วย Escape และคืน focus กลับปุ่มเดิม
- Delete document ต้องผ่าน BFF/same-origin API เดิม ไม่ expose backend endpoint หรือ token ลง DOM และต้องแสดง error แบบปลอดภัยเมื่อ backend ลบไม่สำเร็จ
- Upload disabled state ต้องอธิบายเป็น capability จาก backend ไม่ใช่ข้อจำกัดตาม role เพื่อให้สอดคล้องกับ single-user product direction
- Document summary loader ต้องใช้ cached recap ก่อน และถ้า Backend ตอบ 404 ว่ายังไม่มี summary ให้เรียก `POST /api/recap/{fileId}` เพื่อ generate summary จริงจาก Backend แทนการแสดง mock
- Frontend ต้องแยก `document-derived` summary ออกจาก fallback/mock summary อย่างชัดเจน และต้องปิด AI actions เมื่อ Backend ยังไม่ได้ส่งสรุปจากเนื้อหาเอกสารจริง
- Contract schema ของ document dashboard ต้อง reject unknown status และ dashboard payload ที่ shape ไม่ครบ เพื่อไม่ normalize ข้อมูลผิดให้ดูเหมือนพร้อมใช้งาน
- หน้า `/documents` ต้องผูกปุ่ม Chat/Quiz และ badge AI readiness กับ `canUseAiActions`; ถ้า summary ยังเป็น fallback/mock ต้องแสดง notice แทน link ไปใช้งาน AI เพื่อไม่หลอกผู้ใช้ว่าเอกสารพร้อมแล้ว
- Document summary frontend ต้องตาม contract ล่าสุดที่ใช้ `user_id` ฝั่ง detail/upload และไม่พึ่ง `uploaded_by` ใน dashboard response; UI ห้ามแสดง raw `user_id` เป็นชื่อผู้อัปโหลด
