import { describe, expect, it, vi } from "vitest";

import { AUTH_COOKIE_NAMES } from "../../lib/api/authCookies";
import { ApiClientError, type BackendJsonRequestOptions } from "../../lib/api/backendClient";
import type { AuthSession } from "../auth/types";
import { backendDashboardResponse } from "./studentDashboardContract.test";
import { loadStudentDashboardForSession, type StudentDashboardBackendRequest } from "./studentDashboardApi";

const studentSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Student Example",
    email: "student@example.com",
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

describe("loadStudentDashboardForSession", () => {
  it("loads /api/analytics/dashboard with the server-side access cookie and current session", async () => {
    const backendRequest = vi.fn(async () => backendDashboardResponse) as unknown as ReturnType<typeof vi.fn> &
      StudentDashboardBackendRequest;

    const result = await loadStudentDashboardForSession({
      backendRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      session: studentSession,
      timestamp: new Date("2026-06-05T10:00:00.000Z")
    });

    expect(result.status).toBe("ready");
    expect(result.dashboard?.learnerName).toBe("Student Example");
    expect(backendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "server-cookie-token",
        path: "/api/analytics/dashboard"
      })
    );
    expect(JSON.stringify(result)).not.toContain("server-cookie-token");
  });

  it("returns an error result without calling Backend when the access cookie is missing", async () => {
    const backendRequest = vi.fn() as unknown as StudentDashboardBackendRequest;

    const result = await loadStudentDashboardForSession({
      backendRequest,
      cookieStore: createCookieStore(),
      session: studentSession
    });

    expect(result.status).toBe("error");
    expect(result.errorMessage).toBeTruthy();
    expect(backendRequest).not.toHaveBeenCalled();
  });

  it("maps empty and backend error responses into UI states", async () => {
    const emptyRequest = vi.fn(async () => ({
      average_score: 0,
      completed_quizzes: 0,
      read_documents_count: 0,
      recent_scores: [],
      score_trend: [],
      streak_days: 0
    })) as unknown as StudentDashboardBackendRequest;

    const emptyResult = await loadStudentDashboardForSession({
      backendRequest: emptyRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      session: studentSession
    });

    expect(emptyResult.status).toBe("empty");

    const failingRequest = vi.fn(
      async (_options: BackendJsonRequestOptions<unknown>) => {
        throw new ApiClientError({
          code: "invalid_response",
          message: "Invalid dashboard response"
        });
      }
    ) as unknown as StudentDashboardBackendRequest;

    const errorResult = await loadStudentDashboardForSession({
      backendRequest: failingRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      session: studentSession
    });

    expect(errorResult.status).toBe("error");
    expect(errorResult.errorMessage).toBeTruthy();
  });
});
