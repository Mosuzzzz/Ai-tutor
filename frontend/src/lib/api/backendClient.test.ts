import { z } from "zod";
import { describe, expect, it, vi } from "vitest";

import { ApiClientError, backendJsonRequest, mapApiErrorToMessage } from "./backendClient";

const profileSchema = z.object({
  email: z.email(),
  role: z.enum(["learner", "trainer", "tenant_admin", "global_admin"])
});

const jsonResponse = (body: unknown, init: ResponseInit = {}) => {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status: init.status ?? 200,
    statusText: init.statusText,
  });
};

describe("backendJsonRequest", () => {
  it("sends server-side bearer auth and validates a successful JSON response", async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      jsonResponse({ email: "learner@example.com", role: "learner" })
    );

    const result = await backendJsonRequest({
      accessToken: "access-token-from-http-only-cookie",
      baseUrl: "https://backend.example.com",
      body: { email: "learner@example.com" },
      fetcher,
      method: "POST",
      path: "/api/auth/session",
      schema: profileSchema
    });

    expect(result).toEqual({ email: "learner@example.com", role: "learner" });
    expect(fetcher).toHaveBeenCalledWith(
      new URL("https://backend.example.com/api/auth/session"),
      expect.objectContaining({
        body: JSON.stringify({ email: "learner@example.com" }),
        headers: expect.objectContaining({
          Accept: "application/json",
          Authorization: "Bearer access-token-from-http-only-cookie",
          "Content-Type": "application/json"
        }),
        method: "POST"
      })
    );
  });

  it("maps backend error responses without leaking raw token details", async () => {
    const fetcher = vi.fn(async () =>
      jsonResponse({ detail: "Could not validate credentials: bearer token expired" }, { status: 401 })
    );

    await expect(
      backendJsonRequest({
        accessToken: "expired-token",
        baseUrl: "https://backend.example.com",
        fetcher,
        path: "/api/auth/session",
        schema: profileSchema
      })
    ).rejects.toMatchObject({
      code: "unauthorized",
      status: 401
    });

    try {
      await backendJsonRequest({
        accessToken: "expired-token",
        baseUrl: "https://backend.example.com",
        fetcher,
        path: "/api/auth/session",
        schema: profileSchema
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ApiClientError);
      expect(mapApiErrorToMessage(error)).toBe("กรุณาเข้าสู่ระบบอีกครั้ง");
      expect(String(error)).not.toContain("expired-token");
    }
  });

  it("throws invalid_response when the backend payload does not match the Zod contract", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ email: "not-an-email", role: "learner" }));

    await expect(
      backendJsonRequest({
        baseUrl: "https://backend.example.com",
        fetcher,
        path: "/api/auth/me",
        schema: profileSchema
      })
    ).rejects.toMatchObject({
      code: "invalid_response"
    });
  });

  it("aborts requests that exceed the configured timeout", async () => {
    vi.useFakeTimers();

    const fetcher = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
        })
    );

    const request = backendJsonRequest({
      baseUrl: "https://backend.example.com",
      fetcher,
      path: "/api/auth/session",
      schema: profileSchema,
      timeoutMs: 25
    });
    const assertion = expect(request).rejects.toMatchObject({
      code: "timeout"
    });

    await vi.advanceTimersByTimeAsync(25);
    await assertion;

    vi.useRealTimers();
  });
});
