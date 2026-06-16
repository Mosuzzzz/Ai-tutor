import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthSession } from "@/features/auth/types";
import { aiQuizGeneratorMock } from "@/features/ai-quiz-generator/quizGeneratorData";
import QuizPage from "./page";

const userSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Study User",
    email: "user@example.com",
    role: "user"
  }
};

const requirePageSession = vi.hoisted(() => vi.fn());
const loadQuizGeneratorForSession = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/authGuard", () => ({
  requirePageSession
}));

vi.mock("@/features/ai-quiz-generator/quizGeneratorApi", () => ({
  loadQuizGeneratorForSession
}));

describe("quiz route", () => {
  beforeEach(() => {
    requirePageSession.mockReset();
    requirePageSession.mockResolvedValue(userSession);
    loadQuizGeneratorForSession.mockReset();
    loadQuizGeneratorForSession.mockResolvedValue({
      quiz: aiQuizGeneratorMock,
      status: "ready"
    });
  });

  it("renders the AI quiz generator feature inside the app shell with API data", async () => {
    render(await QuizPage());

    expect(requirePageSession).toHaveBeenCalledWith("/quiz");
    expect(loadQuizGeneratorForSession).toHaveBeenCalledWith({
      session: userSession
    });
    expect(screen.getByRole("banner")).toHaveTextContent("AI Tutor");
    expect(screen.getByRole("main")).toContainElement(screen.getByTestId("ai-quiz-generator"));
    expect(screen.getByTestId("ai-quiz-generator")).toHaveAttribute("data-source", "api");
  });

  it("passes a documentId query param into the quiz generator loader", async () => {
    render(
      await QuizPage({
        searchParams: Promise.resolve({
          documentId: "file-ready"
        })
      })
    );

    expect(loadQuizGeneratorForSession).toHaveBeenCalledWith({
      selectedDocumentId: "file-ready",
      session: userSession
    });
  });

  it("passes an examId query param into the quiz generator loader for published quiz attempts", async () => {
    render(
      await QuizPage({
        searchParams: Promise.resolve({
          examId: "exam-learner"
        })
      })
    );

    expect(loadQuizGeneratorForSession).toHaveBeenCalledWith({
      selectedExamId: "exam-learner",
      session: userSession
    });
  });
});
