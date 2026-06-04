import { describe, expect, it, vi } from "vitest";

import { AUTH_COOKIE_NAMES } from "../../lib/api/authCookies";
import { getServerAuthSession, resolvePageSession, type AuthBackendRequest } from "./authGuard";

const backendSession = {
  accessible_route_groups: ["teacher"],
  authenticated: true as const,
  can_manage_users: false,
  can_view_admin_analytics: true,
  protected_routes: ["/teacher", "/quiz"],
  user: {
    created_at: "2026-06-04T00:00:00Z",
    email: "teacher@example.com",
    full_name: "Teacher Example",
    id: "user-1",
    last_active_at: "2026-06-04T00:00:00Z",
    role: "trainer" as const,
    tenant_id: "tenant-1"
  }
};

const createCookieStore = (token?: string) => ({
  get: (name: string) =>
    name === AUTH_COOKIE_NAMES.accessToken && token
      ? {
          value: token
        }
      : undefined
});

describe("auth guard server helpers", () => {
  it("returns null without calling Backend when the HttpOnly access cookie is missing", async () => {
    const backendRequest = vi.fn() as unknown as AuthBackendRequest;

    await expect(
      getServerAuthSession({
        backendRequest,
        cookieStore: createCookieStore()
      })
    ).resolves.toBeNull();
    expect(backendRequest).not.toHaveBeenCalled();
  });

  it("loads the Backend session using only the server-side access cookie", async () => {
    const backendRequest = vi.fn(async () => backendSession) as unknown as ReturnType<typeof vi.fn> &
      AuthBackendRequest;

    const session = await getServerAuthSession({
      backendRequest,
      cookieStore: createCookieStore("access-cookie-value")
    });

    expect(session).toMatchObject({
      user: {
        email: "teacher@example.com",
        role: "teacher"
      }
    });
    expect(backendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "access-cookie-value",
        path: "/api/auth/session"
      })
    );
  });

  it("returns a redirect decision when a session is missing or the role cannot access a route", async () => {
    const missingSession = await resolvePageSession("/documents", {
      backendRequest: vi.fn() as unknown as AuthBackendRequest,
      cookieStore: createCookieStore()
    });
    const blockedRole = await resolvePageSession("/", {
      backendRequest: vi.fn(async () => backendSession) as unknown as AuthBackendRequest,
      cookieStore: createCookieStore("access-cookie-value")
    });

    expect(missingSession).toEqual({
      href: "/login",
      type: "redirect"
    });
    expect(blockedRole).toEqual({
      href: "/teacher",
      type: "redirect"
    });
  });

  it("returns a sanitized frontend session when the role is allowed", async () => {
    const result = await resolvePageSession("/teacher", {
      backendRequest: vi.fn(async () => backendSession) as unknown as AuthBackendRequest,
      cookieStore: createCookieStore("access-cookie-value")
    });

    expect(result).toEqual({
      session: {
        mode: "http-only-cookie",
        storesTokenInClient: false,
        user: {
          displayName: "Teacher Example",
          email: "teacher@example.com",
          role: "teacher"
        }
      },
      type: "render"
    });
    expect(JSON.stringify(result)).not.toContain("access-cookie-value");
  });
});
