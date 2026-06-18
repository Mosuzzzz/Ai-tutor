import { describe, expect, it } from "vitest";

import type { AuthSession } from "../auth/types";
import { backendStudyDashboardResponse } from "./studyDashboardContract.test";
import { isStudyDashboardResponseEmpty, toStudyDashboardViewModel } from "./studyDashboardMapper";

const session: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Siwakorn bundi",
    email: "siwakorn@example.com",
    role: "user"
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

describe("study dashboard mapper", () => {
  it("maps backend data into a single-user study dashboard without role labels", () => {
    const dashboard = toStudyDashboardViewModel({
      response: backendStudyDashboardResponse,
      session,
      timestamp: new Date("2026-06-05T10:00:00.000Z")
    });

    expect(dashboard.userName).toBe("Siwakorn bundi");
    expect(dashboard.generatedAtLabel).toContain("5 มิ.ย. 2569");
    expect(dashboard.headline).toBe("แผนทบทวนของคุณพร้อมแล้ว");
    expect(dashboard.apiResponse).toMatchObject({
      average_score: 86.4,
      completed_quizzes: 3,
      read_documents_count: 5,
      streak_days: 2
    });
    expect(JSON.stringify(dashboard)).not.toContain("ผู้เรียน");
    expect(JSON.stringify(dashboard)).not.toContain("ครู");
  });

  it("builds an intentional empty state from real API data", () => {
    const dashboard = toStudyDashboardViewModel({
      response: emptyDashboardResponse,
      session,
      timestamp: new Date("2026-06-05T10:00:00.000Z")
    });

    expect(isStudyDashboardResponseEmpty(emptyDashboardResponse)).toBe(true);
    expect(isStudyDashboardResponseEmpty(backendStudyDashboardResponse)).toBe(false);
    expect(dashboard.headline).toBe("ยังไม่มีข้อมูลการเรียน");
    expect(dashboard.primaryAction.href).toBe("/documents");
  });
});
