import { describe, expect, it } from "vitest";

import type { AuthSession } from "../auth/types";
import {
  backendChatDocumentsResponse,
  backendChatHistoryResponse,
  backendChatQueryResponse
} from "./aiChatTestData";
import {
  isAiChatSummaryEmpty,
  selectChatDocumentForHistory,
  toDocumentContextChatMessages,
  toAiChatSummaryViewModel
} from "./aiChatMapper";

const session: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Learner One",
    email: "learner@example.com",
    role: "user"
  }
};

describe("AI chat mapper", () => {
  it("maps Backend documents and chat history into the existing view model", () => {
    const chat = toAiChatSummaryViewModel({
      documentsResponse: backendChatDocumentsResponse,
      history: backendChatHistoryResponse,
      session
    });

    expect(chat.workspaceName).toBe("พื้นที่แชทของ Learner One");
    expect(chat.selectedDocumentId).toBe("file-ready");
    expect(chat.documents[0]?.filename).toBe("safety-handbook.pdf");
    expect(chat.documents[0]?.summary).toContain("ทบทวนรายการความปลอดภัย");
    expect(chat.documents[0]?.summary).not.toContain("Review safety checklist");
    expect(chat.messages).toHaveLength(4);
    expect(chat.messages[0]).toMatchObject({
      body: "ควรทบทวนอะไรก่อน",
      role: "learner"
    });
    expect(chat.messages[1]?.citations[0]?.matched_text).toContain("สวมแว่นตานิรภัย");
    expect(chat.metrics.find((metric) => metric.id === "grounded-answers")?.value).toBe("2");
    expect(chat.metrics.map((metric) => metric.label)).toEqual([
      "คำตอบอ้างอิง",
      "เอกสารพร้อมถาม",
      "ประวัติสนทนา"
    ]);
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

  it("maps a document-scoped chat response into learner and assistant messages with citations", () => {
    const messages = toDocumentContextChatMessages({
      document: {
        filename: "safety-handbook.pdf",
        id: "file-ready"
      },
      prompt: "ควรทบทวนอะไรต่อ",
      response: backendChatQueryResponse,
      timestamp: new Date("2026-06-07T12:00:00.000Z")
    });

    expect(messages).toHaveLength(2);
    expect(messages[0]).toMatchObject({
      body: "ควรทบทวนอะไรต่อ",
      id: "history-3-learner",
      role: "learner"
    });
    expect(messages[1]).toMatchObject({
      body: "รายงานเหตุผิดปกติทันทีและแจ้งครูผู้สอน",
      id: "history-3-assistant",
      role: "assistant"
    });
    expect(messages[1]?.citations[0]).toMatchObject({
      chunk_index: 3,
      file_id: "file-ready",
      filename: "safety-handbook.pdf"
    });
  });

  it("localizes known backend sandbox chat copy and citations before showing the conversation", () => {
    const chat = toAiChatSummaryViewModel({
      documentsResponse: {
        ...backendChatDocumentsResponse,
        documents: [
          {
            ...backendChatDocumentsResponse.documents[0],
            summary_markdown:
              "## Overview\nReview safety checklist before entering the lab.\n\n" +
              "## Key Actions\n- Wear goggles\n- Report incidents"
          }
        ]
      },
      history: [
        {
          citations: [
            {
              chunk_index: 1,
              file_id: "file-ready",
              filename: "safety-handbook.pdf",
              matched_text: "Report incidents immediately."
            }
          ],
          file_id: "file-ready",
          id: "history-sandbox",
          query: "ควรทบทวนอะไรก่อน",
          response: "Report incidents immediately and notify the trainer.",
          timestamp: "2026-06-05T09:10:00.000Z"
        }
      ],
      session
    });

    expect(chat.documents[0]?.summary).not.toContain("Review safety checklist");
    expect(chat.documents[0]?.summary).toContain("ทบทวนรายการความปลอดภัย");
    expect(chat.messages[1]?.body).not.toContain("Report incidents");
    expect(chat.messages[1]?.body).toContain("รายงานเหตุผิดปกติทันที");
    expect(chat.messages[1]?.citations[0]?.matched_text).toContain("รายงานเหตุผิดปกติทันที");
    expect(chat.summaryPanel.summary).toContain("รายงานเหตุผิดปกติทันที");
  });
});
