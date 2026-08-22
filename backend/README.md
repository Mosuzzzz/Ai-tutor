## Backend Auth Contract

This backend supports explicit email/password auth and a BFF-only Google OAuth flow.

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
	- Never returns reset or development tokens in its public response.
- `POST /api/auth/reset-password`
	- Resets the password with a valid token.
- `POST /api/auth/magic-link/request`
	- Generates a passwordless login link.
	- Never returns magic-link or development tokens in its public response.
- `POST /api/auth/magic-link/verify`
	- Exchanges the magic link token for a bearer JWT.

### Google OAuth

- Next calls `POST /api/auth/google/start` and `POST /api/auth/google/callback` with the server-only BFF credential.
- Backend owns the one-time state transaction and PKCE verifier.
- Google identities are persisted by `issuer` and `sub`; email collisions require explicit account linking.
- Next validates the returned access token through `/api/auth/session` before creating browser cookies.

### Notes

- `FRONTEND_URL` controls CORS. For local development it defaults to `http://localhost:3000`.
- `JWT_SECRET_KEY` must be set explicitly; the app will not start without it.

### Smoke tests

```bash
cd backend
uv run python test_auth_flows.py
uv run python test_backend.py
```
