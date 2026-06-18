import { describe, expect, it, vi } from "vitest";

import { AUTH_COOKIE_NAMES } from "../../lib/api/authCookies";
import { ApiClientError, type BackendJsonRequestOptions } from "../../lib/api/backendClient";
import type { AuthSession } from "../auth/types";
import { loadStudyDashboardForSession, type StudyDashboardBackendRequest } from "./studyDashboardApi";
import { backendStudyDashboardResponse } from "./studyDashboardContract.test";

const session: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Siwakorn bundi",
    email: "siwakorn@example.com",
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

describe("loadStudyDashboardForSession", () => {
  it("loads /api/analytics/dashboard with the server-side access cookie only", async () => {
    const backendRequest = vi.fn(async () => backendStudyDashboardResponse) as unknown as ReturnType<typeof vi.fn> &
      StudyDashboardBackendRequest;

    const result = await loadStudyDashboardForSession({
      backendRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      session,
      timestamp: new Date("2026-06-05T10:00:00.000Z")
    });

    expect(result.status).toBe("ready");
    expect(result.dashboard?.userName).toBe("Siwakorn bundi");
    expect(backendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "server-cookie-token",
        path: "/api/analytics/dashboard"
      })
    );
    expect(JSON.stringify(result)).not.toContain("server-cookie-token");
  });

  it("returns an error result without calling backend when the access cookie is missing", async () => {
    const backendRequest = vi.fn() as unknown as StudyDashboardBackendRequest;

    const result = await loadStudyDashboardForSession({
      backendRequest,
      cookieStore: createCookieStore(),
      session
    });

    expect(result.status).toBe("error");
    expect(result.errorMessage).toBeTruthy();
    expect(backendRequest).not.toHaveBeenCalled();
  });

  it("maps empty and invalid backend responses into UI-safe states", async () => {
    const emptyRequest = vi.fn(async () => ({
      average_score: 0,
      completed_quizzes: 0,
      read_documents_count: 0,
      recent_scores: [],
      score_trend: [],
      streak_days: 0
    })) as unknown as StudyDashboardBackendRequest;

    const emptyResult = await loadStudyDashboardForSession({
      backendRequest: emptyRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      session
    });

    expect(emptyResult.status).toBe("empty");

    const failingRequest = vi.fn(
      async (_options: BackendJsonRequestOptions<unknown>) => {
        throw new ApiClientError({
          code: "invalid_response",
          message: "Invalid dashboard response"
        });
      }
    ) as unknown as StudyDashboardBackendRequest;

    const errorResult = await loadStudyDashboardForSession({
      backendRequest: failingRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      session
    });

    expect(errorResult.status).toBe("error");
    expect(errorResult.errorMessage).toBeTruthy();
  });
});
