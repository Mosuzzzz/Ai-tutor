import { z } from "zod";

import {
  chatQueryInputSchema,
  chatQueryResponseSchema,
  type ChatQueryInput,
  type ChatQueryResponse
} from "./aiChatContract";

type AiChatQueryFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type AiChatQueryResult =
  | {
      chat: ChatQueryResponse;
      message: string;
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

const chatQuerySuccessSchema = z.object({
  chat: chatQueryResponseSchema,
  message: z.string().min(1),
  ok: z.literal(true)
});

const chatQueryFailureSchema = z.object({
  message: z.string().min(1),
  ok: z.literal(false)
});

const chatQueryRouteResponseSchema = z.union([chatQuerySuccessSchema, chatQueryFailureSchema]);

export const submitDocumentChatQuestion = async (
  input: ChatQueryInput,
  fetcher: AiChatQueryFetch = globalThis.fetch
): Promise<AiChatQueryResult> => {
  const parsedInput = chatQueryInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      message: "ข้อมูลคำถามไม่ถูกต้อง",
      ok: false
    };
  }

  try {
    const response = await fetcher("/api/chat/query", {
      body: JSON.stringify(parsedInput.data),
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      method: "POST"
    });
    const payload = await readJsonBody(response);
    const parsedResponse = chatQueryRouteResponseSchema.safeParse(payload);

    if (parsedResponse.success) {
      return parsedResponse.data;
    }

    return {
      message: response.ok
        ? "รูปแบบข้อมูลจาก backend ไม่ตรงกับที่ frontend คาดไว้"
        : extractMessage(payload) ?? "ไม่สามารถส่งคำถามถึง AI ได้",
      ok: false
    };
  } catch {
    return {
      message: "ไม่สามารถส่งคำถามถึง AI ได้",
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
