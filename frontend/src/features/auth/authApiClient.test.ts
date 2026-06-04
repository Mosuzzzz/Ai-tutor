import { beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_MESSAGES } from "./authContent";
import { getAuthSession, logout, refreshSession, submitLogin, submitRegister } from "./authApiClient";

const jsonResponse = (body: unknown, init: ResponseInit = {}) => {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status: init.status ?? 200,
    statusText: init.statusText
  });
};

describe("auth API client", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("submits login to the BFF with same-origin credentials and does not persist tokens in browser storage", async () => {
    const fetcher = vi.fn(async () =>
      jsonResponse({
        message: AUTH_MESSAGES.loginSuccess,
        ok: true,
        session: {
          mode: "http-only-cookie",
          storesTokenInClient: false,
          user: {
            email: "learner@example.com",
            role: "student"
          }
        }
      })
    );
    const localStorageSetItem = vi.spyOn(Storage.prototype, "setItem");

    const result = await submitLogin(
      {
        email: "learner@example.com",
        password: "learning123"
      },
      fetcher
    );

    expect(result).toMatchObject({
      ok: true,
      session: {
        mode: "http-only-cookie",
        storesTokenInClient: false
      }
    });
    expect(JSON.stringify(result)).not.toContain("learning123");
    expect(JSON.stringify(result)).not.toContain("access_token");
    expect(fetcher).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({
        body: JSON.stringify({
          email: "learner@example.com",
          password: "learning123"
        }),
        credentials: "same-origin",
        method: "POST"
      })
    );
    expect(localStorageSetItem).not.toHaveBeenCalled();
  });

  it("submits registration to the BFF and keeps backend role mapping out of the page component", async () => {
    const fetcher = vi.fn(async () =>
      jsonResponse(
        {
          message: AUTH_MESSAGES.registerSuccess,
          ok: true,
          requiresEmailVerification: true
        },
        { status: 201 }
      )
    );

    const result = await submitRegister(
      {
        acceptedTerms: true,
        email: "teacher@example.com",
        fullName: "Teacher Example",
        password: "secure-pass",
        role: "teacher"
      },
      fetcher
    );

    expect(result).toMatchObject({
      ok: true,
      requiresEmailVerification: true
    });
    expect(fetcher).toHaveBeenCalledWith(
      "/api/auth/register",
      expect.objectContaining({
        body: JSON.stringify({
          acceptedTerms: true,
          email: "teacher@example.com",
          fullName: "Teacher Example",
          password: "secure-pass",
          role: "teacher"
        }),
        credentials: "same-origin",
        method: "POST"
      })
    );
  });

  it("maps email verification failures from the BFF without throwing raw backend details", async () => {
    const fetcher = vi.fn(async () =>
      jsonResponse(
        {
          message: "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ",
          ok: false
        },
        { status: 403 }
      )
    );

    await expect(
      submitLogin(
        {
          email: "learner@example.com",
          password: "learning123"
        },
        fetcher
      )
    ).resolves.toEqual({
      message: "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ",
      ok: false
    });
  });

  it("calls session, refresh, and logout BFF endpoints with same-origin credentials", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ message: "ok", ok: true }));

    await getAuthSession(fetcher);
    await refreshSession(fetcher);
    await logout(fetcher);

    expect(fetcher).toHaveBeenNthCalledWith(
      1,
      "/api/auth/session",
      expect.objectContaining({
        credentials: "same-origin",
        method: "GET"
      })
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      2,
      "/api/auth/refresh",
      expect.objectContaining({
        credentials: "same-origin",
        method: "POST"
      })
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      3,
      "/api/auth/logout",
      expect.objectContaining({
        credentials: "same-origin",
        method: "POST"
      })
    );
  });
});
