import { describe, expect, it } from "vitest";

import { studentDashboardResponseSchema } from "./studentDashboardContract";

export const backendDashboardResponse = {
  average_score: 86.4,
  completed_quizzes: 3,
  read_documents_count: 5,
  recent_activity: [
    {
      id: "activity-1",
      occurred_at: "2026-06-05T09:00:00.000Z",
      title: "Uploaded a document",
      type: "document"
    }
  ],
  recent_scores: [
    {
      exam_id: "exam-1",
      filename: "safety-manual.pdf",
      id: "score-1",
      score: 91,
      submitted_at: "2026-06-05T08:30:00.000Z"
    }
  ],
  score_trend: [
    {
      average_score: 80.5,
      date: "2026-06-04"
    }
  ],
  skill_breakdown: [
    {
      attempts: 2,
      average_score: 78.5,
      file_id: "file-1",
      filename: "safety-manual.pdf"
    }
  ],
  streak_days: 2
};

describe("studentDashboardResponseSchema", () => {
  it("validates the learner dashboard contract returned by Backend", () => {
    expect(studentDashboardResponseSchema.parse(backendDashboardResponse)).toMatchObject({
      average_score: 86.4,
      completed_quizzes: 3,
      recent_scores: [
        {
          filename: "safety-manual.pdf",
          score: 91
        }
      ],
      score_trend: [
        {
          average_score: 80.5,
          date: "2026-06-04"
        }
      ]
    });
  });

  it("rejects malformed dashboard payloads before they reach the UI", () => {
    expect(() =>
      studentDashboardResponseSchema.parse({
        ...backendDashboardResponse,
        average_score: "86"
      })
    ).toThrow();
  });
});
