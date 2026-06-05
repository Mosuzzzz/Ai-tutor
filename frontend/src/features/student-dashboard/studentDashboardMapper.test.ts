import { describe, expect, it } from "vitest";

import type { AuthSession } from "../auth/types";
import { backendDashboardResponse } from "./studentDashboardContract.test";
import {
  isStudentDashboardResponseEmpty,
  toStudentDashboardViewModel
} from "./studentDashboardMapper";

const studentSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Student Example",
    email: "student@example.com",
    role: "student"
  }
};

const emptyDashboardResponse = {
  average_score: 0,
  completed_quizzes: 0,
  read_documents_count: 0,
  recent_scores: [],
  score_trend: [],
  streak_days: 0
};

describe("student dashboard mapper", () => {
  it("maps backend metrics to a student-facing view model scoped to the current session", () => {
    const dashboard = toStudentDashboardViewModel({
      response: backendDashboardResponse,
      session: studentSession,
      timestamp: new Date("2026-06-05T10:00:00.000Z")
    });

    expect(dashboard.learnerName).toBe("Student Example");
    expect(dashboard.roleLabel).toBe("ผู้เรียน");
    expect(dashboard.generatedAtLabel).toContain("5 มิ.ย. 2569");
    expect(dashboard.apiResponse).toMatchObject({
      average_score: 86.4,
      completed_quizzes: 3,
      read_documents_count: 5,
      streak_days: 2
    });
    expect(dashboard.apiResponse.score_trend[0]).toMatchObject({
      average_score: 80.5,
      id: "trend-2026-06-04"
    });
  });

  it("falls back to the session email when display name is unavailable", () => {
    const dashboard = toStudentDashboardViewModel({
      response: backendDashboardResponse,
      session: {
        ...studentSession,
        user: {
          ...studentSession.user,
          displayName: null
        }
      },
      timestamp: new Date("2026-06-05T10:00:00.000Z")
    });

    expect(dashboard.learnerName).toBe("student@example.com");
  });

  it("identifies an empty learner dashboard response from real API data", () => {
    expect(isStudentDashboardResponseEmpty(emptyDashboardResponse)).toBe(true);
    expect(isStudentDashboardResponseEmpty(backendDashboardResponse)).toBe(false);
  });
});
