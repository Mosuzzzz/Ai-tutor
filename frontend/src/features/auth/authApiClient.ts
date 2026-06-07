import { z } from "zod";

import { AUTH_MESSAGES } from "./authContent";
import type { AuthSubmissionResult, LoginInput, RegisterValues } from "./types";

type AuthFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

const authRouteRoleSchema = z.enum(["student", "teacher", "tenant_admin", "global_admin"]);

const authSessionSchema = z.object({
  mode: z.literal("http-only-cookie"),
  storesTokenInClient: z.literal(false),
  user: z.object({
    displayName: z.string().nullable().optional(),
    email: z.email(),
    role: authRouteRoleSchema
  })
});

const authSuccessSchema = z.object({
  email: z.email().optional(),
  message: z.string().min(1),
  ok: z.literal(true),
  requiresEmailVerification: z.boolean().optional(),
  session: authSessionSchema.optional(),
  verifiedInDevelopment: z.boolean().optional()
});

const authFailureSchema = z.object({
  message: z.string().min(1),
  ok: z.literal(false)
});

const authResponseSchema = z.union([authSuccessSchema, authFailureSchema]);

export const submitLogin = async (
  input: LoginInput,
  fetcher: AuthFetch = globalThis.fetch
): Promise<AuthSubmissionResult> => {
  return authJsonRequest("/api/auth/login", "POST", input, fetcher);
};

export const submitRegister = async (
  input: RegisterValues,
  fetcher: AuthFetch = globalThis.fetch
): Promise<AuthSubmissionResult> => {
  return authJsonRequest("/api/auth/register", "POST", input, fetcher);
};

export const getAuthSession = async (fetcher: AuthFetch = globalThis.fetch): Promise<AuthSubmissionResult> => {
  return authJsonRequest("/api/auth/session", "GET", undefined, fetcher);
};

export const refreshSession = async (fetcher: AuthFetch = globalThis.fetch): Promise<AuthSubmissionResult> => {
  return authJsonRequest("/api/auth/refresh", "POST", undefined, fetcher);
};

export const logout = async (fetcher: AuthFetch = globalThis.fetch): Promise<AuthSubmissionResult> => {
  return authJsonRequest("/api/auth/logout", "POST", undefined, fetcher);
};

const authJsonRequest = async (
  path: string,
  method: "GET" | "POST",
  body: unknown,
  fetcher: AuthFetch
): Promise<AuthSubmissionResult> => {
  try {
    const response = await fetcher(path, {
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" })
      },
      method
    });

    const payload = await readJsonBody(response);
    const parsed = authResponseSchema.safeParse(payload);

    if (parsed.success) {
      return parsed.data;
    }

    return {
      ok: false,
      message: response.ok ? AUTH_MESSAGES.genericError : extractMessage(payload) ?? AUTH_MESSAGES.genericError
    };
  } catch {
    return {
      ok: false,
      message: AUTH_MESSAGES.genericError
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
