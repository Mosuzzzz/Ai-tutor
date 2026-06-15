import { z } from "zod";

import { examPublishResponseSchema, type ExamResponse } from "./quizGeneratorContract";

type QuizPublishFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type QuizPublishResult =
  | {
      ok: true;
      status: ExamResponse["status"];
    }
  | {
      message: string;
      ok: false;
    };

const quizPublishSuccessSchema = z.object({
  ok: z.literal(true),
  publishResult: examPublishResponseSchema
});

const quizPublishFailureSchema = z.object({
  message: z.string().min(1),
  ok: z.literal(false)
});

const quizPublishResponseSchema = z.union([quizPublishSuccessSchema, quizPublishFailureSchema]);

export const publishQuizDraft = async (
  examId: string,
  fetcher: QuizPublishFetch = globalThis.fetch
): Promise<QuizPublishResult> => {
  const normalizedExamId = examId.trim();

  if (!normalizedExamId) {
    return {
      message: "ยังไม่มีแบบร่างควิซสำหรับเผยแพร่",
      ok: false
    };
  }

  try {
    const response = await fetcher(`/api/quiz/${encodeURIComponent(normalizedExamId)}/publish`, {
      credentials: "same-origin",
      headers: {
        Accept: "application/json"
      },
      method: "POST"
    });
    const payload = await readJsonBody(response);
    const parsedResponse = quizPublishResponseSchema.safeParse(payload);

    if (parsedResponse.success) {
      if (parsedResponse.data.ok) {
        return {
          ok: true,
          status: parsedResponse.data.publishResult.status
        };
      }

      return parsedResponse.data;
    }

    return {
      message: response.ok
        ? "รูปแบบข้อมูลเผยแพร่ควิซจาก backend ไม่ตรงกับที่ frontend คาดไว้"
        : extractMessage(payload) ?? "ไม่สามารถเผยแพร่ควิซได้",
      ok: false
    };
  } catch {
    return {
      message: "ไม่สามารถเผยแพร่ควิซได้",
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
