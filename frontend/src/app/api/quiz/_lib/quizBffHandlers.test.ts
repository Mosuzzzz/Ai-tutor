import { describe, expect, it, vi } from "vitest";

import { AUTH_COOKIE_NAMES } from "../../../../lib/api/authCookies";
import {
  EXAM_GENERATE_API_PATH,
  examPublishApiPath,
  examSubmitApiPath,
  examUpdateApiPath
} from "../../../../features/ai-quiz-generator/quizGeneratorContract";
import { backendGeneratedExamResponse, backendSubmitExamResponse } from "../../../../features/ai-quiz-generator/quizGeneratorTestData";
import { createQuizRouteHandlers } from "./quizBffHandlers";

const createRequest = ({
  body,
  cookie = "server-cookie-token",
  method = "POST",
  origin = "http://localhost:3000",
  url = "http://localhost:3000/api/quiz/generate"
}: {
  body?: unknown;
  cookie?: string | null;
  method?: string;
  origin?: string | null;
  url?: string;
} = {}) => {
  const headers = new Headers({
    host: "localhost:3000"
  });

  if (origin) {
    headers.set("origin", origin);
  }

  if (cookie) {
    headers.set("cookie", `${AUTH_COOKIE_NAMES.accessToken}=${encodeURIComponent(cookie)}`);
  }

  return new Request(url, {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers,
    method
  });
};

describe("quizBffHandlers", () => {
  it("proxies quiz generation with same-origin guard and HttpOnly cookie token", async () => {
    const backendRequest = vi.fn().mockResolvedValue(backendGeneratedExamResponse);
    const handlers = createQuizRouteHandlers({
      allowedOrigins: [],
      backendRequest
    });

    const response = await handlers.generate(
      createRequest({
        body: {
          difficulty: "medium",
          fileId: "file-ready",
          instructions: "Use scenario-based questions",
          numQuestions: 5
        }
      })
    );

    await expect(response.json()).resolves.toMatchObject({
      exam: {
        id: "exam-1"
      },
      ok: true
    });
    expect(response.status).toBe(200);
    expect(backendRequest).toHaveBeenCalledWith({
      accessToken: "server-cookie-token",
      body: {
        difficulty: "medium",
        file_id: "file-ready",
        instructions: "Use scenario-based questions",
        num_questions: 5
      },
      method: "POST",
      path: EXAM_GENERATE_API_PATH,
      schema: expect.any(Object)
    });
  });

  it("rejects cross-origin generation before reaching Backend", async () => {
    const backendRequest = vi.fn();
    const handlers = createQuizRouteHandlers({
      allowedOrigins: [],
      backendRequest
    });

    const response = await handlers.generate(
      createRequest({
        body: {
          difficulty: "medium",
          fileId: "file-ready",
          numQuestions: 5
        },
        origin: "https://evil.example.com"
      })
    );

    expect(response.status).toBe(403);
    expect(backendRequest).not.toHaveBeenCalled();
  });

  it("returns unauthorized when the cookie token is missing", async () => {
    const backendRequest = vi.fn();
    const handlers = createQuizRouteHandlers({
      backendRequest
    });

    const response = await handlers.generate(
      createRequest({
        body: {
          difficulty: "medium",
          fileId: "file-ready",
          numQuestions: 5
        },
        cookie: null
      })
    );

    expect(response.status).toBe(401);
    expect(backendRequest).not.toHaveBeenCalled();
  });

  it("proxies update, publish, and submit actions through Backend paths", async () => {
    const backendRequest = vi
      .fn()
      .mockResolvedValueOnce(backendGeneratedExamResponse)
      .mockResolvedValueOnce({ id: "exam-1", status: "published" })
      .mockResolvedValueOnce(backendSubmitExamResponse);
    const handlers = createQuizRouteHandlers({
      backendRequest
    });

    const updateResponse = await handlers.update(
      createRequest({
        body: {
          questions: backendGeneratedExamResponse.questions
        },
        method: "PUT",
        url: "http://localhost:3000/api/quiz/exam-1"
      }),
      {
        examId: "exam-1"
      }
    );
    const publishResponse = await handlers.publish(
      createRequest({
        body: {},
        url: "http://localhost:3000/api/quiz/exam-1/publish"
      }),
      {
        examId: "exam-1"
      }
    );
    const submitResponse = await handlers.submit(
      createRequest({
        body: {
          answers: {
            "question-1": 0
          }
        },
        url: "http://localhost:3000/api/quiz/exam-1/submit"
      }),
      {
        examId: "exam-1"
      }
    );

    expect(updateResponse.status).toBe(200);
    expect(publishResponse.status).toBe(200);
    expect(submitResponse.status).toBe(200);
    expect(backendRequest).toHaveBeenNthCalledWith(1, {
      accessToken: "server-cookie-token",
      body: backendGeneratedExamResponse.questions,
      method: "PUT",
      path: examUpdateApiPath("exam-1"),
      schema: expect.any(Object)
    });
    expect(backendRequest).toHaveBeenNthCalledWith(2, {
      accessToken: "server-cookie-token",
      method: "POST",
      path: examPublishApiPath("exam-1"),
      schema: expect.any(Object)
    });
    expect(backendRequest).toHaveBeenNthCalledWith(3, {
      accessToken: "server-cookie-token",
      body: {
        answers: {
          "question-1": 0
        }
      },
      method: "POST",
      path: examSubmitApiPath("exam-1"),
      schema: expect.any(Object)
    });
  });
});
