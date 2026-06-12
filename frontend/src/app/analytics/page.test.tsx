import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthSession } from "@/features/auth/types";
import AnalyticsPage from "./page";

const studentSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Student One",
    email: "student@example.com",
    role: "student"
  }
};

const requirePageSession = vi.hoisted(() => vi.fn());
const loadLearningAnalyticsForSession = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/authGuard", () => ({
  requirePageSession
}));

vi.mock("@/features/learning-analytics/learningAnalyticsApi", () => ({
  loadLearningAnalyticsForSession
}));

describe("analytics route", () => {
  beforeEach(() => {
    requirePageSession.mockReset();
    requirePageSession.mockResolvedValue(studentSession);
    loadLearningAnalyticsForSession.mockReset();
    loadLearningAnalyticsForSession.mockResolvedValue({
      analytics: {
        activities: [],
        apiResponse: {
          average_tenant_score: 0,
          department_stats: [],
          score_trend: [],
          skill_gaps: [],
          total_employees: 0,
          total_quizzes_taken: 0
        },
        generatedAtLabel: "5 Jun 2026, 10:00",
        learnerAnalyticsEndpoint: "/api/analytics/dashboard",
        recentScores: [],
        trainerAnalyticsEndpoint: "/api/analytics/trainer",
        workspaceName: "Learner One"
      },
      status: "empty"
    });
  });

  it("renders API-backed learning analytics inside the app shell", async () => {
    render(await AnalyticsPage());

    expect(requirePageSession).toHaveBeenCalledWith("/analytics");
    expect(loadLearningAnalyticsForSession).toHaveBeenCalledWith({
      session: studentSession
    });
    expect(screen.getByRole("banner")).toHaveTextContent("AI Tutor");
    expect(screen.getByTestId("learning-analytics")).toBeInTheDocument();
    expect(screen.getByTestId("learning-analytics")).toHaveAttribute("data-source", "api");
  });
});
