import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthSession } from "@/features/auth/types";

const studentSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Student One",
    email: "student@example.com",
    role: "student"
  }
};

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
const loadStudentDashboardForSession = vi.hoisted(() => vi.fn());
const loadTeacherDashboardForSession = vi.hoisted(() => vi.fn());
const loadDocumentSummaryForSession = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/authGuard", () => ({
  requirePageSession
}));

vi.mock("@/features/student-dashboard/studentDashboardApi", () => ({
  loadStudentDashboardForSession
}));

vi.mock("@/features/teacher-dashboard/teacherDashboardApi", () => ({
  loadTeacherDashboardForSession
}));

vi.mock("@/features/document-summary/documentSummaryApi", () => ({
  loadDocumentSummaryForSession
}));

describe("protected app routes", () => {
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
    loadTeacherDashboardForSession.mockReset();
    loadTeacherDashboardForSession.mockResolvedValue({
      dashboard: {
        apiResponse: {
          activities: [],
          classes: [],
          completion_rate: 0.82,
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
    loadDocumentSummaryForSession.mockReset();
    loadDocumentSummaryForSession.mockResolvedValue({
      dashboard: {
        apiEndpoint: "/api/files/dashboard",
        apiResponse: {
          documents: [],
          status_counts: {
            error: 0,
            pending: 0,
            processing: 0,
            ready: 0
          },
          total_documents: 0
        },
        detailEndpointPattern: "/api/files/{file_id}/detail",
        documentDetails: [],
        generatedAtLabel: "5 Jun 2026, 10:00",
        recapEndpointPattern: "/api/recap/{file_id}",
        selectedDocumentId: "",
        workspaceName: "Document Workspace"
      },
      status: "empty"
    });
  });

  it("guards the student dashboard route before rendering", async () => {
    const { default: HomePage } = await import("./page");

    render(await HomePage());

    expect(requirePageSession).toHaveBeenCalledWith("/");
    expect(screen.getByRole("main")).toHaveTextContent("แดชบอร์ดผู้เรียน");
  });

  it("guards teacher-only routes with a teacher session", async () => {
    requirePageSession.mockResolvedValue(teacherSession);
    const { default: TeacherPage } = await import("./teacher/page");
    const { default: QuizPage } = await import("./quiz/page");

    render(await TeacherPage());
    render(await QuizPage());

    expect(requirePageSession).toHaveBeenCalledWith("/teacher");
    expect(requirePageSession).toHaveBeenCalledWith("/quiz");
    expect(screen.getByTestId("teacher-dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("ai-quiz-generator")).toBeInTheDocument();
  });

  it("guards document, chat, analytics, courses, and settings routes", async () => {
    const { default: DocumentsPage } = await import("./documents/page");
    const { default: ChatPage } = await import("./chat/page");
    const { default: AnalyticsPage } = await import("./analytics/page");
    const { default: CoursesPage } = await import("./courses/page");
    const { default: SettingsPage } = await import("./settings/page");

    render(await DocumentsPage());
    render(await ChatPage());
    render(await AnalyticsPage());
    render(await CoursesPage());
    render(await SettingsPage());

    expect(requirePageSession).toHaveBeenCalledWith("/documents");
    expect(requirePageSession).toHaveBeenCalledWith("/chat");
    expect(requirePageSession).toHaveBeenCalledWith("/analytics");
    expect(requirePageSession).toHaveBeenCalledWith("/courses");
    expect(requirePageSession).toHaveBeenCalledWith("/settings");
  });
});
