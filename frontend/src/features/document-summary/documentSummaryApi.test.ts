import { describe, expect, it, vi } from "vitest";

import { AUTH_COOKIE_NAMES } from "../../lib/api/authCookies";
import { ApiClientError, type BackendJsonRequestOptions } from "../../lib/api/backendClient";
import type { AuthSession } from "../auth/types";
import {
  backendDocumentDashboardResponse,
  backendDocumentDetailResponse,
  backendDocumentStatusResponse,
  backendRecapResponse
} from "./documentSummaryTestData";
import {
  loadDocumentSummaryDetailForSession,
  loadDocumentSummaryForSession,
  type DocumentSummaryBackendRequest
} from "./documentSummaryApi";

const session: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Learner One",
    email: "learner@example.com",
    role: "user"
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

describe("loadDocumentSummaryForSession", () => {
  it("loads dashboard, selected detail, and status with the server-side access cookie", async () => {
    const backendRequest = vi.fn(async ({ path }: BackendJsonRequestOptions<unknown>) => {
      if (path === "/api/files/dashboard") {
        return backendDocumentDashboardResponse;
      }

      if (path === "/api/files/file-ready/detail") {
        return backendDocumentDetailResponse;
      }

      if (path === "/api/files/file-ready/status") {
        return backendDocumentStatusResponse;
      }

      throw new Error(`Unexpected path ${path}`);
    }) as unknown as ReturnType<typeof vi.fn> & DocumentSummaryBackendRequest;

    const result = await loadDocumentSummaryForSession({
      backendRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      session,
      timestamp: new Date("2026-06-05T10:00:00.000Z")
    });

    expect(result.status).toBe("ready");
    expect(result.dashboard?.selectedDocumentId).toBe("file-ready");
    expect(backendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "server-cookie-token",
        path: "/api/files/dashboard"
      })
    );
    expect(backendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "server-cookie-token",
        path: "/api/files/file-ready/detail"
      })
    );
    expect(backendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "server-cookie-token",
        path: "/api/files/file-ready/status"
      })
    );
    expect(JSON.stringify(result)).not.toContain("server-cookie-token");
  });

  it("uses cached recap when selected detail does not include summary markdown", async () => {
    const backendRequest = vi.fn(async ({ path }: BackendJsonRequestOptions<unknown>) => {
      if (path === "/api/files/dashboard") {
        return backendDocumentDashboardResponse;
      }

      if (path === "/api/files/file-needs-recap/detail") {
        return {
          ...backendDocumentDetailResponse,
          filename: "ethics-guide.pdf",
          id: "file-needs-recap",
          summary_available: false,
          summary_markdown: null
        };
      }

      if (path === "/api/files/file-needs-recap/status") {
        return {
          ...backendDocumentStatusResponse,
          file_id: "file-needs-recap",
          filename: "ethics-guide.pdf"
        };
      }

      if (path === "/api/recap/file-needs-recap") {
        return backendRecapResponse;
      }

      throw new Error(`Unexpected path ${path}`);
    }) as unknown as ReturnType<typeof vi.fn> & DocumentSummaryBackendRequest;

    const result = await loadDocumentSummaryForSession({
      backendRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      selectedDocumentId: "file-needs-recap",
      session
    });

    expect(result.status).toBe("ready");
    expect(result.dashboard?.documentDetails[0]?.summaryMarkdown).toContain("AI ethics guidance");
    expect(backendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/api/recap/file-needs-recap"
      })
    );
  });

  it("generates a recap when a ready document has no cached summary yet", async () => {
    const backendRequest = vi.fn(async ({ method, path }: BackendJsonRequestOptions<unknown>) => {
      if (path === "/api/files/dashboard") {
        return backendDocumentDashboardResponse;
      }

      if (path === "/api/files/file-needs-recap/detail") {
        return {
          ...backendDocumentDetailResponse,
          filename: "ethics-guide.pdf",
          id: "file-needs-recap",
          summary_available: false,
          summary_markdown: null
        };
      }

      if (path === "/api/files/file-needs-recap/status") {
        return {
          ...backendDocumentStatusResponse,
          file_id: "file-needs-recap",
          filename: "ethics-guide.pdf"
        };
      }

      if (path === "/api/recap/file-needs-recap" && method !== "POST") {
        throw new ApiClientError({
          code: "not_found",
          message: "Summary not yet generated",
          status: 404
        });
      }

      if (path === "/api/recap/file-needs-recap" && method === "POST") {
        return backendRecapResponse;
      }

      throw new Error(`Unexpected path ${path}`);
    }) as unknown as ReturnType<typeof vi.fn> & DocumentSummaryBackendRequest;

    const result = await loadDocumentSummaryForSession({
      backendRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      selectedDocumentId: "file-needs-recap",
      session
    });

    expect(result.status).toBe("ready");
    expect(result.dashboard?.documentDetails[0]?.summaryMarkdown).toContain("AI ethics guidance");
    expect(backendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/api/recap/file-needs-recap"
      })
    );
    expect(backendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { detail_level: "executive" },
        method: "POST",
        path: "/api/recap/file-needs-recap"
      })
    );
  });
  it("returns empty without detail calls when the document library has no files", async () => {
    const backendRequest = vi.fn(async () => ({
      documents: [],
      status_counts: {
        error: 0,
        pending: 0,
        processing: 0,
        ready: 0
      },
      total_documents: 0
    })) as unknown as ReturnType<typeof vi.fn> & DocumentSummaryBackendRequest;

    const result = await loadDocumentSummaryForSession({
      backendRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      session
    });

    expect(result.status).toBe("empty");
    expect(backendRequest).toHaveBeenCalledTimes(1);
  });

  it("returns an error without calling Backend when the access cookie is missing", async () => {
    const backendRequest = vi.fn() as unknown as DocumentSummaryBackendRequest;

    const result = await loadDocumentSummaryForSession({
      backendRequest,
      cookieStore: createCookieStore(),
      session
    });

    expect(result.status).toBe("error");
    expect(result.errorMessage).toBeTruthy();
    expect(backendRequest).not.toHaveBeenCalled();
  });

  it("loads an exact detail document for deep-linked summary pages", async () => {
    const backendRequest = vi.fn(async ({ path }: BackendJsonRequestOptions<unknown>) => {
      if (path === "/api/files/dashboard") {
        return backendDocumentDashboardResponse;
      }

      if (path === "/api/files/file-needs-recap/detail") {
        return {
          ...backendDocumentDetailResponse,
          filename: "ethics-guide.pdf",
          id: "file-needs-recap",
          summary_available: false,
          summary_markdown: null
        };
      }

      if (path === "/api/files/file-needs-recap/status") {
        return {
          ...backendDocumentStatusResponse,
          file_id: "file-needs-recap",
          filename: "ethics-guide.pdf"
        };
      }

      if (path === "/api/recap/file-needs-recap") {
        return backendRecapResponse;
      }

      throw new Error(`Unexpected path ${path}`);
    }) as unknown as ReturnType<typeof vi.fn> & DocumentSummaryBackendRequest;

    const result = await loadDocumentSummaryDetailForSession({
      backendRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      selectedDocumentId: "file-needs-recap",
      session
    });

    expect(result.status).toBe("ready");
    expect(result.dashboard?.selectedDocumentId).toBe("file-needs-recap");
    expect(result.dashboard?.documentDetails[0]?.summaryMarkdown).toContain("AI ethics guidance");
    expect(backendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/api/files/file-needs-recap/detail"
      })
    );
  });

  it("does not fall back to another document when a deep-linked file id is missing", async () => {
    const backendRequest = vi.fn(async ({ path }: BackendJsonRequestOptions<unknown>) => {
      if (path === "/api/files/dashboard") {
        return backendDocumentDashboardResponse;
      }

      throw new Error(`Unexpected path ${path}`);
    }) as unknown as ReturnType<typeof vi.fn> & DocumentSummaryBackendRequest;

    const result = await loadDocumentSummaryDetailForSession({
      backendRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      selectedDocumentId: "missing-file",
      session
    });

    expect(result.status).toBe("error");
    expect(result.errorMessage).toBeTruthy();
    expect(backendRequest).toHaveBeenCalledTimes(1);
  });

  it("maps invalid Backend responses into an error state", async () => {
    const backendRequest = vi.fn(async () => {
      throw new ApiClientError({
        code: "invalid_response",
        message: "Invalid document response"
      });
    }) as unknown as DocumentSummaryBackendRequest;

    const result = await loadDocumentSummaryForSession({
      backendRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      session
    });

    expect(result.status).toBe("error");
    expect(result.errorMessage).toBeTruthy();
  });
});
