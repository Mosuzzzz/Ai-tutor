import { describe, expect, it, vi } from "vitest";

import { publishQuizDraft } from "./quizPublishClient";

describe("publishQuizDraft", () => {
  it("publishes a draft through the same-origin quiz BFF route", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          publishResult: {
            id: "exam-1",
            status: "published"
          }
        }),
        {
          headers: {
            "Content-Type": "application/json"
          },
          status: 200
        }
      )
    );

    const result = await publishQuizDraft("exam/one", fetcher);

    expect(fetcher).toHaveBeenCalledWith("/api/quiz/exam%2Fone/publish", {
      credentials: "same-origin",
      headers: {
        Accept: "application/json"
      },
      method: "POST"
    });
    expect(result).toEqual({
      ok: true,
      status: "published"
    });
  });

  it("returns a safe message for invalid draft id and backend errors", async () => {
    const invalidInput = await publishQuizDraft(" ");

    expect(invalidInput).toEqual({
      message: "ยังไม่มีแบบร่างควิซสำหรับเผยแพร่",
      ok: false
    });

    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "Only trainers can publish this exam.",
          ok: false
        }),
        {
          headers: {
            "Content-Type": "application/json"
          },
          status: 403
        }
      )
    );

    const backendError = await publishQuizDraft("exam-1", fetcher);

    expect(backendError).toEqual({
      message: "Only trainers can publish this exam.",
      ok: false
    });
  });
});
