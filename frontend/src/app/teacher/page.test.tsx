import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthSession } from "@/features/auth/types";
import TeacherPage from "./page";

const teacherSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Teacher One",
    email: "teacher@example.com",
    role: "teacher"
  }
};

const requirePageSession = vi.hoisted(() => vi.fn());
const loadTeacherDashboardForSession = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/authGuard", () => ({
  requirePageSession
}));

vi.mock("@/features/teacher-dashboard/teacherDashboardApi", () => ({
  loadTeacherDashboardForSession
}));

describe("teacher dashboard route", () => {
  beforeEach(() => {
    requirePageSession.mockReset();
    requirePageSession.mockResolvedValue(teacherSession);
    loadTeacherDashboardForSession.mockReset();
    loadTeacherDashboardForSession.mockResolvedValue({
      dashboard: {
        apiResponse: {
          activities: [],
          classes: [],
          completion_rate: 0.825,
          generated_quizzes: 18,
          quizzes: [],
          reviewed_documents: 7,
          total_students: 42
        },
        generatedAtLabel: "5 มิ.ย. 2569 17:00",
        teacherName: "Teacher One"
      },
      status: "ready"
    });
  });

  it("renders the API-backed teacher dashboard inside the app shell", async () => {
    render(await TeacherPage());

    expect(requirePageSession).toHaveBeenCalledWith("/teacher");
    expect(loadTeacherDashboardForSession).toHaveBeenCalledWith({
      session: teacherSession
    });
    expect(screen.getByRole("banner")).toHaveTextContent("AI Tutor");
    expect(screen.getByRole("main")).toHaveTextContent("แดชบอร์ดครู");
    expect(screen.getByRole("main")).toHaveTextContent("42");
    expect(screen.getByTestId("teacher-dashboard")).toHaveAttribute("data-source", "api");
  });

  it("renders teacher dashboard errors inside the protected app shell", async () => {
    loadTeacherDashboardForSession.mockResolvedValue({
      errorMessage: "ไม่สามารถโหลดแดชบอร์ดครูได้",
      status: "error"
    });

    render(await TeacherPage());

    expect(requirePageSession).toHaveBeenCalledWith("/teacher");
    expect(screen.getByRole("alert")).toHaveTextContent("ไม่สามารถโหลดแดชบอร์ดครูได้");
  });
});
