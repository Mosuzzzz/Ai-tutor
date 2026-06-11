import { describe, expect, it, vi } from "vitest";

import { submitDocumentChatQuestion } from "./aiChatQueryClient";
import { backendChatQueryResponse } from "./aiChatTestData";

describe("aiChatQueryClient", () => {
  it("posts document-scoped chat questions to the BFF with same-origin credentials", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          chat: backendChatQueryResponse,
          message: "ส่งคำถามถึง AI สำเร็จ",
          ok: true
        }),
        {
          headers: {
            "Content-Type": "application/json"
          },
          status: 200
        }
      )
    );

    const result = await submitDocumentChatQuestion(
      {
        fileId: "file-ready",
        prompt: "ควรทบทวนอะไรต่อจากเอกสารนี้"
      },
      fetcher
    );

    expect(result).toMatchObject({
      chat: {
        chat_history_id: "history-3"
      },
      ok: true
    });
    expect(fetcher).toHaveBeenCalledWith("/api/chat/query", {
      body: JSON.stringify({
        fileId: "file-ready",
        prompt: "ควรทบทวนอะไรต่อจากเอกสารนี้"
      }),
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      method: "POST"
    });
  });

  it("maps invalid input, backend errors, and invalid responses to safe messages", async () => {
    const invalidInputResult = await submitDocumentChatQuestion(
      {
        fileId: "file-ready",
        prompt: ""
      },
      vi.fn()
    );
    const backendErrorResult = await submitDocumentChatQuestion(
      {
        fileId: "file-ready",
        prompt: "ถามจากเอกสารนี้"
      },
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            message: "Document is not ready for chat.",
            ok: false
          }),
          {
            headers: {
              "Content-Type": "application/json"
            },
            status: 400
          }
        )
      )
    );
    const invalidResponseResult = await submitDocumentChatQuestion(
      {
        fileId: "file-ready",
        prompt: "ถามจากเอกสารนี้"
      },
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ chat: { chat_history_id: "missing-fields" }, ok: true }), {
          headers: {
            "Content-Type": "application/json"
          },
          status: 200
        })
      )
    );

    expect(invalidInputResult).toEqual({
      message: "ข้อมูลคำถามไม่ถูกต้อง",
      ok: false
    });
    expect(backendErrorResult).toEqual({
      message: "Document is not ready for chat.",
      ok: false
    });
    expect(invalidResponseResult).toEqual({
      message: "รูปแบบข้อมูลจาก backend ไม่ตรงกับที่ frontend คาดไว้",
      ok: false
    });
  });
});
