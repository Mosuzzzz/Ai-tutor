import { describe, expect, it, vi } from "vitest";

import { AUTH_COOKIE_NAMES } from "../../lib/api/authCookies";
import { ApiClientError, type BackendJsonRequestOptions } from "../../lib/api/backendClient";
import {
  backendAdminUsageResponse,
  backendAuditLogsResponse,
  backendLearnerAnalyticsResponse,
  backendTrainerAnalyticsResponse,
  backendTrainerStudentsResponse,
  globalAdminAnalyticsSession,
  learnerAnalyticsSession,
  tenantAdminAnalyticsSession,
  trainerAnalyticsSession
} from "./learningAnalyticsTestData";
import {
  loadLearningAnalyticsForSession,
  type LearningAnalyticsBackendRequest
} from "./learningAnalyticsApi";

const createCookieStore = (token?: string) => ({
  get: (name: string) =>
    name === AUTH_COOKIE_NAMES.accessToken && token
      ? {
          value: token
        }
      : undefined
});

const createAnalyticsBackendRequest = () =>
  vi.fn(async ({ path }: BackendJsonRequestOptions<unknown>) => {
    if (path === "/api/analytics/dashboard") {
      return backendLearnerAnalyticsResponse;
    }

    if (path === "/api/analytics/trainer") {
      return backendTrainerAnalyticsResponse;
    }

    if (path === "/api/analytics/trainer/students") {
      return backendTrainerStudentsResponse;
    }

    if (path === "/api/analytics/usage?days=30") {
      return backendAdminUsageResponse;
    }

    if (path === "/api/analytics/audit-logs") {
      return backendAuditLogsResponse;
    }

    throw new Error(`Unexpected path ${path}`);
  }) as unknown as ReturnType<typeof vi.fn> & LearningAnalyticsBackendRequest;

describe("loadLearningAnalyticsForSession", () => {
  it("loads learner analytics with the server-side access cookie", async () => {
    const backendRequest = createAnalyticsBackendRequest();

    const result = await loadLearningAnalyticsForSession({
      backendRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      session: learnerAnalyticsSession,
      timestamp: new Date("2026-06-05T10:00:00.000Z")
    });

    expect(result.status).toBe("ready");
    expect("analytics" in result ? result.analytics.workspaceName : "").toBe("Learner One");
    expect(backendRequest).toHaveBeenCalledTimes(1);
    expect(backendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "server-cookie-token",
        path: "/api/analytics/dashboard"
      })
    );
    expect(JSON.stringify(result)).not.toContain("server-cookie-token");
  });

  it("loads trainer analytics and students without requesting admin audit logs for teacher role", async () => {
    const backendRequest = createAnalyticsBackendRequest();

    const result = await loadLearningAnalyticsForSession({
      backendRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      session: trainerAnalyticsSession
    });

    expect(result.status).toBe("ready");
    expect(backendRequest).toHaveBeenCalledTimes(2);
    expect(backendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/api/analytics/trainer"
      })
    );
    expect(backendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/api/analytics/trainer/students"
      })
    );
    expect(backendRequest).not.toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/api/analytics/audit-logs"
      })
    );
  });

  it("loads tenant admin trainer analytics plus audit logs", async () => {
    const backendRequest = createAnalyticsBackendRequest();

    const result = await loadLearningAnalyticsForSession({
      backendRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      session: tenantAdminAnalyticsSession
    });

    expect(result.status).toBe("ready");
    expect(backendRequest).toHaveBeenCalledTimes(3);
    expect(backendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/api/analytics/audit-logs"
      })
    );
  });

  it("loads global admin usage and audit logs without calling trainer-only endpoints", async () => {
    const backendRequest = createAnalyticsBackendRequest();

    const result = await loadLearningAnalyticsForSession({
      backendRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      session: globalAdminAnalyticsSession
    });

    expect(result.status).toBe("ready");
    expect("analytics" in result ? result.analytics.apiResponse.total_employees : 0).toBe(128);
    expect(backendRequest).toHaveBeenCalledTimes(2);
    expect(backendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/api/analytics/usage?days=30"
      })
    );
    expect(backendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/api/analytics/audit-logs"
      })
    );
    expect(backendRequest).not.toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/api/analytics/trainer"
      })
    );
  });

  it("returns an error without calling Backend when the access cookie is missing", async () => {
    const backendRequest = createAnalyticsBackendRequest();

    const result = await loadLearningAnalyticsForSession({
      backendRequest,
      cookieStore: createCookieStore(),
      session: learnerAnalyticsSession
    });

    expect(result.status).toBe("error");
    expect("errorMessage" in result ? result.errorMessage : "").toBeTruthy();
    expect(backendRequest).not.toHaveBeenCalled();
  });

  it("maps empty and Backend failures into safe UI states", async () => {
    const emptyRequest = vi.fn(async () => ({
      average_score: 0,
      completed_quizzes: 0,
      read_documents_count: 0,
      recent_activity: [],
      recent_scores: [],
      score_trend: [],
      skill_breakdown: [],
      streak_days: 0
    })) as unknown as ReturnType<typeof vi.fn> & LearningAnalyticsBackendRequest;

    const emptyResult = await loadLearningAnalyticsForSession({
      backendRequest: emptyRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      session: learnerAnalyticsSession
    });

    expect(emptyResult.status).toBe("empty");

    const failingRequest = vi.fn(async () => {
      throw new ApiClientError({
        code: "invalid_response",
        message: "Invalid analytics response"
      });
    }) as unknown as ReturnType<typeof vi.fn> & LearningAnalyticsBackendRequest;

    const errorResult = await loadLearningAnalyticsForSession({
      backendRequest: failingRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      session: learnerAnalyticsSession
    });

    expect(errorResult.status).toBe("error");
    expect("errorMessage" in errorResult ? errorResult.errorMessage : "").toBeTruthy();
  });
});
