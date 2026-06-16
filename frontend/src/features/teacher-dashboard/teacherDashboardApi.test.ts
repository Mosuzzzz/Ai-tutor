import { describe, expect, it, vi } from "vitest";

import { AUTH_COOKIE_NAMES } from "../../lib/api/authCookies";
import { ApiClientError, type BackendJsonRequestOptions } from "../../lib/api/backendClient";
import type { AuthSession } from "../auth/types";
import {
  backendTeacherDashboardResponse,
  backendTeacherStudentsResponse
} from "./teacherDashboardTestData";
import {
  loadTeacherDashboardForSession,
  type TeacherDashboardBackendRequest
} from "./teacherDashboardApi";

const teacherSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Teacher Example",
    email: "teacher@example.com",
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

describe("loadTeacherDashboardForSession", () => {
  it("loads trainer analytics and student stats with the server-side access cookie", async () => {
    const backendRequest = vi.fn(async ({ path }: BackendJsonRequestOptions<unknown>) => {
      if (path === "/api/analytics/trainer") {
        return backendTeacherDashboardResponse;
      }

      return backendTeacherStudentsResponse;
    }) as unknown as ReturnType<typeof vi.fn> & TeacherDashboardBackendRequest;

    const result = await loadTeacherDashboardForSession({
      backendRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      session: teacherSession,
      timestamp: new Date("2026-06-05T10:00:00.000Z")
    });

    expect(result.status).toBe("ready");
    expect(result.dashboard?.teacherName).toBe("Teacher Example");
    expect(backendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "server-cookie-token",
        path: "/api/analytics/trainer"
      })
    );
    expect(backendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "server-cookie-token",
        path: "/api/analytics/trainer/students"
      })
    );
    expect(JSON.stringify(result)).not.toContain("server-cookie-token");
  });

  it("returns an error without calling Backend when the access cookie is missing", async () => {
    const backendRequest = vi.fn() as unknown as TeacherDashboardBackendRequest;

    const result = await loadTeacherDashboardForSession({
      backendRequest,
      cookieStore: createCookieStore(),
      session: teacherSession
    });

    expect(result.status).toBe("error");
    expect(result.errorMessage).toBeTruthy();
    expect(backendRequest).not.toHaveBeenCalled();
  });

  it("maps empty and invalid Backend responses into UI states", async () => {
    const emptyRequest = vi.fn(async ({ path }: BackendJsonRequestOptions<unknown>) => {
      if (path === "/api/analytics/trainer") {
        return {
          average_tenant_score: 0,
          department_stats: [],
          score_trend: [],
          skill_gaps: [],
          total_employees: 0,
          total_quizzes_taken: 0
        };
      }

      return [];
    }) as unknown as TeacherDashboardBackendRequest;

    const emptyResult = await loadTeacherDashboardForSession({
      backendRequest: emptyRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      session: teacherSession
    });

    expect(emptyResult.status).toBe("empty");

    const failingRequest = vi.fn(async (_options: BackendJsonRequestOptions<unknown>) => {
      throw new ApiClientError({
        code: "invalid_response",
        message: "Invalid teacher analytics response"
      });
    }) as unknown as TeacherDashboardBackendRequest;

    const errorResult = await loadTeacherDashboardForSession({
      backendRequest: failingRequest,
      cookieStore: createCookieStore("server-cookie-token"),
      session: teacherSession
    });

    expect(errorResult.status).toBe("error");
    expect(errorResult.errorMessage).toBeTruthy();
  });
});
