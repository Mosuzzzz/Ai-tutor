## Backend Auth Contract

This backend now supports two distinct auth paths:

1. **SSO/JIT** for enterprise domains via `POST /api/auth/sso/check` and `POST /api/auth/sso/login`.
2. **Explicit email/password auth** via `POST /api/auth/register` and `POST /api/auth/login`.

### Explicit auth flows

- `POST /api/auth/register`
	- Creates a tenant and user explicitly.
	- Does **not** auto-login the user.
	- Returns a verification token in development mode so the flow can be tested locally.
- `POST /api/auth/verify-email`
	- Confirms the account email before login.
- `POST /api/auth/login`
	- Requires a verified local account.
- `POST /api/auth/forgot-password`
	- Requests a reset link.
- `POST /api/auth/reset-password`
	- Resets the password with a valid token.
- `POST /api/auth/magic-link/request`
	- Generates a passwordless login link.
- `POST /api/auth/magic-link/verify`
	- Exchanges the magic link token for a bearer JWT.

### Notes

- Password-based registration maps frontend aliases `student -> learner` and `teacher -> trainer`.
- `FRONTEND_URL` controls CORS. For local development it defaults to `http://localhost:3000`.
- `JWT_SECRET_KEY` must be set explicitly; the app will not start without it.

### Smoke tests

```bash
cd backend
uv run python test_auth_flows.py
uv run python test_backend.py
```
