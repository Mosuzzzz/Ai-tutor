import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthSession } from "@/features/auth/types";
import ChatPage from "./page";

const studentSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Student One",
    email: "student@example.com",
    role: "student"
  }
};

const chatSummary = {
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
};

const requirePageSession = vi.hoisted(() => vi.fn());
const loadAiChatSummaryForSession = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/authGuard", () => ({
  requirePageSession
}));

vi.mock("@/features/ai-chat/aiChatApi", () => ({
  loadAiChatSummaryForSession
}));

describe("chat route", () => {
  beforeEach(() => {
    requirePageSession.mockReset();
    requirePageSession.mockResolvedValue(studentSession);
    loadAiChatSummaryForSession.mockReset();
    loadAiChatSummaryForSession.mockResolvedValue({
      chat: chatSummary,
      status: "empty"
    });
  });

  it("renders the API-backed AI chat and summary feature inside the app shell", async () => {
    render(await ChatPage());

    expect(requirePageSession).toHaveBeenCalledWith("/chat");
    expect(loadAiChatSummaryForSession).toHaveBeenCalledWith({
      session: studentSession
    });
    expect(screen.getByRole("banner")).toHaveTextContent("AI Tutor");
    expect(screen.getByTestId("ai-chat-summary")).toBeInTheDocument();
    expect(screen.getByTestId("ai-chat-summary")).toHaveAttribute("data-source", "api");
  });
});
