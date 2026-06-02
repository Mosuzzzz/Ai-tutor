import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import QuizPage from "./page";

describe("quiz route", () => {
  it("renders the AI quiz generator feature inside the app shell", () => {
    render(<QuizPage />);

    expect(screen.getByRole("banner")).toHaveTextContent("AI Tutor");
    expect(screen.getByRole("main")).toHaveTextContent("สร้างควิซด้วย AI");
    expect(screen.getByTestId("ai-quiz-generator")).toBeInTheDocument();
  });
});
