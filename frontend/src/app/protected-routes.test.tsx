import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthSession } from "@/features/auth/types";

const userSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Study User",
    email: "study@example.com",
    role: "user"
  }
};

const requirePageSession = vi.hoisted(() => vi.fn());
const loadStudyDashboardForSession = vi.hoisted(() => vi.fn());
const loadDocumentSummaryForSession = vi.hoisted(() => vi.fn());
const loadAiChatSummaryForSession = vi.hoisted(() => vi.fn());
const loadQuizGeneratorForSession = vi.hoisted(() => vi.fn());
const loadLearningAnalyticsForSession = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/authGuard", () => ({
  requirePageSession
}));

vi.mock("@/features/study-dashboard/studyDashboardApi", () => ({
  loadStudyDashboardForSession
}));

vi.mock("@/features/document-summary/documentSummaryApi", () => ({
  loadDocumentSummaryForSession
}));

vi.mock("@/features/ai-chat/aiChatApi", () => ({
  loadAiChatSummaryForSession
}));

vi.mock("@/features/ai-quiz-generator/quizGeneratorApi", () => ({
  loadQuizGeneratorForSession
}));

vi.mock("@/features/learning-analytics/learningAnalyticsApi", () => ({
  loadLearningAnalyticsForSession
}));

describe("protected app routes", () => {
  beforeEach(() => {
    requirePageSession.mockReset();
    requirePageSession.mockResolvedValue(userSession);

    loadStudyDashboardForSession.mockReset();
    loadStudyDashboardForSession.mockResolvedValue({
      dashboard: {
        apiResponse: {
          average_score: 88,
          completed_quizzes: 7,
          read_documents_count: 4,
          recent_scores: [],
          score_trend: [],
          streak_days: 3
        },
        generatedAtLabel: "5 Jun 2026, 10:00",
        headline: "Study plan ready",
        metrics: [
          {
            helper: "Ready after document processing",
            id: "ready-documents",
            label: "Ready documents",
            value: "4"
          }
        ],
        nextMilestone: "Practice from your latest document",
        onboardingSteps: [],
        primaryAction: {
          description: "Upload a document",
          href: "/documents",
          id: "upload-document",
          title: "Upload first document",
          tone: "primary"
        },
        secondaryActions: [],
        summary: "A single-user study dashboard",
        userName: "Study User"
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

    loadAiChatSummaryForSession.mockReset();
    loadAiChatSummaryForSession.mockResolvedValue({
      chat: {
        chatHistoryEndpoint: "/api/chat/history",
        chatQueryEndpoint: "/api/chat/query",
        documents: [],
        documentsEndpoint: "/api/files/dashboard",
        messages: [],
        metrics: [],
        selectedDocumentId: "",
        suggestedPrompts: [],
        summaryPanel: {
          summary: "",
          takeaways: [],
          title: "Chat Summary"
        },
        workspaceName: "Chat Workspace"
      },
      status: "empty"
    });

    loadQuizGeneratorForSession.mockReset();
    loadQuizGeneratorForSession.mockResolvedValue({
      quiz: {
        capabilities: {
          canGenerateQuiz: true,
          canSubmitAttempt: true
        },
        detailEndpointPattern: "/api/exams/{exam_id}",
        draft: {
          file_id: "",
          generatedAtLabel: "No draft",
          id: "",
          questions: [],
          status: "draft",
          title: "Draft"
        },
        generateEndpoint: "/api/exams/generate",
        instructions: [],
        metrics: [],
        publishEndpointPattern: "/api/exams/{exam_id}/publish",
        request: {
          difficulty: "medium",
          file_id: "",
          num_questions: 5
        },
        selectedSourceId: "",
        sources: [],
        workspaceName: "Quiz Workspace"
      },
      status: "empty"
    });

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
        workspaceName: "Learning Analytics"
      },
      status: "empty"
    });
  });

  it("guards the unified study dashboard route before rendering", async () => {
    const { default: HomePage } = await import("./page");

    render(await HomePage());

    expect(requirePageSession).toHaveBeenCalledWith("/");
    expect(loadStudyDashboardForSession).toHaveBeenCalledWith({
      session: userSession
    });
    expect(screen.getByTestId("study-dashboard")).toHaveAttribute("data-source", "api");
  });

  it("guards the shared quiz route for a normal authenticated session", async () => {
    const { default: QuizPage } = await import("./quiz/page");

    render(await QuizPage());

    expect(requirePageSession).toHaveBeenCalledWith("/quiz");
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
