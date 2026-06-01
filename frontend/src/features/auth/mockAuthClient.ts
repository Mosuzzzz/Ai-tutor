import { AUTH_MESSAGES } from "./authContent";
import type { AuthSubmissionResult, LoginInput, RegisterValues } from "./types";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const submitMockLogin = async (input: LoginInput): Promise<AuthSubmissionResult> => {
  return {
    ok: true,
    message: AUTH_MESSAGES.loginSuccess,
    session: {
      mode: "http-only-cookie",
      storesTokenInClient: false,
      user: {
        email: normalizeEmail(input.email),
        role: "student"
      }
    }
  };
};

export const submitMockRegister = async (input: RegisterValues): Promise<AuthSubmissionResult> => {
  return {
    ok: true,
    message: AUTH_MESSAGES.registerSuccess,
    session: {
      mode: "http-only-cookie",
      storesTokenInClient: false,
      user: {
        displayName: input.fullName.trim(),
        email: normalizeEmail(input.email),
        role: input.role
      }
    }
  };
};
