import { describe, expect, it, vi } from "vitest";

import { AUTH_COOKIE_NAMES } from "../../lib/api/authCookies";
import { ApiClientError } from "../../lib/api/backendClient";
import type { AuthSession } from "../auth/types";
import { DOCUMENTS_DASHBOARD_API_PATH } from "../document-summary/documentSummaryContract";
import {
  examDetailApiPath,
  trainerExamResponseSchema
} from "./quizGeneratorContract";
import { loadQuizGeneratorForSession } from "./quizGeneratorApi";
import {
  backendGeneratedExamResponse,
  backendQuizDocumentsResponse
} from "./quizGeneratorTestData";

const teacherSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Teacher One",
    email: "teacher@example.com",
    role: "user"
  }
};

const cookieStore = (token?: string) => ({
  get: (name: string) =>
    name === AUTH_COOKIE_NAMES.accessToken && token
      ? {
          value: token
        }
      : undefined
});

describe("quizGeneratorApi", () => {
  it("loads quiz sources from Backend with the server-side access cookie", async () => {
    const backendRequest = vi.fn().mockResolvedValue(backendQuizDocumentsResponse);

    const result = await loadQuizGeneratorForSession({
      backendRequest,
      cookieStore: cookieStore("server-cookie-token"),
      session: teacherSession
    });

    expect(result.status).toBe("ready");
    expect(backendRequest).toHaveBeenCalledWith({
      accessToken: "server-cookie-token",
      path: DOCUMENTS_DASHBOARD_API_PATH,
      schema: expect.any(Object)
    });
    expect("quiz" in result ? result.quiz.selectedSourceId : "").toBe("file-ready");
  });

  it("loads selected exam detail when an exam id is provided", async () => {
    const backendRequest = vi
      .fn()
      .mockResolvedValueOnce(backendQuizDocumentsResponse)
      .mockResolvedValueOnce(trainerExamResponseSchema.parse(backendGeneratedExamResponse));

    const result = await loadQuizGeneratorForSession({
      backendRequest,
      cookieStore: cookieStore("server-cookie-token"),
      selectedExamId: "exam-1",
      session: teacherSession
    });

    expect(result.status).toBe("ready");
    expect(backendRequest).toHaveBeenNthCalledWith(2, {
      accessToken: "server-cookie-token",
      path: examDetailApiPath("exam-1"),
      schema: expect.any(Object)
    });
    expect("quiz" in result ? result.quiz.draft.id : "").toBe("exam-1");
  });

  it("returns empty state without fetching exam detail when no ready source exists", async () => {
    const backendRequest = vi.fn().mockResolvedValue({
      ...backendQuizDocumentsResponse,
      documents: [],
      total_documents: 0
    });

    const result = await loadQuizGeneratorForSession({
      backendRequest,
      cookieStore: cookieStore("server-cookie-token"),
      selectedExamId: "exam-1",
      session: teacherSession
    });

    expect(result.status).toBe("empty");
    expect(backendRequest).toHaveBeenCalledTimes(1);
  });

  it("does not call Backend when the HttpOnly access cookie is missing", async () => {
    const backendRequest = vi.fn();

    const result = await loadQuizGeneratorForSession({
      backendRequest,
      cookieStore: cookieStore(),
      session: teacherSession
    });

    expect(result.status).toBe("error");
    expect("errorMessage" in result ? result.errorMessage : "").toBeTruthy();
    expect(backendRequest).not.toHaveBeenCalled();
  });

  it("maps Backend and invalid response failures into a safe error state", async () => {
    const backendRequest = vi.fn().mockRejectedValue(
      new ApiClientError({
        code: "invalid_response",
        message: "Bad exam shape"
      })
    );

    const result = await loadQuizGeneratorForSession({
      backendRequest,
      cookieStore: cookieStore("server-cookie-token"),
      session: teacherSession
    });

    expect(result.status).toBe("error");
    expect("errorMessage" in result ? result.errorMessage : "").toBeTruthy();
  });
});
