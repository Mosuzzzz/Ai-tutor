import { z } from "zod";

import {
  examSubmitInputSchema,
  examSubmitResponseSchema,
  type ExamSubmitResponse
} from "./quizGeneratorContract";
import type { QuizAttemptAnswerMap } from "./types";

type QuizAttemptFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

type QuizAttemptInput = {
  answers: QuizAttemptAnswerMap;
  examId: string;
};

export type QuizAttemptSubmitResult =
  | {
      ok: true;
      submitResult: ExamSubmitResponse;
    }
  | {
      message: string;
      ok: false;
    };

const quizAttemptInputSchema = z.object({
  answers: examSubmitInputSchema.shape.answers.refine((answers) => Object.keys(answers).length > 0),
  examId: z.string().trim().min(1)
});

const quizAttemptSuccessSchema = z.object({
  ok: z.literal(true),
  submitResult: examSubmitResponseSchema
});

const quizAttemptFailureSchema = z.object({
  message: z.string().min(1),
  ok: z.literal(false)
});

const quizAttemptResponseSchema = z.union([quizAttemptSuccessSchema, quizAttemptFailureSchema]);

export const submitQuizAttempt = async (
  input: QuizAttemptInput,
  fetcher: QuizAttemptFetch = globalThis.fetch
): Promise<QuizAttemptSubmitResult> => {
  const parsedInput = quizAttemptInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      message: "ข้อมูลคำตอบสำหรับส่งควิซไม่ถูกต้อง",
      ok: false
    };
  }

  try {
    const response = await fetcher(`/api/quiz/${encodeURIComponent(parsedInput.data.examId)}/submit`, {
      body: JSON.stringify({
        answers: parsedInput.data.answers
      }),
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      method: "POST"
    });
    const payload = await readJsonBody(response);
    const parsedResponse = quizAttemptResponseSchema.safeParse(payload);

    if (parsedResponse.success) {
      return parsedResponse.data;
    }

    return {
      message: response.ok
        ? "รูปแบบข้อมูลคะแนนจาก backend ไม่ตรงกับที่ frontend คาดไว้"
        : extractMessage(payload) ?? "ไม่สามารถส่งคำตอบควิซได้",
      ok: false
    };
  } catch {
    return {
      message: "ไม่สามารถส่งคำตอบควิซได้",
      ok: false
    };
  }
};

const readJsonBody = async (response: Response): Promise<unknown> => {
  const text = await response.text();

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
};

const extractMessage = (payload: unknown) => {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = payload.message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return undefined;
};
