import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthSession } from "@/features/auth/types";
import ChatPage from "./page";

const userSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Study User",
    email: "user@example.com",
    role: "user"
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
    requirePageSession.mockResolvedValue(userSession);
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
      session: userSession
    });
    expect(screen.getByRole("banner")).toHaveTextContent("AI Tutor");
    expect(screen.getByTestId("ai-chat-summary")).toBeInTheDocument();
    expect(screen.getByTestId("ai-chat-summary")).toHaveAttribute("data-source", "api");
  });

  it("passes a documentId query param into the AI chat loader", async () => {
    render(
      await ChatPage({
        searchParams: Promise.resolve({
          documentId: "file-ready"
        })
      })
    );

    expect(loadAiChatSummaryForSession).toHaveBeenCalledWith({
      selectedDocumentId: "file-ready",
      session: userSession
    });
  });
});
