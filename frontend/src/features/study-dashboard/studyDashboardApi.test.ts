import { describe, expect, it, vi } from "vitest";

import { AUTH_COOKIE_NAMES } from "../../lib/api/authCookies";
import type { AuthSession } from "../auth/types";
import { loadStudyDashboardForSession, type StudyDashboardBackendRequest } from "./studyDashboardApi";

const session: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Siwakorn bundi",
    email: "siwakorn@example.com",
    role: "user"
  }
};

const analyticsResponse = {
  average_score: 86.4,
  completed_quizzes: 3,
  read_documents_count: 5,
  recent_scores: [
    {
      exam_id: "exam-1",
      filename: "คู่มือความปลอดภัย.pdf",
      id: "score-1",
      score: 92,
      submitted_at: "2026-06-05T10:00:00.000Z"
    }
  ],
  score_trend: [{ average_score: 86.4, date: "2026-06-05" }],
  streak_days: 2
};

const documentsResponse = {
  documents: [
    {
      created_at: "2026-06-05T09:00:00.000Z",
      filename: "คู่มือความปลอดภัย.pdf",
      id: "file-ready",
      related_exams_count: 1,
      status: "ready",
      summary_available: true,
      summary_markdown: "# สรุป"
    }
  ],
  status_counts: { error: 0, pending: 0, processing: 0, ready: 1 },
  total_documents: 1
};

const emptyAnalyticsResponse = {
  average_score: 0,
  completed_quizzes: 0,
  read_documents_count: 0,
  recent_scores: [],
  score_trend: [],
  streak_days: 0
};

const emptyDocumentsResponse = {
  documents: [],
  status_counts: { error: 0, pending: 0, processing: 0, ready: 0 },
  total_documents: 0
};

const createCookieStore = (token?: string) => ({
  get: vi.fn((name: string) =>
    name === AUTH_COOKIE_NAMES.accessToken && token
      ? {
          value: token
        }
      : undefined)
});

const createBackendRequest = ({
  analytics = analyticsResponse,
  documents = documentsResponse,
  failAnalytics = false,
  failDocuments = false
}: {
  analytics?: typeof analyticsResponse | typeof emptyAnalyticsResponse;
  documents?: typeof documentsResponse | typeof emptyDocumentsResponse;
  failAnalytics?: boolean;
  failDocuments?: boolean;
} = {}) => vi.fn(async ({ path }: { path: string }) => {
  if (path === "/api/analytics/dashboard") {
    if (failAnalytics) throw new Error("raw analytics failure");
    return analytics;
  }

  if (path === "/api/files/dashboard") {
    if (failDocuments) throw new Error("raw documents failure");
    return documents;
  }

  throw new Error(`Unexpected path: ${path}`);
}) as unknown as StudyDashboardBackendRequest;

describe("loadStudyDashboardForSession", () => {
  it("loads analytics and documents with one server-side access cookie without serializing the token", async () => {
    const backendRequest = createBackendRequest();
    const cookieStore = createCookieStore("server-cookie-token");

    const result = await loadStudyDashboardForSession({
      backendRequest,
      cookieStore,
      session,
      timestamp: new Date("2026-06-05T10:00:00.000Z")
    });

    expect(result.status).toBe("ready");
    expect(backendRequest).toHaveBeenCalledTimes(2);
    expect(cookieStore.get).toHaveBeenCalledTimes(1);
    expect(backendRequest).toHaveBeenCalledWith(expect.objectContaining({
      accessToken: "server-cookie-token",
      path: "/api/analytics/dashboard"
    }));
    expect(backendRequest).toHaveBeenCalledWith(expect.objectContaining({
      accessToken: "server-cookie-token",
      path: "/api/files/dashboard"
    }));
    expect(JSON.stringify(result)).not.toContain("server-cookie-token");
  });

  it("returns an error without calling Backend when the access cookie is missing", async () => {
    const backendRequest = createBackendRequest();

    const result = await loadStudyDashboardForSession({
      backendRequest,
      cookieStore: createCookieStore(),
      session
    });

    expect(result).toEqual({
      errorMessage: "กรุณาเข้าสู่ระบบอีกครั้ง",
      status: "error"
    });
    expect(backendRequest).not.toHaveBeenCalled();
  });

  it("maps two empty sources into the first-use state", async () => {
    const result = await loadStudyDashboardForSession({
      backendRequest: createBackendRequest({
        analytics: emptyAnalyticsResponse,
        documents: emptyDocumentsResponse
      }),
      cookieStore: createCookieStore("server-cookie-token"),
      session
    });

    expect(result.status).toBe("empty");
  });

  it.each([
    {
      expectedIssue: "documents" as const,
      options: { failDocuments: true },
      unavailableCopy: "ยังไม่สามารถโหลดข้อมูลเอกสารได้ในขณะนี้"
    },
    {
      expectedIssue: "analytics" as const,
      options: { failAnalytics: true },
      unavailableCopy: "ยังไม่สามารถโหลดข้อมูลความคืบหน้าได้ในขณะนี้"
    }
  ])("returns useful $expectedIssue partial state without raw errors", async ({ expectedIssue, options, unavailableCopy }) => {
    const result = await loadStudyDashboardForSession({
      backendRequest: createBackendRequest(options),
      cookieStore: createCookieStore("server-cookie-token"),
      session
    });

    expect(result.status).toBe("partial");
    if (!("dashboard" in result)) throw new Error("Expected a partial dashboard");
    expect(result.dashboard.availability[expectedIssue]).toBe("unavailable");
    expect(result.dashboard.sectionIssues).toContainEqual(expect.objectContaining({
      id: expectedIssue,
      message: unavailableCopy
    }));
    expect(JSON.stringify(result)).not.toMatch(/raw analytics failure|raw documents failure/);
  });

  it("returns one safe Dashboard error when both sources fail", async () => {
    const result = await loadStudyDashboardForSession({
      backendRequest: createBackendRequest({ failAnalytics: true, failDocuments: true }),
      cookieStore: createCookieStore("server-cookie-token"),
      session
    });

    expect(result).toEqual({
      errorMessage: "ไม่สามารถโหลดแดชบอร์ดได้ในขณะนี้",
      status: "error"
    });
    expect(JSON.stringify(result)).not.toMatch(/raw analytics failure|raw documents failure/);
  });
});
