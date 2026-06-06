import { NextResponse } from "next/server";
import { z } from "zod";

import { AUTH_COOKIE_NAMES } from "../../../../lib/api/authCookies";
import {
  ApiClientError,
  backendJsonRequest,
  mapApiErrorToMessage,
  type BackendJsonRequestOptions
} from "../../../../lib/api/backendClient";
import { assertCsrfSafeRequest } from "../../../../lib/api/csrf";
import {
  EXAM_GENERATE_API_PATH,
  examDetailApiPath,
  examGenerateRequestSchema,
  examPublishApiPath,
  examPublishResponseSchema,
  examResponseSchema,
  examSubmitApiPath,
  examSubmitInputSchema,
  examSubmitResponseSchema,
  examUpdateApiPath,
  examUpdateInputSchema,
  examUpdateResponseSchema,
  quizGenerationInputSchema,
  trainerExamResponseSchema
} from "../../../../features/ai-quiz-generator/quizGeneratorContract";

export type QuizBackendRequest = <TResponse>(
  options: BackendJsonRequestOptions<TResponse>
) => Promise<TResponse>;

type QuizRouteDependencies = {
  allowedOrigins?: readonly string[];
  backendRequest?: QuizBackendRequest;
};

type ExamRouteContext = {
  examId: string;
};

export const createQuizRouteHandlers = ({
  allowedOrigins = getConfiguredAllowedOrigins(),
  backendRequest = backendJsonRequest
}: QuizRouteDependencies = {}) => {
  const assertRequestOrigin = (request: Request) => {
    assertCsrfSafeRequest({
      allowedOrigins,
      host: request.headers.get("host") ?? new URL(request.url).host,
      method: request.method,
      origin: request.headers.get("origin")
    });
  };

  const readAccessToken = (request: Request) => {
    const accessToken = readRequestCookie(request, AUTH_COOKIE_NAMES.accessToken);

    if (!accessToken) {
      throw new ApiClientError({
        code: "unauthorized",
        message: "Missing access token",
        status: 401
      });
    }

    return accessToken;
  };

  return {
    detail: async (request: Request, { examId }: ExamRouteContext) => {
      try {
        const accessToken = readAccessToken(request);
        const exam = await backendRequest({
          accessToken,
          path: examDetailApiPath(examId),
          schema: examResponseSchema
        });

        return createQuizSuccessResponse({ exam });
      } catch (error) {
        return createQuizErrorResponse(error);
      }
    },
    generate: async (request: Request) => {
      try {
        assertRequestOrigin(request);
        const accessToken = readAccessToken(request);
        const input = quizGenerationInputSchema.parse(await readRouteJson(request));
        const body = examGenerateRequestSchema.parse({
          difficulty: input.difficulty,
          file_id: input.fileId,
          instructions: input.instructions,
          num_questions: input.numQuestions
        });
        const exam = await backendRequest({
          accessToken,
          body,
          method: "POST",
          path: EXAM_GENERATE_API_PATH,
          schema: trainerExamResponseSchema
        });

        return createQuizSuccessResponse({ exam });
      } catch (error) {
        return createQuizErrorResponse(error);
      }
    },
    publish: async (request: Request, { examId }: ExamRouteContext) => {
      try {
        assertRequestOrigin(request);
        const accessToken = readAccessToken(request);
        const publishResult = await backendRequest({
          accessToken,
          method: "POST",
          path: examPublishApiPath(examId),
          schema: examPublishResponseSchema
        });

        return createQuizSuccessResponse({ publishResult });
      } catch (error) {
        return createQuizErrorResponse(error);
      }
    },
    submit: async (request: Request, { examId }: ExamRouteContext) => {
      try {
        assertRequestOrigin(request);
        const accessToken = readAccessToken(request);
        const body = examSubmitInputSchema.parse(await readRouteJson(request));
        const submitResult = await backendRequest({
          accessToken,
          body,
          method: "POST",
          path: examSubmitApiPath(examId),
          schema: examSubmitResponseSchema
        });

        return createQuizSuccessResponse({ submitResult });
      } catch (error) {
        return createQuizErrorResponse(error);
      }
    },
    update: async (request: Request, { examId }: ExamRouteContext) => {
      try {
        assertRequestOrigin(request);
        const accessToken = readAccessToken(request);
        const body = examUpdateInputSchema.parse(await readRouteJson(request));
        const exam = await backendRequest({
          accessToken,
          body: body.questions,
          method: "PUT",
          path: examUpdateApiPath(examId),
          schema: examUpdateResponseSchema
        });

        return createQuizSuccessResponse({ exam });
      } catch (error) {
        return createQuizErrorResponse(error);
      }
    }
  };
};

export const quizRouteHandlers = createQuizRouteHandlers();

const createQuizSuccessResponse = (payload: Record<string, unknown>) => {
  return NextResponse.json(
    {
      ...payload,
      ok: true
    },
    { status: 200 }
  );
};

const readRouteJson = async (request: Request): Promise<unknown> => {
  try {
    return await request.json();
  } catch {
    throw new ApiClientError({
      code: "validation_error",
      message: "Invalid JSON body",
      status: 400
    });
  }
};

const readRequestCookie = (request: Request, name: string) => {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) {
    return undefined;
  }

  for (const cookie of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = cookie.trim().split("=");

    if (rawName === name) {
      const value = rawValue.join("=");
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }

  return undefined;
};

const createQuizErrorResponse = (error: unknown) => {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        message: "Quiz request payload is not valid.",
        ok: false
      },
      { status: 400 }
    );
  }

  if (error instanceof ApiClientError) {
    return NextResponse.json(
      {
        message: mapApiErrorToMessage(error),
        ok: false
      },
      { status: error.status ?? (error.code === "csrf_violation" ? 403 : 500) }
    );
  }

  return NextResponse.json(
    {
      message: "Unable to complete the quiz request.",
      ok: false
    },
    { status: 500 }
  );
};

function getConfiguredAllowedOrigins() {
  return (process.env.AI_TUTOR_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}
