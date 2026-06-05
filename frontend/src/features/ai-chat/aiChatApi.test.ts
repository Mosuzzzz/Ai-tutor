import { describe, expect, it, vi } from "vitest";

import { AUTH_COOKIE_NAMES } from "../../lib/api/authCookies";
import { ApiClientError, type BackendJsonRequestOptions } from "../../lib/api/backendClient";
import type { AuthSession } from "../auth/types";
import {
  backendChatDocumentsResponse,
  backendChatHistoryResponse
} from "./aiChatTestData";
import {
  loadAiChatSummaryForSession,
  type AiChatBackendRequest
} from "./aiChatApi";

const session: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Learner One",
    email: "learner@example.com",
    role: "student"
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

describe("loadAiChatSummaryForSession", () => {
  it("loads document context and filtered history with the server-side access cookie", async () => {
    const backendRequest = vi.fn(async ({ path }: BackendJsonRequestOptions<unknown>) => {
      if (path === "/api/files/dashboard") {
        return backendChatDocumentsResponse;
      }

      if (path === "/api/chat/history?file_id=file-ready&skip=0&limit=30") {
        return backendChatHistoryResponse;
      }

      throw new Error(`Unexpected path ${path}`);
    }) as unknown as ReturnType<typeof vi.fn> & AiChatBackendRequest;

    const result = await loadAiChatSummaryForSession({
      backendRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      session
    });

    expect(result.status).toBe("ready");
    expect(result.chat?.selectedDocumentId).toBe("file-ready");
    expect(backendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "server-cookie-token",
        path: "/api/files/dashboard"
      })
    );
    expect(backendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "server-cookie-token",
        path: "/api/chat/history?file_id=file-ready&skip=0&limit=30"
      })
    );
    expect(JSON.stringify(result)).not.toContain("server-cookie-token");
  });

  it("supports explicit file filters and pagination", async () => {
    const backendRequest = vi.fn(async ({ path }: BackendJsonRequestOptions<unknown>) => {
      if (path === "/api/files/dashboard") {
        return backendChatDocumentsResponse;
      }

      if (path === "/api/chat/history?file_id=file-ready&skip=10&limit=5") {
        return [];
      }

      throw new Error(`Unexpected path ${path}`);
    }) as unknown as ReturnType<typeof vi.fn> & AiChatBackendRequest;

    const result = await loadAiChatSummaryForSession({
      backendRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      historyLimit: 5,
      historySkip: 10,
      selectedDocumentId: "file-ready",
      session
    });

    expect(result.status).toBe("ready");
    expect(backendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/api/chat/history?file_id=file-ready&skip=10&limit=5"
      })
    );
  });

  it("returns empty without history calls when no chat-ready document exists", async () => {
    const backendRequest = vi.fn(async () => ({
      documents: [],
      status_counts: {
        error: 0,
        pending: 0,
        processing: 0,
        ready: 0
      },
      total_documents: 0
    })) as unknown as ReturnType<typeof vi.fn> & AiChatBackendRequest;

    const result = await loadAiChatSummaryForSession({
      backendRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      session
    });

    expect(result.status).toBe("empty");
    expect(backendRequest).toHaveBeenCalledTimes(1);
  });

  it("returns an error without calling Backend when the access cookie is missing", async () => {
    const backendRequest = vi.fn() as unknown as AiChatBackendRequest;

    const result = await loadAiChatSummaryForSession({
      backendRequest,
      cookieStore: createCookieStore(),
      session
    });

    expect(result.status).toBe("error");
    expect(result.errorMessage).toBeTruthy();
    expect(backendRequest).not.toHaveBeenCalled();
  });

  it("maps invalid Backend responses into an error state", async () => {
    const backendRequest = vi.fn(async () => {
      throw new ApiClientError({
        code: "invalid_response",
        message: "Invalid chat history response"
      });
    }) as unknown as AiChatBackendRequest;

    const result = await loadAiChatSummaryForSession({
      backendRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      session
    });

    expect(result.status).toBe("error");
    expect(result.errorMessage).toBeTruthy();
  });
});
