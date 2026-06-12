import { describe, expect, it } from "vitest";

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
  isLearningAnalyticsResponseEmpty,
  toLearningAnalyticsViewModel
} from "./learningAnalyticsMapper";

const timestamp = new Date("2026-06-05T10:00:00.000Z");

describe("learning analytics mapper", () => {
  it("maps learner dashboard analytics into the shared learning analytics view model", () => {
    const analytics = toLearningAnalyticsViewModel({
      learner: backendLearnerAnalyticsResponse,
      session: learnerAnalyticsSession,
      timestamp
    });

    expect(analytics.workspaceName).toBe("Learner One");
    expect(analytics.apiResponse.total_employees).toBe(1);
    expect(analytics.apiResponse.average_tenant_score).toBe(86.4);
    expect(analytics.apiResponse.total_quizzes_taken).toBe(8);
    expect(analytics.apiResponse.skill_gaps).toEqual([
      expect.objectContaining({
        error_rate: 9,
        incorrect_count: 1,
        topic: "Laboratory Safety.pdf",
        total_attempts: 3
      }),
      expect.objectContaining({
        error_rate: 26,
        incorrect_count: 1,
        topic: "Citation Practice.pdf",
        total_attempts: 2
      })
    ]);
    expect(analytics.apiResponse.department_stats).toEqual([
      { label: "completed_quizzes", value: 8 },
      { label: "read_documents_count", value: 5 },
      { label: "streak_days", value: 4 }
    ]);
    expect(analytics.recentScores).toEqual([
      expect.objectContaining({
        examHref: "/quiz?examId=exam-1",
        examId: "exam-1",
        filename: "Laboratory Safety.pdf",
        id: "score-1",
        scorePercent: 92
      })
    ]);
    expect(analytics.activities[0]).toMatchObject({
      actorLabel: "Learner One",
      id: "learner-activity-0",
      type: "quiz"
    });
    expect(JSON.stringify(analytics)).not.toContain("learner@example.com");
    expect(JSON.stringify(analytics)).not.toContain("user_id");
  });

  it("maps trainer analytics with student activity without leaking user ids in the view model", () => {
    const analytics = toLearningAnalyticsViewModel({
      session: trainerAnalyticsSession,
      students: backendTrainerStudentsResponse,
      timestamp,
      trainer: backendTrainerAnalyticsResponse
    });

    expect(analytics.workspaceName).toBe("Trainer One");
    expect(analytics.apiResponse.total_employees).toBe(42);
    expect(analytics.apiResponse.skill_gaps[0]?.topic).toBe("Citation reasoning");
    expect(analytics.recentScores).toEqual([]);
    expect(analytics.activities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorLabel: "Learner One",
          id: "trainer-student-0",
          scorePercent: 91,
          type: "quiz"
        }),
        expect.objectContaining({
          actorLabel: "learner-two@example.com",
          id: "trainer-student-1"
        })
      ])
    );
    expect(JSON.stringify(analytics)).not.toContain("learner-1");
    expect(JSON.stringify(analytics)).not.toContain("learner-2");
  });

  it("adds tenant admin audit activity only when audit logs are provided", () => {
    const analytics = toLearningAnalyticsViewModel({
      auditLogs: backendAuditLogsResponse,
      session: tenantAdminAnalyticsSession,
      students: backendTrainerStudentsResponse,
      timestamp,
      trainer: backendTrainerAnalyticsResponse
    });

    expect(analytics.activities[0]).toMatchObject({
      actorLabel: "teacher@example.com",
      id: "audit-0",
      type: "document"
    });
    expect(JSON.stringify(analytics)).not.toContain("203.0.113.10");
  });

  it("maps global admin usage and audit logs without calling trainer-only analytics", () => {
    const analytics = toLearningAnalyticsViewModel({
      auditLogs: backendAuditLogsResponse,
      session: globalAdminAnalyticsSession,
      timestamp,
      usage: backendAdminUsageResponse
    });

    expect(analytics.workspaceName).toBe("Global Admin");
    expect(analytics.apiResponse.total_employees).toBe(128);
    expect(analytics.apiResponse.total_quizzes_taken).toBe(34);
    expect(analytics.apiResponse.department_stats).toEqual([
      { label: "usage_days", value: 30 },
      { label: "audit_events", value: 2 }
    ]);
    expect(analytics.apiResponse.skill_gaps).toEqual([]);
    expect(analytics.activities).toHaveLength(2);
    expect(analytics.recentScores).toEqual([]);
  });

  it("detects empty analytics for learner, trainer, and admin payload groups", () => {
    expect(
      isLearningAnalyticsResponseEmpty({
        learner: {
          ...backendLearnerAnalyticsResponse,
          average_score: 0,
          completed_quizzes: 0,
          read_documents_count: 0,
          recent_activity: [],
          recent_scores: [],
          score_trend: [],
          skill_breakdown: [],
          streak_days: 0
        }
      })
    ).toBe(true);

    expect(
      isLearningAnalyticsResponseEmpty({
        students: [],
        trainer: {
          average_tenant_score: 0,
          department_stats: [],
          score_trend: [],
          skill_gaps: [],
          total_employees: 0,
          total_quizzes_taken: 0
        }
      })
    ).toBe(true);

    expect(
      isLearningAnalyticsResponseEmpty({
        auditLogs: [],
        usage: {
          days: 30,
          total_logins: 0,
          total_uploads: 0
        }
      })
    ).toBe(true);
  });
});
