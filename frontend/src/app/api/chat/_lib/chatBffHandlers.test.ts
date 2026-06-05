import { describe, expect, it, vi } from "vitest";

import { AUTH_COOKIE_NAMES } from "../../../../lib/api/authCookies";
import { ApiClientError, type BackendJsonRequestOptions } from "../../../../lib/api/backendClient";
import { backendChatQueryResponse } from "../../../../features/ai-chat/aiChatTestData";
import {
  createChatRouteHandlers,
  type ChatBackendRequest
} from "./chatBffHandlers";

const createRequest = ({
  body = {
    fileId: "file-ready",
    prompt: "What should I review?"
  },
  cookie = "server-cookie-token",
  origin = "http://frontend.test"
}: {
  body?: unknown;
  cookie?: string | null;
  origin?: string | null;
} = {}) => {
  const headers = new Headers({
    host: "frontend.test"
  });

  if (origin !== null) {
    headers.set("origin", origin);
  }

  if (cookie) {
    headers.set("cookie", `${AUTH_COOKIE_NAMES.accessToken}=${encodeURIComponent(cookie)}`);
  }

  return new Request("http://frontend.test/api/chat/query", {
    body: JSON.stringify(body),
    headers,
    method: "POST"
  });
};

describe("chat BFF route handlers", () => {
  it("proxies a safe chat query to Backend with the HttpOnly access cookie", async () => {
    const backendRequest = vi.fn(async () => backendChatQueryResponse) as unknown as ReturnType<typeof vi.fn> &
      ChatBackendRequest;
    const handlers = createChatRouteHandlers({
      backendRequest
    });

    const response = await handlers.query(createRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.chat.response_text).toContain("Report incidents");
    expect(backendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "server-cookie-token",
        body: {
          file_id: "file-ready",
          prompt: "What should I review?"
        },
        method: "POST",
        path: "/api/chat/query"
      })
    );
    expect(JSON.stringify(body)).not.toContain("server-cookie-token");
  });

  it("rejects cross-origin mutation attempts before calling Backend", async () => {
    const backendRequest = vi.fn() as unknown as ChatBackendRequest;
    const handlers = createChatRouteHandlers({
      backendRequest
    });

    const response = await handlers.query(createRequest({ origin: "https://evil.example.com" }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.ok).toBe(false);
    expect(backendRequest).not.toHaveBeenCalled();
  });

  it("rejects missing cookies and invalid input without leaking Backend details", async () => {
    const backendRequest = vi.fn() as unknown as ChatBackendRequest;
    const handlers = createChatRouteHandlers({
      backendRequest
    });

    const missingCookieResponse = await handlers.query(createRequest({ cookie: null }));
    const invalidInputResponse = await handlers.query(createRequest({ body: { fileId: "file-ready", prompt: " " } }));

    expect(missingCookieResponse.status).toBe(401);
    expect(invalidInputResponse.status).toBe(400);
    expect(backendRequest).not.toHaveBeenCalled();
  });

  it("maps Backend errors to safe BFF responses", async () => {
    const backendRequest = vi.fn(async (_options: BackendJsonRequestOptions<unknown>) => {
      throw new ApiClientError({
        code: "forbidden",
        message: "Tenant mismatch",
        status: 403
      });
    }) as unknown as ReturnType<typeof vi.fn> & ChatBackendRequest;
    const handlers = createChatRouteHandlers({
      backendRequest
    });

    const response = await handlers.query(createRequest());
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.ok).toBe(false);
    expect(JSON.stringify(body)).not.toContain("Tenant mismatch");
  });
});
