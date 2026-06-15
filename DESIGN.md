# AI Tutor Frontend Roadmap

สถานะเอกสาร: อัปเดตตาม product direction ใหม่วันที่ 2026-06-15

## Product Direction

AI Tutor คือ **Personal AI Study Workspace** สำหรับผู้ใช้คนเดียว ไม่แยกประสบการณ์หลักเป็นครู/นักเรียน

ผู้ใช้ทุกคนใน core flow ควรทำสิ่งนี้ได้ในพื้นที่ของตัวเอง:

```text
Register/Login
  -> Dashboard ส่วนตัว
  -> Upload Document
  -> Summary Detail
  -> Chat with Document
  -> Generate Personal Review Quiz
  -> Take Quiz
  -> Personal Learning Analytics
```

## เปลี่ยนจาก Role-based ไปเป็น Single-User

เอกสารนี้คือการ reset product จาก mental model เดิมที่แยกครู/นักเรียน ไปเป็น personal study workspace

จากเดิม (role-based):

```text
ครูอัปโหลดเอกสาร -> สรุป -> สร้างควิซ -> แชร์ให้นักเรียน -> นักเรียนทำควิซ
```

เปลี่ยนเป็น (single-user):

```text
ผู้ใช้คนเดียว (ไม่แยก role)
  -> อัปโหลดเอกสารของตัวเอง
  -> AI สรุป
  -> แชทกับเอกสาร
  -> สร้างควิซไว้ทบทวนเอง
  -> ทำควิซและดูผล/สถิติของตัวเอง
```

product statement: **"AI Tutor ส่วนตัวสำหรับอ่าน สรุป ถาม และทบทวนจากเอกสารของเราเอง"**

ผลกระทบหลักของการเปลี่ยน direction:

- ไม่มี Teacher Dashboard กับ Student Dashboard แยกแบบเดิม รวมเป็น dashboard ส่วนตัวเดียว
- ไม่มี flow publish/share/assign quiz ให้คนอื่นใน core flow
- ไม่มี RBAC หนัก ๆ สำหรับครู/นักเรียนใน UI หลัก
- Sidebar เป็นของผู้ใช้ทั่วไป: แดชบอร์ด, เอกสาร, แชท AI, สร้างควิซ, สถิติการเรียน
- Quiz คือ "แบบฝึกทบทวนส่วนตัว" ไม่ใช่ "แบบทดสอบที่ครูแจก"
- เอกสารทุกอย่างเป็น personal workspace ของผู้ใช้
- Auth ยังจำเป็น แต่ role เหลือแค่ user/admin และไม่โชว์ role ใน core UI

หลักการสำคัญ:

- Thai-first: copy หลักเป็นภาษาไทย
- Personal-first: ทุกหน้าตอบว่า "ฉันจะทบทวนต่อยังไง"
- No role confusion: UI หลักไม่ถามว่าผู้ใช้เป็นครูหรือนักเรียน
- API-honest: ถ้า Backend ยังตอบไม่สมบูรณ์ ต้องแสดง state ตามจริง
- Security-first: ใช้ HttpOnly cookie/session ผ่าน BFF, ไม่เก็บ token ใน `localStorage` หรือ `sessionStorage`
- Premium learning product: สงบ น่าเชื่อถือ อ่านง่าย ไม่ฉูดฉาด และไม่เหมือน generic AI dashboard

## Product Vocabulary

ใช้คำเหล่านี้เป็น vocabulary กลางของทุก branch ต่อไป:

| Concept | Copy หลัก |
| --- | --- |
| Workspace | พื้นที่เรียนของฉัน |
| Dashboard | แดชบอร์ดของฉัน |
| Documents | เอกสารของฉัน |
| Summary | สรุปเอกสาร |
| Chat | แชทกับเอกสาร |
| Quiz | ควิซทบทวน |
| Score | คะแนนของฉัน |
| Analytics | สถิติการทบทวน |

หลีกเลี่ยงใน core UI:

- แดชบอร์ดครู
- แดชบอร์ดนักเรียน
- ผู้สอนเท่านั้น
- รอครูแชร์
- เผยแพร่ให้นักเรียน
- ภาพรวมห้องเรียน
- รายชื่อนักเรียน

## Legacy ที่ต้องลบระหว่าง Reset

โค้ดปัจจุบันยังมีของเดิมจาก mental model ครู/นักเรียนค้างอยู่ แต่ละ branch ด้านล่างต้องลบส่วนที่เกี่ยวข้องออก ไม่ใช่แค่ซ่อน:

| Legacy ในโค้ด | ลบ/ย้ายใน branch |
| --- | --- |
| `frontend/src/app/teacher/` route | 5.5.2 `UnifiedAppShellNavigation` |
| `frontend/src/features/student-dashboard/` | 5.5.3 `UnifiedStudyDashboard` |
| `frontend/src/features/teacher-dashboard/` | 5.5.3 `UnifiedStudyDashboard` |
| `frontend/src/app/api/quiz/[examId]/publish/` | 5.5.6 `PersonalQuizReviewFlow` |
| copy "ผู้สอนเท่านั้น"/"รอครูแชร์" ใน document UI | 5.5.4 `PersonalDocumentWorkspace` |
| role badge ครู/นักเรียนใน app shell | 5.5.2 `UnifiedAppShellNavigation` |

หมายเหตุ Backend: endpoint ฝั่ง backend ยังจัดกลุ่มเป็น `routers/tenant/` และ `routers/admin/analytics.py` (trainer/students) การ reset frontend ไม่ต้องรอ backend rename แต่ core UI ต้องไม่ผูกกับ concept เหล่านี้ และต้องคุย contract ตามหัวข้อท้ายเอกสาร

## Verification ทุก Branch

รันจาก `frontend/`

```bash
npm run test
npm run lint
npm run build
npm audit --audit-level=high
```

ถ้า branch แตะ UX/UI:

- ตรวจ desktop และ mobile viewport
- ตรวจ keyboard navigation และ focus visible
- ตรวจข้อความไทย ชื่อไฟล์ยาว citation และ markdown ไม่ล้น
- ตรวจ empty/loading/error/success state
- ตรวจ contrast และ disabled state
- ใช้ `$impeccable critique` และ `$impeccable audit` ตาม scope ของ branch

## Branch Rules

- สร้าง branch ใหม่จาก `main` ล่าสุด
- ทำตามลำดับด้านล่าง เพราะ branch หลังพึ่ง mental model จาก branch ก่อน
- ถ้าเปลี่ยน behavior ให้ปรับ/เพิ่ม test ก่อน
- ถ้าแตะ UX/UI ให้ใช้ Impeccable command ที่ระบุ
- ไม่รวมหลาย branch เข้าด้วยกันถ้าทำให้ review ยาก
- ไม่แก้ auth/session security แบบเดาสุ่มนอก contract ของ Backend
- ไม่ commit `.agents/`, `.codex/`, `.impeccable/`, ไฟล์ backend ที่ไม่เกี่ยวข้อง หรือ env/local generated files

---

# Phase 5.5: Single-User Reset

## 5.5.0 `ProductDirectionSingleUser` — DONE (PR #40)

เป้าหมาย:

- ปรับเอกสาร product ให้เป็น personal AI study workspace
- เลิกใช้คำอธิบาย core flow แบบครูสร้างให้นักเรียน
- สร้าง vocabulary เดียวสำหรับ branch ต่อไป
- ทำให้ `PRODUCT.md`, `DESIGN.md`, และ `frontend/SRS.md` เป็น source of truth เดียวกัน

Files:

- `PRODUCT.md`
- `DESIGN.md`
- `frontend/SRS.md`

Status: merge แล้วผ่าน PR #40 (`ProductDirectionSingleUser`) เอกสารหลักสะท้อน single-user direction แล้ว

## 5.5.1 `UnifiedAuthAndSession`

เป้าหมาย:

- Register ไม่ถาม role ครู/นักเรียน
- Login redirect ไป `/` สำหรับ user ปกติ
- ถ้า Backend ยังต้องการ role ให้ BFF ส่ง default ตาม contract โดยซ่อนจาก UI
- รักษา HttpOnly cookie/session security ตาม `AGENTS_FRONTEND.md`

Files:

- `frontend/src/features/auth/`
- `frontend/src/lib/api/authContract.ts`
- `frontend/src/app/api/auth/_lib/authBffHandlers.ts`
- auth tests

Impeccable:

```text
$impeccable clarify frontend/src/features/auth
$impeccable harden frontend/src/features/auth
$impeccable critique /login /register
$impeccable audit frontend/src/features/auth
```

Acceptance:

- Register ใช้งานได้โดยไม่เลือก role
- Login success ไป `/`
- ไม่มี token ใน client storage
- Test/lint/build/audit ผ่าน

## 5.5.2 `UnifiedAppShellNavigation`

เป้าหมาย:

- Sidebar/topbar เป็น navigation เดียวสำหรับทุก user
- ไม่มีเมนูแดชบอร์ดครูใน core navigation และลบ `frontend/src/app/teacher/` ออก
- Primary action พาไปเริ่มที่ `/documents`
- User badge ไม่แสดง role ครู/นักเรียนใน core UI

Files:

- `frontend/src/features/app-shell/`
- `frontend/src/features/auth/authRoutePolicy.ts`
- `frontend/src/app/teacher/` (ลบ)
- route/app shell tests

Impeccable:

```text
$impeccable layout frontend/src/features/app-shell
$impeccable clarify frontend/src/features/app-shell
$impeccable adapt frontend/src/features/app-shell
$impeccable harden frontend/src/features/app-shell
$impeccable critique /
$impeccable audit frontend/src/features/app-shell
```

Acceptance:

- Navigation เดียวกันทุก user: แดชบอร์ด, เอกสาร, แชท AI, สร้างควิซ, สถิติการเรียน
- `/teacher` ไม่ใช่ route หลักใน product อีกต่อไป
- Mobile/desktop navigation สอดคล้องกัน
- Test/lint/build/audit ผ่าน

## 5.5.3 `UnifiedStudyDashboard`

เป้าหมาย:

- รวม student/teacher dashboard เป็น dashboard ส่วนตัวเดียว และลบ feature เดิมทั้งสอง
- หน้า `/` แสดง next action ชัด: อัปโหลดเอกสาร, เปิดสรุปล่าสุด, ถาม AI, ทำควิซ, ดูสถิติ
- Empty state ดูตั้งใจ ไม่เหมือนหน้าว่าง

Files:

- `frontend/src/features/study-dashboard/`
- `frontend/src/features/student-dashboard/` (ลบ)
- `frontend/src/features/teacher-dashboard/` (ลบ)
- `frontend/src/app/page.tsx`
- legacy dashboard imports/tests ที่เกี่ยวข้อง

Impeccable:

```text
$impeccable shape frontend/src/features/study-dashboard
$impeccable layout frontend/src/features/study-dashboard
$impeccable typeset frontend/src/features/study-dashboard
$impeccable clarify frontend/src/features/study-dashboard
$impeccable onboard frontend/src/features/study-dashboard
$impeccable critique /
$impeccable audit frontend/src/features/study-dashboard
```

Acceptance:

- `/` คือ dashboard ส่วนตัวเดียว
- ไม่มีคำว่าแดชบอร์ดครู/แดชบอร์ดผู้เรียนใน core page
- ไม่มี feature `student-dashboard`/`teacher-dashboard` เหลือใน codebase
- ผู้ใช้ใหม่เข้าใจว่าควรเริ่มจากเอกสาร
- Test/lint/build/audit ผ่าน

## 5.5.4 `PersonalDocumentWorkspace`

เป้าหมาย:

- `/documents` เป็นพื้นที่เอกสารส่วนตัว
- ทุก user ใน core flow อัปโหลดเอกสารได้ถ้า Backend อนุญาต
- คลังเอกสารโชว์ล่าสุด 2 รายการ และมีปุ่มเปิด popup ดูทั้งหมด
- มี delete action ที่ปลอดภัยและชัดเจนตาม endpoint ที่ Backend มี
- Summary detail ไม่หลอกผู้ใช้ถ้า Backend ยังสรุปไม่ตรงเนื้อหา

Files:

- `frontend/src/features/document-summary/`
- `frontend/src/app/documents/`
- document tests

Impeccable:

```text
$impeccable layout frontend/src/features/document-summary
$impeccable clarify frontend/src/features/document-summary
$impeccable adapt frontend/src/features/document-summary
$impeccable harden frontend/src/features/document-summary
$impeccable critique /documents
$impeccable audit frontend/src/features/document-summary
```

Acceptance:

- ไม่มี copy "ผู้สอนเท่านั้น", "รอครูแชร์"
- Upload -> processing -> ready -> summary/chat/quiz ต่อกันชัด
- Popup คลังเอกสารใช้ keyboard ได้และ focus ไม่หลุด
- Long filename/markdown/citation ไม่ล้น
- Test/lint/build/audit ผ่าน

Backend ที่ต้องคุย:

- AI title จากเนื้อหาจริง
- summary markdown จากเนื้อหาจริง
- OCR/image extraction
- delete document cascade behavior

## 5.5.5 `PersonalChatWorkspace`

เป้าหมาย:

- `/chat` คือการถาม AI จากเอกสารของผู้ใช้เอง
- ผู้ใช้เลือกเอกสารที่จะถามได้ชัดเจน
- ถ้าไม่มีเอกสารพร้อม ต้องพาไปอัปโหลด
- ถ้า AI ไม่พบข้อมูลในเอกสาร ต้องแสดง no-context state อย่างตรงไปตรงมา

Files:

- `frontend/src/features/ai-chat/`
- chat tests

Impeccable:

```text
$impeccable shape frontend/src/features/ai-chat
$impeccable layout frontend/src/features/ai-chat
$impeccable clarify frontend/src/features/ai-chat
$impeccable adapt frontend/src/features/ai-chat
$impeccable harden frontend/src/features/ai-chat
$impeccable critique /chat
$impeccable audit frontend/src/features/ai-chat
```

Acceptance:

- ผู้ใช้รู้เสมอว่ากำลังถามจากเอกสารไหน
- UI หลักเป็นภาษาไทย
- Citation/no-context/empty/error state ชัด
- Test/lint/build/audit ผ่าน

Backend ที่ต้องคุย:

- Chat response language
- Citation shape
- `file_id` filtering
- RAG answer quality

## 5.5.6 `PersonalQuizReviewFlow`

เป้าหมาย:

- `/quiz` คือควิซทบทวนส่วนตัว ("แบบฝึกทบทวนส่วนตัว" ไม่ใช่ "แบบทดสอบที่ครูแจก")
- ไม่มี publish/share/assign ใน core UI และลบ BFF route `quiz/[examId]/publish` ออกจาก core flow
- ผู้ใช้สร้างควิซจากเอกสาร -> ทำควิซ -> ส่งคำตอบ -> เห็นคะแนนและ feedback
- ห้ามโชว์เฉลยก่อนส่งคำตอบ

Files:

- `frontend/src/features/ai-quiz-generator/`
- `frontend/src/app/api/quiz/[examId]/publish/` (ลบออกจาก core flow)
- quiz tests

Impeccable:

```text
$impeccable shape frontend/src/features/ai-quiz-generator
$impeccable layout frontend/src/features/ai-quiz-generator
$impeccable clarify frontend/src/features/ai-quiz-generator
$impeccable adapt frontend/src/features/ai-quiz-generator
$impeccable harden frontend/src/features/ai-quiz-generator
$impeccable critique /quiz
$impeccable audit frontend/src/features/ai-quiz-generator
```

Acceptance:

- Copy เป็น "ควิซทบทวน" หรือ "แบบฝึกทบทวนส่วนตัว"
- User ปกติสร้างควิซได้ถ้า Backend contract อนุญาต
- ไม่มี publish/share/assign ใน core quiz UI
- Answer key ไม่แสดงก่อน submit
- Attempt/score flow ชัด
- Test/lint/build/audit ผ่าน

Backend ที่ต้องคุย:

- Generate quiz สำหรับ user ปกติ
- Submit attempt และ score ส่วนตัว
- Question language
- Citation quality

## 5.5.7 `PersonalLearningAnalytics`

เป้าหมาย:

- `/analytics` เป็นสถิติการทบทวนส่วนตัว
- ไม่แสดงห้องเรียน รายชื่อนักเรียน หรือภาพรวม tenant/admin
- Metrics ผูกกับเอกสาร แชท ควิซ และคะแนนของผู้ใช้เอง

Files:

- `frontend/src/features/learning-analytics/`
- analytics tests

Impeccable:

```text
$impeccable layout frontend/src/features/learning-analytics
$impeccable typeset frontend/src/features/learning-analytics
$impeccable clarify frontend/src/features/learning-analytics
$impeccable onboard frontend/src/features/learning-analytics
$impeccable adapt frontend/src/features/learning-analytics
$impeccable critique /analytics
$impeccable audit frontend/src/features/learning-analytics
```

Acceptance:

- Copy เป็น "สถิติของฉัน" หรือ "ภาพรวมการทบทวน"
- Empty state พาไปอัปโหลดเอกสารหรือทำควิซ
- ไม่มีข้อมูลคนอื่นใน core UI
- Test/lint/build/audit ผ่าน

## 5.5.8 `UnifiedCoursesAndSettingsPlaceholders`

เป้าหมาย:

- `/courses` และ `/settings` ถ้ายังไม่ทำจริง ต้องเป็น placeholder ที่ไม่ขัดกับ single-user product
- `/courses` สื่อเป็น "ชุดบทเรียนของฉัน" ไม่ใช่ห้องเรียนที่ครูจัด
- `/settings` เป็น settings ของบัญชีและ workspace ส่วนตัว

Files:

- `frontend/src/features/foundation/`
- route placeholder tests

Impeccable:

```text
$impeccable distill frontend/src/features/foundation
$impeccable clarify frontend/src/features/foundation
$impeccable onboard frontend/src/features/foundation
$impeccable layout frontend/src/features/foundation
$impeccable critique /courses /settings
$impeccable audit frontend/src/features/foundation
```

Acceptance:

- Placeholder ไม่พูดถึงครู/นักเรียน
- มี next action ไป documents/chat/quiz
- Test/lint/build/audit ผ่าน

## 5.5.9 `SingleUserResponsiveA11yFinal`

เป้าหมาย:

- ตรวจรอบสุดท้ายทั้ง product หลัง unify แล้ว
- แก้ responsive, overflow, focus, empty states, loading states และ copy หลุด
- ยืนยันว่าไม่มี legacy ครู/นักเรียนหลงเหลือใน codebase

Files:

- `frontend/src/`
- routes หลักทั้งหมด

Impeccable:

```text
$impeccable adapt frontend/src
$impeccable audit frontend/src
$impeccable harden frontend/src
$impeccable polish frontend/src
```

Acceptance:

- Desktop/mobile ไม่แตก
- Dialog/popup focus ใช้งานด้วย keyboard ได้
- ไม่มี copy role-based หลุดใน core UI
- ไม่มี feature/route/copy ครู-นักเรียนเหลือใน frontend
- Test/lint/build/audit ผ่าน

---

# Phase 6: Product Completion หลัง Single-User Reset

ทำหลัง Phase 5.5 เสร็จเท่านั้น

## 6.1 `PersonalStudyCollections`

จัดกลุ่มเอกสารเป็นชุดบทเรียนส่วนตัว

Impeccable:

```text
$impeccable shape
$impeccable layout
$impeccable onboard
$impeccable clarify
$impeccable critique
$impeccable audit
```

## 6.2 `PersonalExportAndDownload`

Export/download สรุปหรือควิซของตัวเอง

Impeccable:

```text
$impeccable clarify
$impeccable layout
$impeccable harden
$impeccable audit
```

## 6.3 `PersonalNotificationsAndReminders`

แจ้งเตือนเอกสารประมวลผลเสร็จ และเตือนทบทวน

Impeccable:

```text
$impeccable shape
$impeccable clarify
$impeccable onboard
$impeccable harden
$impeccable audit
```

## 6.4 `PersonalProfileAndSettings`

ตั้งค่าบัญชี ภาษา และ notification preferences

Impeccable:

```text
$impeccable layout
$impeccable clarify
$impeccable harden
$impeccable critique
$impeccable audit
```

---

# Backend Contract Questions

ถามทีม Backend ก่อนหรือระหว่าง branch ที่เกี่ยวข้อง:

- Auth: register user ปกติต้องส่ง role หรือไม่ และ default role คืออะไร (เป้าหมาย: role เหลือ user/admin, ไม่โชว์ใน UI)
- Documents: upload/delete/status/summary/title/OCR รองรับอะไรแล้วบ้าง
- Chat: ต้องส่ง `file_id` เสมอไหม, citation shape คืออะไร, บังคับตอบไทยได้ไหม
- Quiz: user ปกติ generate quiz ได้ไหม, submit attempt/score shape คืออะไร, answer key แยกจาก learner view อย่างไร, มี endpoint publish ที่ core flow ต้องเลิกใช้ไหม
- Analytics: personal analytics endpoint ใช้ข้อมูลจาก document/chat/quiz attempt อะไรบ้าง (ต้องไม่พึ่ง admin/trainer analytics)

# Recommended Sequence

1. ~~`ProductDirectionSingleUser`~~ — DONE (PR #40)
2. `UnifiedAuthAndSession`
3. `UnifiedAppShellNavigation`
4. `UnifiedStudyDashboard`
5. `PersonalDocumentWorkspace`
6. `PersonalChatWorkspace`
7. `PersonalQuizReviewFlow`
8. `PersonalLearningAnalytics`
9. `UnifiedCoursesAndSettingsPlaceholders`
10. `SingleUserResponsiveA11yFinal`

เหตุผลของลำดับนี้: ต้องเปลี่ยน auth, route และ navigation ก่อน ไม่อย่างนั้น Documents, Chat, Quiz และ Analytics จะยังแบก logic/copy ครู-นักเรียนเดิมติดไปเรื่อย ๆ
</content>
</invoke>
