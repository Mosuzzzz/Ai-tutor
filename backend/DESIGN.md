# AI Tutor Backend — Single-User Rewrite

สถานะเอกสาร: **DONE** — full rewrite ลง branch `BackendSingleUserRewrite` วันที่ 2026-06-15
ขอบเขต: backend เท่านั้น ไม่แตะ frontend

## สิ่งที่ทำ

รื้อ backend จาก enterprise multi-tenant B2B ทิ้งทั้งหมด แล้วสร้างใหม่เป็น **Personal AI Study Workspace** สำหรับผู้ใช้คนเดียว

- **เหลือ 2 role**: `user` (ทุกคนใน core flow) และ `admin` (ดูแลระบบ) — default `user`
- **ลบ Tenant ทิ้งทั้งหมด**: ไม่มี `Tenant` model, ไม่มี `tenant_id` ในทุก entity, ไม่มี `sso_domain`
- **ลบ SSO/SAML, magic-link JIT provisioning ฝั่ง tenant, และ `seed-sandbox`**
- ทุก resource ผูกกับเจ้าของผ่าน `user_id` และ query scope ด้วย ownership ของผู้ใช้
- Quiz เป็น **ควิซทบทวนส่วนตัว**: ผู้ใช้สร้าง/ทำ/ส่งเอง ไม่มี publish/assign/draft, เฉลยถูกซ่อนจนกว่าจะ submit
- Analytics เป็น personal dashboard; `usage`/`audit-logs` เปิดให้ `admin` เท่านั้น

## Role model

`backend/core/models.py`

```python
ROLES = ("user", "admin")   # default "user"
```

JWT payload เหลือ `{user_id, email, role}` (เดิมมี `tenant_id`)
`require_role(["admin"])` ใช้ gate เฉพาะ endpoint ระบบ

## Data model (หลังรื้อ)

| Table | การเปลี่ยน |
| --- | --- |
| `users` | ลบ `tenant_id`; `role` default `"user"` |
| `files` | `tenant_id` -> `user_id` (เจ้าของ); relationship `owner` |
| `exams` | ลบ `tenant_id`, `status`, `submitted_by`; `user_id` = เจ้าของที่สร้างและทำควิซ; `taken_at` = ส่งแล้ว |
| `embeddings` | ลบ `tenant_id`; scope ผ่าน join `files.user_id` |
| `audit_logs` | ลบ `tenant_id` |
| `Tenant` | **ลบทั้ง model** |
| `RefreshToken` | คงเดิม |

## API surface (หลังรื้อ)

Auth (`routers/public/auth.py`) — register/verify-email/login/me/session/logout/forgot-password/reset-password/magic-link/token-refresh
ลบ: `sso/check`, `sso/login`, `seed-sandbox`
`session` คืน `{authenticated, user, accessible_route_groups, is_admin}` (เดิมมี `protected_routes`, `can_manage_users`, `can_view_admin_analytics`)

Files (`routers/public/files.py`) — upload/list/dashboard/detail/status/download/delete
upload และ delete เปิดให้ทุก `user` (เดิมจำกัด trainer/admin); scope `files.user_id == current_user.id`

Recap (`routers/public/recap.py`) — get/generate summary, scope by owner

Exams (`routers/public/exams.py`, ย้ายมาจาก `routers/tenant/exams.py`) — generate/get/update/submit
ลบ endpoint `publish`; เฉลยซ่อนจนกว่า `taken_at` จะถูกตั้ง; ห้าม submit ซ้ำ

Chat (`routers/public/chat.py`) — query/history, vector search scope by owner

Analytics (`routers/admin/analytics.py`) — `dashboard` (personal, ทุก user), `usage` + `audit-logs` (admin only)
ลบ: `trainer`, `trainer/students`

## Tests

`backend/tests/` rewrite เป็น single-user model:

- `test_auth_flows.py` — auth flow ครบ + two-role/session payload + admin-gated analytics + user upload ได้
- `test_backend.py` — integration: upload -> ingest -> recap -> personal quiz (เฉลยซ่อนก่อน submit) -> RAG chat -> personal dashboard -> admin audit log; ตรวจ personal isolation ระหว่างสอง user

รัน (จาก `backend/`, ใช้ sqlite + dummy secret):

```bash
DATABASE_URL="sqlite:///./test.db" JWT_SECRET_KEY="<32+ byte secret>" python -m pytest -q
# 3 passed
```

AI services มี offline fallback (ไม่มี GROQ_API_KEY ก็รันได้); embeddings เป็น md5-based deterministic

## Migration (production)

`Base.metadata.create_all` ไม่ทำ schema migration ให้ — production ที่มีข้อมูลเดิมต้อง migrate ก่อน:

- map `users.role`: `learner`/`trainer` -> `user`, `tenant_admin`/`global_admin` -> `admin`
- ย้าย ownership: `files.user_id` = `files.uploaded_by` เดิม
- `exams.user_id` คงเป็นผู้สร้าง; ถ้า flow เดิมมีคนทำต่างจากคนสร้าง ต้องตัดสินใจ mapping
- drop คอลัมน์ `tenant_id` ทุกตาราง, drop ตาราง `tenants`, drop `exams.status`/`exams.submitted_by`
- dev: drop ทั้ง db แล้ว create ใหม่ได้เลย

## ⚠️ ผลกระทบต่อ Frontend (ยังไม่แตะตามที่สั่ง)

Response contract เปลี่ยน — frontend BFF/types จะต้องอัปเดตภายหลัง:

- หาย `tenant_id` จาก register/user/file/exam responses
- `session` เปลี่ยน shape (`is_admin` แทน `can_manage_users`/`can_view_admin_analytics`/`protected_routes`)
- role values เปลี่ยนจาก `learner`/`trainer`/... เป็น `user`/`admin`
- exam response ไม่มี `status`; quiz generate ไม่คืนเฉลยแล้ว
- endpoint ที่หายไป: `sso/*`, `seed-sandbox`, `analytics/trainer*`, `exams/{id}/publish`
