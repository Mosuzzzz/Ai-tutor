import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ChatPage from "./page";

describe("chat route", () => {
  it("renders the AI chat and summary feature inside the app shell", () => {
    render(<ChatPage />);

    expect(screen.getByRole("banner")).toHaveTextContent("AI Tutor");
    expect(screen.getByRole("main")).toHaveTextContent("แชท AI กับเอกสาร");
    expect(screen.getByTestId("ai-chat-summary")).toBeInTheDocument();
  });
});
