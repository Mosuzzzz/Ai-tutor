import { describe, expect, it, vi } from "vitest";

import { generateQuizDraft } from "./quizGenerationClient";
import { backendGeneratedExamResponse } from "./quizGeneratorTestData";

describe("quizGenerationClient", () => {
  it("posts quiz generation requests to the BFF with same-origin credentials", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          exam: backendGeneratedExamResponse,
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

    const result = await generateQuizDraft(
      {
        difficulty: "medium",
        fileId: "file-ready",
        instructions: "Use scenario questions",
        numQuestions: 5
      },
      fetcher
    );

    expect(result).toMatchObject({
      exam: {
        id: "exam-1"
      },
      ok: true
    });
    expect(fetcher).toHaveBeenCalledWith("/api/quiz/generate", {
      body: JSON.stringify({
        difficulty: "medium",
        fileId: "file-ready",
        instructions: "Use scenario questions",
        numQuestions: 5
      }),
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      method: "POST"
    });
  });

  it("maps validation, backend, and malformed response errors into safe messages", async () => {
    const invalidInputResult = await generateQuizDraft(
      {
        difficulty: "medium",
        fileId: "",
        numQuestions: 5
      },
      vi.fn()
    );
    const backendErrorResult = await generateQuizDraft(
      {
        difficulty: "medium",
        fileId: "file-ready",
        numQuestions: 5
      },
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            message: "File is not ready for quiz generation.",
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
    const invalidResponseResult = await generateQuizDraft(
      {
        difficulty: "medium",
        fileId: "file-ready",
        numQuestions: 5
      },
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ exam: { id: "missing-fields" }, ok: true }), {
          headers: {
            "Content-Type": "application/json"
          },
          status: 200
        })
      )
    );

    expect(invalidInputResult).toEqual({
      message: "ข้อมูลสำหรับสร้างควิซไม่ถูกต้อง",
      ok: false
    });
    expect(backendErrorResult).toEqual({
      message: "File is not ready for quiz generation.",
      ok: false
    });
    expect(invalidResponseResult).toEqual({
      message: "รูปแบบข้อมูลจาก backend ไม่ตรงกับที่ frontend คาดไว้",
      ok: false
    });
  });
});
