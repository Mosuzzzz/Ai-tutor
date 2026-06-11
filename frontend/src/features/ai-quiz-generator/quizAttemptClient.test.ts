import { describe, expect, it, vi } from "vitest";

import { submitQuizAttempt } from "./quizAttemptClient";
import { backendSubmitExamResponse } from "./quizGeneratorTestData";

describe("quizAttemptClient", () => {
  it("submits selected answers through the same-origin quiz BFF route", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          submitResult: backendSubmitExamResponse
        }),
        {
          headers: {
            "Content-Type": "application/json"
          },
          status: 200
        }
      )
    );

    const result = await submitQuizAttempt(
      {
        answers: {
          "question-1": 0
        },
        examId: "exam/one"
      },
      fetcher
    );

    expect(result).toMatchObject({
      ok: true,
      submitResult: {
        exam_id: "exam-learner",
        score: 100
      }
    });
    expect(fetcher).toHaveBeenCalledWith("/api/quiz/exam%2Fone/submit", {
      body: JSON.stringify({
        answers: {
          "question-1": 0
        }
      }),
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      method: "POST"
    });
  });

  it("returns safe messages for invalid input, backend errors, malformed responses, and network failures", async () => {
    const invalidInput = await submitQuizAttempt({
      answers: {},
      examId: ""
    });

    expect(invalidInput).toEqual({
      message: "ข้อมูลคำตอบสำหรับส่งควิซไม่ถูกต้อง",
      ok: false
    });

    const backendError = await submitQuizAttempt(
      {
        answers: {
          "question-1": 0
        },
        examId: "exam-1"
      },
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            message: "Exam not published",
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

    expect(backendError).toEqual({
      message: "Exam not published",
      ok: false
    });

    const malformedResponse = await submitQuizAttempt(
      {
        answers: {
          "question-1": 0
        },
        examId: "exam-1"
      },
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: true, submitResult: { exam_id: "exam-1" } }), {
          headers: {
            "Content-Type": "application/json"
          },
          status: 200
        })
      )
    );

    expect(malformedResponse).toEqual({
      message: "รูปแบบข้อมูลคะแนนจาก backend ไม่ตรงกับที่ frontend คาดไว้",
      ok: false
    });

    const networkFailure = await submitQuizAttempt(
      {
        answers: {
          "question-1": 0
        },
        examId: "exam-1"
      },
      vi.fn().mockRejectedValue(new Error("offline"))
    );

    expect(networkFailure).toEqual({
      message: "ไม่สามารถส่งคำตอบควิซได้",
      ok: false
    });
  });
});
