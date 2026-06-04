import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthSession } from "@/features/auth/types";
import QuizPage from "./page";

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

vi.mock("@/features/auth/authGuard", () => ({
  requirePageSession
}));

describe("quiz route", () => {
  beforeEach(() => {
    requirePageSession.mockReset();
    requirePageSession.mockResolvedValue(teacherSession);
  });

  it("renders the AI quiz generator feature inside the app shell", async () => {
    render(await QuizPage());

    expect(requirePageSession).toHaveBeenCalledWith("/quiz");
    expect(screen.getByRole("banner")).toHaveTextContent("AI Tutor");
    expect(screen.getByRole("main")).toHaveTextContent("สร้างควิซด้วย AI");
    expect(screen.getByTestId("ai-quiz-generator")).toBeInTheDocument();
  });
});
