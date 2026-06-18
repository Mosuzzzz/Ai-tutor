import { describe, expect, it } from "vitest";

import { STUDY_DASHBOARD_API_PATH, studyDashboardResponseSchema } from "./studyDashboardContract";

export const backendStudyDashboardResponse = {
  average_score: 86.4,
  completed_quizzes: 3,
  read_documents_count: 5,
  recent_scores: [
    {
      exam_id: "exam-1",
      filename: "คู่มือความปลอดภัยห้องปฏิบัติการ.pdf",
      id: "score-1",
      score: 92,
      submitted_at: "2026-06-05T10:00:00.000Z"
    }
  ],
  score_trend: [
    {
      average_score: 80.5,
      date: "2026-06-04"
    }
  ],
  streak_days: 2
};

describe("study dashboard contract", () => {
  it("keeps the API contract pointed at the learner analytics dashboard endpoint", () => {
    expect(STUDY_DASHBOARD_API_PATH).toBe("/api/analytics/dashboard");
  });

  it("parses the backend dashboard response without exposing role-specific UI fields", () => {
    const parsed = studyDashboardResponseSchema.parse(backendStudyDashboardResponse);

    expect(parsed.completed_quizzes).toBe(3);
    expect(parsed.read_documents_count).toBe(5);
    expect(JSON.stringify(parsed)).not.toContain("roleLabel");
  });
});
