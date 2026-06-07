import { describe, expect, it, vi } from "vitest";

import { ApiClientError } from "../../../../lib/api/backendClient";
import { AUTH_COOKIE_NAMES } from "../../../../lib/api/authCookies";
import type { AuthBackendRequest } from "./authBffHandlers";
import { createAuthRouteHandlers } from "./authBffHandlers";

const tokenResponse = {
  access_token: "access-token-from-backend",
  expires_in: 900,
  refresh_expires_in: 2_592_000,
  refresh_token: "refresh-token-from-backend",
  token_type: "bearer" as const
};

const sessionResponse = {
  accessible_route_groups: ["student"],
  authenticated: true as const,
  can_manage_users: false,
  can_view_admin_analytics: false,
  protected_routes: ["/"],
  user: {
    created_at: "2026-06-03T00:00:00Z",
    email: "learner@example.com",
    full_name: "Learner Example",
    id: "user-1",
    last_active_at: "2026-06-03T00:00:00Z",
    role: "learner" as const,
    tenant_id: "tenant-1"
  }
};

const actionResponse = {
  email: "teacher@example.com",
  message: "Registration complete. Please verify your email before signing in.",
  requires_email_verification: true,
  tenant_id: "tenant-1",
  user_id: "user-2"
};

const createJsonRequest = (
  path: string,
  {
    body,
    cookie,
    method = "POST",
    origin = "http://localhost:3000"
  }: {
    body?: unknown;
    cookie?: string;
    method?: string;
    origin?: string | null;
  } = {}
) => {
  const headers = new Headers();
  headers.set("content-type", "application/json");

  if (cookie) {
    headers.set("cookie", cookie);
  }

  if (origin) {
    headers.set("origin", origin);
  }

  return new Request(`http://localhost:3000${path}`, {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers,
    method
  });
};

const readJson = async (response: Response) => response.json() as Promise<Record<string, unknown>>;

const createBackendRequest = () => {
  return vi.fn(async ({ path }: Parameters<AuthBackendRequest>[0]) => {
    if (path === "/api/auth/login" || path === "/api/auth/token/refresh") {
      return tokenResponse;
    }

    if (path === "/api/auth/session") {
      return sessionResponse;
    }

    if (path === "/api/auth/register" || path === "/api/auth/logout") {
      return actionResponse;
    }

    throw new Error(`Unhandled backend path: ${path}`);
  }) as unknown as ReturnType<typeof vi.fn> & AuthBackendRequest;
};

describe("auth BFF route handlers", () => {
  it("sets HttpOnly auth cookies after login and never returns backend tokens to the browser", async () => {
    const backendRequest = createBackendRequest();
    const handlers = createAuthRouteHandlers({ backendRequest });

    const response = await handlers.login(
      createJsonRequest("/api/auth/login", {
        body: {
          email: "learner@example.com",
          password: "learning123"
        }
      })
    );

    const body = await readJson(response);
    const setCookie = response.headers.get("set-cookie") ?? "";

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      ok: true,
      session: {
        mode: "http-only-cookie",
        storesTokenInClient: false,
        user: {
          email: "learner@example.com",
          role: "student"
        }
      }
    });
    expect(JSON.stringify(body)).not.toContain("access-token-from-backend");
    expect(JSON.stringify(body)).not.toContain("refresh-token-from-backend");
    expect(setCookie).toContain(AUTH_COOKIE_NAMES.accessToken);
    expect(setCookie).toContain(AUTH_COOKIE_NAMES.refreshToken);
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Secure");
    expect(setCookie.toLowerCase()).toContain("samesite=strict");
    expect(backendRequest).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        body: {
          email: "learner@example.com",
          password: "learning123"
        },
        method: "POST",
        path: "/api/auth/login"
      })
    );
    expect(backendRequest).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        accessToken: "access-token-from-backend",
        path: "/api/auth/session"
      })
    );
  });

  it("maps register roles from frontend student/teacher values to backend learner/trainer values", async () => {
    const backendRequest = createBackendRequest();
    const handlers = createAuthRouteHandlers({ backendRequest });

    const response = await handlers.register(
      createJsonRequest("/api/auth/register", {
        body: {
          acceptedTerms: true,
          email: "teacher@example.com",
          fullName: "Teacher Example",
          password: "secure-pass",
          role: "teacher"
        }
      })
    );

    const body = await readJson(response);

    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      ok: true,
      requiresEmailVerification: true
    });
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(backendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        body: {
          email: "teacher@example.com",
          full_name: "Teacher Example",
          password: "secure-pass",
          role: "trainer"
        },
        method: "POST",
        path: "/api/auth/register"
      })
    );
  });

  it("auto-verifies local dev registrations server-side when Backend returns a dev token", async () => {
    const backendRequest = vi.fn(async ({ path }: Parameters<AuthBackendRequest>[0]) => {
      if (path === "/api/auth/register") {
        return {
          ...actionResponse,
          dev_token: "dev-email-token"
        };
      }

      if (path === "/api/auth/verify-email") {
        return {
          ...actionResponse,
          message: "Email verified successfully.",
          requires_email_verification: false
        };
      }

      throw new Error(`Unhandled backend path: ${path}`);
    }) as unknown as ReturnType<typeof vi.fn> & AuthBackendRequest;
    const handlers = createAuthRouteHandlers({
      backendRequest,
      enableDevEmailVerification: true
    });

    const response = await handlers.register(
      createJsonRequest("/api/auth/register", {
        body: {
          acceptedTerms: true,
          email: "teacher@example.com",
          fullName: "Teacher Example",
          password: "secure-pass",
          role: "teacher"
        }
      })
    );

    const body = await readJson(response);

    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      email: "teacher@example.com",
      ok: true,
      requiresEmailVerification: false,
      verifiedInDevelopment: true
    });
    expect(JSON.stringify(body)).not.toContain("dev-email-token");
    expect(backendRequest).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        body: {
          token: "dev-email-token"
        },
        method: "POST",
        path: "/api/auth/verify-email"
      })
    );
  });

  it("does not auto-verify registrations when the dev verification switch is disabled", async () => {
    const backendRequest = vi.fn(async ({ path }: Parameters<AuthBackendRequest>[0]) => {
      if (path === "/api/auth/register") {
        return {
          ...actionResponse,
          dev_token: "dev-email-token"
        };
      }

      throw new Error(`Unhandled backend path: ${path}`);
    }) as unknown as ReturnType<typeof vi.fn> & AuthBackendRequest;
    const handlers = createAuthRouteHandlers({
      backendRequest,
      enableDevEmailVerification: false
    });

    const response = await handlers.register(
      createJsonRequest("/api/auth/register", {
        body: {
          acceptedTerms: true,
          email: "teacher@example.com",
          fullName: "Teacher Example",
          password: "secure-pass",
          role: "teacher"
        }
      })
    );

    const body = await readJson(response);

    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      ok: true,
      requiresEmailVerification: true
    });
    expect(JSON.stringify(body)).not.toContain("dev-email-token");
    expect(backendRequest).toHaveBeenCalledTimes(1);
  });

  it("rejects cross-origin auth mutations before they can reach the backend", async () => {
    const backendRequest = createBackendRequest();
    const handlers = createAuthRouteHandlers({ backendRequest });

    const response = await handlers.login(
      createJsonRequest("/api/auth/login", {
        body: {
          email: "learner@example.com",
          password: "learning123"
        },
        origin: "https://evil.example.com"
      })
    );

    const body = await readJson(response);

    expect(response.status).toBe(403);
    expect(body).toMatchObject({ ok: false });
    expect(backendRequest).not.toHaveBeenCalled();
  });

  it("returns a 401 session response when the access cookie is missing", async () => {
    const backendRequest = createBackendRequest();
    const handlers = createAuthRouteHandlers({ backendRequest });

    const response = await handlers.session(createJsonRequest("/api/auth/session", { method: "GET", origin: null }));
    const body = await readJson(response);

    expect(response.status).toBe(401);
    expect(body).toMatchObject({ ok: false });
    expect(backendRequest).not.toHaveBeenCalled();
  });

  it("refreshes and rotates auth cookies without returning new token values", async () => {
    const backendRequest = createBackendRequest();
    const handlers = createAuthRouteHandlers({ backendRequest });

    const response = await handlers.refresh(
      createJsonRequest("/api/auth/refresh", {
        cookie: `${AUTH_COOKIE_NAMES.refreshToken}=old-refresh-token`
      })
    );

    const body = await readJson(response);
    const setCookie = response.headers.get("set-cookie") ?? "";

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true });
    expect(JSON.stringify(body)).not.toContain("access-token-from-backend");
    expect(JSON.stringify(body)).not.toContain("refresh-token-from-backend");
    expect(setCookie).toContain(AUTH_COOKIE_NAMES.accessToken);
    expect(setCookie).toContain(AUTH_COOKIE_NAMES.refreshToken);
    expect(backendRequest).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        body: {
          refresh_token: "old-refresh-token"
        },
        method: "POST",
        path: "/api/auth/token/refresh"
      })
    );
  });

  it("clears auth cookies on logout while forwarding the access token server-side only", async () => {
    const backendRequest = createBackendRequest();
    const handlers = createAuthRouteHandlers({ backendRequest });

    const response = await handlers.logout(
      createJsonRequest("/api/auth/logout", {
        cookie: `${AUTH_COOKIE_NAMES.accessToken}=access-cookie-value; ${AUTH_COOKIE_NAMES.refreshToken}=refresh-cookie-value`
      })
    );

    const body = await readJson(response);
    const setCookie = response.headers.get("set-cookie") ?? "";

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true });
    expect(setCookie).toContain("Max-Age=0");
    expect(setCookie).toContain(AUTH_COOKIE_NAMES.accessToken);
    expect(setCookie).toContain(AUTH_COOKIE_NAMES.refreshToken);
    expect(backendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "access-cookie-value",
        method: "POST",
        path: "/api/auth/logout"
      })
    );
  });

  it("maps backend email-verification failures to a safe auth message", async () => {
    const backendRequest = vi.fn(async () => {
      throw new ApiClientError({
        code: "forbidden",
        details: { detail: "Please verify your email before signing in" },
        message: "Please verify your email before signing in",
        status: 403
      });
    }) as unknown as ReturnType<typeof vi.fn> & AuthBackendRequest;
    const handlers = createAuthRouteHandlers({ backendRequest });

    const response = await handlers.login(
      createJsonRequest("/api/auth/login", {
        body: {
          email: "learner@example.com",
          password: "learning123"
        }
      })
    );

    const body = await readJson(response);

    expect(response.status).toBe(403);
    expect(body).toMatchObject({
      ok: false,
      message: "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ"
    });
    expect(response.headers.get("set-cookie")).toBeNull();
  });
});
