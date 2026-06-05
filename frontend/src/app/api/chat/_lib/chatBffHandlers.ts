import { NextResponse } from "next/server";
import { z } from "zod";

import {
  CHAT_QUERY_API_PATH,
  chatQueryInputSchema,
  chatQueryResponseSchema
} from "../../../../features/ai-chat/aiChatContract";
import { AUTH_COOKIE_NAMES } from "../../../../lib/api/authCookies";
import {
  ApiClientError,
  backendJsonRequest,
  mapApiErrorToMessage,
  type BackendJsonRequestOptions
} from "../../../../lib/api/backendClient";
import { assertCsrfSafeRequest } from "../../../../lib/api/csrf";

export type ChatBackendRequest = <TResponse>(
  options: BackendJsonRequestOptions<TResponse>
) => Promise<TResponse>;

type ChatRouteDependencies = {
  allowedOrigins?: readonly string[];
  backendRequest?: ChatBackendRequest;
};

export const createChatRouteHandlers = ({
  allowedOrigins = getConfiguredAllowedOrigins(),
  backendRequest = backendJsonRequest
}: ChatRouteDependencies = {}) => {
  const assertRequestOrigin = (request: Request) => {
    assertCsrfSafeRequest({
      allowedOrigins,
      host: request.headers.get("host") ?? new URL(request.url).host,
      method: request.method,
      origin: request.headers.get("origin")
    });
  };

  return {
    query: async (request: Request) => {
      try {
        assertRequestOrigin(request);
        const accessToken = readRequestCookie(request, AUTH_COOKIE_NAMES.accessToken);

        if (!accessToken) {
          return createChatErrorResponse(
            new ApiClientError({
              code: "unauthorized",
              message: "Missing access token",
              status: 401
            })
          );
        }

        const input = chatQueryInputSchema.parse(await readRouteJson(request));
        const chat = await backendRequest({
          accessToken,
          body: {
            file_id: input.fileId,
            prompt: input.prompt
          },
          method: "POST",
          path: CHAT_QUERY_API_PATH,
          schema: chatQueryResponseSchema
        });

        return NextResponse.json(
          {
            chat,
            message: "ส่งคำถามถึง AI สำเร็จ",
            ok: true
          },
          { status: 200 }
        );
      } catch (error) {
        return createChatErrorResponse(error);
      }
    }
  };
};

export const chatRouteHandlers = createChatRouteHandlers();

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

const createChatErrorResponse = (error: unknown) => {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        message: "ข้อมูลคำถามไม่ถูกต้อง",
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
      message: "ไม่สามารถส่งคำถามถึง AI ได้",
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
