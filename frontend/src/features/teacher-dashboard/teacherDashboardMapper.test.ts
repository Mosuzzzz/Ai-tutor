import { describe, expect, it } from "vitest";

import type { AuthSession } from "../auth/types";
import {
  backendTeacherDashboardResponse,
  backendTeacherStudentsResponse
} from "./teacherDashboardTestData";
import {
  isTeacherDashboardResponseEmpty,
  toTeacherDashboardViewModel
} from "./teacherDashboardMapper";

const teacherSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Teacher Example",
    email: "teacher@example.com",
    role: "user"
  }
};

const emptyTeacherDashboardResponse = {
  average_tenant_score: 0,
  department_stats: [],
  score_trend: [],
  skill_gaps: [],
  total_employees: 0,
  total_quizzes_taken: 0
};

describe("teacher dashboard mapper", () => {
  it("maps Backend trainer metrics and students into the teacher dashboard view model", () => {
    const dashboard = toTeacherDashboardViewModel({
      dashboard: backendTeacherDashboardResponse,
      session: teacherSession,
      students: backendTeacherStudentsResponse,
      timestamp: new Date("2026-06-05T10:00:00.000Z")
    });

    expect(dashboard.teacherName).toBe("Teacher Example");
    expect(dashboard.generatedAtLabel).toContain("5 มิ.ย. 2569");
    expect(dashboard.apiResponse).toMatchObject({
      completion_rate: 0.825,
      generated_quizzes: 18,
      reviewed_documents: 7,
      total_students: 42
    });
    expect(dashboard.apiResponse.classes[0]).toMatchObject({
      averageScore: 91.5,
      subject: "mai@example.com",
      title: "ไหม ศึกษา"
    });
    expect(dashboard.apiResponse.quizzes[0]).toMatchObject({
      averageScore: 62,
      source: "Average score on this document is 62% across submitted quizzes.",
      title: "AI Safety Handbook.pdf"
    });
  });

  it("falls back to the teacher email and learner email when display names are unavailable", () => {
    const dashboard = toTeacherDashboardViewModel({
      dashboard: backendTeacherDashboardResponse,
      session: {
        ...teacherSession,
        user: {
          ...teacherSession.user,
          displayName: null
        }
      },
      students: backendTeacherStudentsResponse,
      timestamp: new Date("2026-06-05T10:00:00.000Z")
    });

    expect(dashboard.teacherName).toBe("teacher@example.com");
    expect(dashboard.apiResponse.classes[1]?.title).toBe("unknown@example.com");
  });

  it("detects empty teacher analytics across dashboard and student list responses", () => {
    expect(
      isTeacherDashboardResponseEmpty({
        dashboard: emptyTeacherDashboardResponse,
        students: []
      })
    ).toBe(true);
    expect(
      isTeacherDashboardResponseEmpty({
        dashboard: backendTeacherDashboardResponse,
        students: backendTeacherStudentsResponse
      })
    ).toBe(false);
  });
});
