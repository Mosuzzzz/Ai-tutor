import { describe, expect, it } from "vitest";

import type { AuthSession } from "../auth/types";
import {
  backendChatDocumentsResponse,
  backendChatHistoryResponse
} from "./aiChatTestData";
import {
  isAiChatSummaryEmpty,
  selectChatDocumentForHistory,
  toAiChatSummaryViewModel
} from "./aiChatMapper";

const session: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Learner One",
    email: "learner@example.com",
    role: "student"
  }
};

describe("AI chat mapper", () => {
  it("maps Backend documents and chat history into the existing view model", () => {
    const chat = toAiChatSummaryViewModel({
      documentsResponse: backendChatDocumentsResponse,
      history: backendChatHistoryResponse,
      session
    });

    expect(chat.workspaceName).toBe("Learner One's AI chat workspace");
    expect(chat.selectedDocumentId).toBe("file-ready");
    expect(chat.documents[0]?.filename).toBe("safety-handbook.pdf");
    expect(chat.documents[0]?.summary).toContain("Review safety checklist");
    expect(chat.messages).toHaveLength(4);
    expect(chat.messages[0]).toMatchObject({
      body: "What should I review first?",
      role: "learner"
    });
    expect(chat.messages[1]?.citations[0]?.matched_text).toContain("Wear goggles");
    expect(chat.metrics.find((metric) => metric.id === "grounded-answers")?.value).toBe("2");
    expect(JSON.stringify(chat)).not.toContain("learner@example.com");
  });

  it("detects empty chat sources and selects ready documents first", () => {
    expect(
      isAiChatSummaryEmpty({
        documents: [],
        status_counts: {
          error: 0,
          pending: 0,
          processing: 0,
          ready: 0
        },
        total_documents: 0
      })
    ).toBe(true);

    expect(selectChatDocumentForHistory(backendChatDocumentsResponse)?.id).toBe("file-ready");
    expect(selectChatDocumentForHistory(backendChatDocumentsResponse, "file-processing")?.id).toBe("file-ready");
  });
});
