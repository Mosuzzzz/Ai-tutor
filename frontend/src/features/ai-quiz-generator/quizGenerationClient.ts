import { z } from "zod";

import {
  quizGenerationInputSchema,
  trainerExamResponseSchema,
  type QuizGenerationInput,
  type TrainerExamResponse
} from "./quizGeneratorContract";

type QuizGenerationFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type QuizGenerationResult =
  | {
      exam: TrainerExamResponse;
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

const quizGenerationSuccessSchema = z.object({
  exam: trainerExamResponseSchema,
  ok: z.literal(true)
});

const quizGenerationFailureSchema = z.object({
  message: z.string().min(1),
  ok: z.literal(false)
});

const quizGenerationResponseSchema = z.union([quizGenerationSuccessSchema, quizGenerationFailureSchema]);

export const generateQuizDraft = async (
  input: QuizGenerationInput,
  fetcher: QuizGenerationFetch = globalThis.fetch
): Promise<QuizGenerationResult> => {
  const parsedInput = quizGenerationInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      message: "ข้อมูลสำหรับสร้างควิซไม่ถูกต้อง",
      ok: false
    };
  }

  try {
    const response = await fetcher("/api/quiz/generate", {
      body: JSON.stringify(parsedInput.data),
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      method: "POST"
    });
    const payload = await readJsonBody(response);
    const parsedResponse = quizGenerationResponseSchema.safeParse(payload);

    if (parsedResponse.success) {
      return parsedResponse.data;
    }

    return {
      message: response.ok
        ? "รูปแบบข้อมูลจาก backend ไม่ตรงกับที่ frontend คาดไว้"
        : extractMessage(payload) ?? "ไม่สามารถสร้างควิซได้",
      ok: false
    };
  } catch {
    return {
      message: "ไม่สามารถสร้างควิซได้",
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
