import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthSession } from "@/features/auth/types";
import HomePage from "./page";

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
const loadStudentDashboardForSession = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/authGuard", () => ({
  requirePageSession
}));

vi.mock("@/features/student-dashboard/studentDashboardApi", () => ({
  loadStudentDashboardForSession
}));

describe("Student dashboard page", () => {
  beforeEach(() => {
    requirePageSession.mockReset();
    requirePageSession.mockResolvedValue(studentSession);
    loadStudentDashboardForSession.mockReset();
    loadStudentDashboardForSession.mockResolvedValue({
      dashboard: {
        apiResponse: {
          average_score: 88,
          completed_quizzes: 7,
          read_documents_count: 4,
          recent_scores: [],
          score_trend: [],
          streak_days: 3
        },
        assistantPrompts: [],
        continueLearning: [],
        generatedAtLabel: "5 มิ.ย. 2569 10:00",
        learnerName: "Student One",
        nextMilestone: "เริ่มเรียนจากเอกสารแรกของคุณ",
        roleLabel: "ผู้เรียน"
      },
      status: "ready"
    });
  });

  it("renders the AI Tutor shell with the API-ready student dashboard", async () => {
    render(await HomePage());

    expect(requirePageSession).toHaveBeenCalledWith("/");
    expect(loadStudentDashboardForSession).toHaveBeenCalledWith({
      session: studentSession
    });
    expect(screen.getByRole("banner")).toHaveTextContent("AI Tutor");
    expect(screen.getByRole("main")).toHaveTextContent("แดชบอร์ดผู้เรียน");
    expect(screen.getByRole("main")).toHaveTextContent("7");
    expect(screen.getByRole("main")).toHaveTextContent("88%");
    expect(screen.getByTestId("student-dashboard")).toHaveAttribute("data-source", "api");
  });

  it("renders dashboard error state inside the protected app shell", async () => {
    loadStudentDashboardForSession.mockResolvedValue({
      errorMessage: "ไม่สามารถโหลดแดชบอร์ดผู้เรียนได้",
      status: "error"
    });

    render(await HomePage());

    expect(requirePageSession).toHaveBeenCalledWith("/");
    expect(screen.getByRole("alert")).toHaveTextContent("ไม่สามารถโหลดแดชบอร์ดผู้เรียนได้");
  });
});
