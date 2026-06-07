import { NextResponse } from "next/server";
import { z } from "zod";

import { AUTH_MESSAGES } from "../../../../features/auth/authContent";
import { toAuthSession } from "../../../../features/auth/sessionMapping";
import {
  authActionResponseSchema,
  mapFrontendRoleToBackendRole,
  sessionResponseSchema,
  tokenResponseSchema,
  type SessionResponse,
  type TokenResponse
} from "../../../../lib/api/authContract";
import {
  AUTH_COOKIE_NAMES,
  createAccessTokenCookie,
  createExpiredAuthCookies,
  createRefreshTokenCookie,
  toNextCookieOptions
} from "../../../../lib/api/authCookies";
import {
  ApiClientError,
  backendJsonRequest,
  mapApiErrorToMessage,
  type BackendJsonRequestOptions
} from "../../../../lib/api/backendClient";
import { assertCsrfSafeRequest } from "../../../../lib/api/csrf";

export type AuthBackendRequest = <TResponse>(
  options: BackendJsonRequestOptions<TResponse>
) => Promise<TResponse>;

type AuthRouteDependencies = {
  allowedOrigins?: readonly string[];
  backendRequest?: AuthBackendRequest;
  enableDevEmailVerification?: boolean;
};

const frontendRoleSchema = z.enum(["student", "teacher"]);

const loginRouteInputSchema = z.object({
  email: z.email(),
  password: z.string().min(1)
});

const registerRouteInputSchema = z.object({
  acceptedTerms: z.literal(true),
  email: z.email(),
  fullName: z.string().trim().min(1),
  password: z.string().min(8),
  role: frontendRoleSchema
});

const DEV_EMAIL_VERIFIED_MESSAGE = "สมัครสมาชิกและยืนยันอีเมลสำหรับ local dev แล้ว กรุณาเข้าสู่ระบบ";

export const createAuthRouteHandlers = ({
  allowedOrigins = getConfiguredAllowedOrigins(),
  backendRequest = backendJsonRequest,
  enableDevEmailVerification = process.env.NODE_ENV !== "production"
}: AuthRouteDependencies = {}) => {
  const assertRequestOrigin = (request: Request) => {
    assertCsrfSafeRequest({
      allowedOrigins,
      host: request.headers.get("host") ?? new URL(request.url).host,
      method: request.method,
      origin: request.headers.get("origin")
    });
  };

  return {
    login: async (request: Request) => {
      try {
        assertRequestOrigin(request);
        const input = loginRouteInputSchema.parse(await readRouteJson(request));
        const token = await backendRequest({
          body: input,
          method: "POST",
          path: "/api/auth/login",
          schema: tokenResponseSchema
        });
        const session = await backendRequest({
          accessToken: token.access_token,
          path: "/api/auth/session",
          schema: sessionResponseSchema
        });
        const response = createSessionResponse(AUTH_MESSAGES.loginSuccess, session);
        setTokenCookies(response, token);

        return response;
      } catch (error) {
        return createAuthErrorResponse(error);
      }
    },

    logout: async (request: Request) => {
      try {
        assertRequestOrigin(request);
        const accessToken = readRequestCookie(request, AUTH_COOKIE_NAMES.accessToken);

        if (accessToken) {
          await backendRequest({
            accessToken,
            method: "POST",
            path: "/api/auth/logout",
            schema: authActionResponseSchema
          }).catch(() => undefined);
        }

        const response = NextResponse.json(
          {
            message: "ออกจากระบบสำเร็จ",
            ok: true
          },
          { status: 200 }
        );
        clearTokenCookies(response);

        return response;
      } catch (error) {
        return createAuthErrorResponse(error);
      }
    },

    refresh: async (request: Request) => {
      try {
        assertRequestOrigin(request);
        const refreshToken = readRequestCookie(request, AUTH_COOKIE_NAMES.refreshToken);

        if (!refreshToken) {
          return createAuthErrorResponse(
            new ApiClientError({
              code: "unauthorized",
              message: "Missing refresh token",
              status: 401
            })
          );
        }

        const token = await backendRequest({
          body: {
            refresh_token: refreshToken
          },
          method: "POST",
          path: "/api/auth/token/refresh",
          schema: tokenResponseSchema
        });
        const session = await backendRequest({
          accessToken: token.access_token,
          path: "/api/auth/session",
          schema: sessionResponseSchema
        });
        const response = createSessionResponse("ต่ออายุ session สำเร็จ", session);
        setTokenCookies(response, token);

        return response;
      } catch (error) {
        return createAuthErrorResponse(error);
      }
    },

    register: async (request: Request) => {
      try {
        assertRequestOrigin(request);
        const input = registerRouteInputSchema.parse(await readRouteJson(request));
        const result = await backendRequest({
          body: {
            email: input.email,
            full_name: input.fullName,
            password: input.password,
            role: mapFrontendRoleToBackendRole(input.role)
          },
          method: "POST",
          path: "/api/auth/register",
          schema: authActionResponseSchema
        });

        if (enableDevEmailVerification && result.dev_token) {
          const verification = await backendRequest({
            body: {
              token: result.dev_token
            },
            method: "POST",
            path: "/api/auth/verify-email",
            schema: authActionResponseSchema
          });

          return NextResponse.json(
            {
              email: verification.email ?? result.email ?? input.email,
              message: DEV_EMAIL_VERIFIED_MESSAGE,
              ok: true,
              requiresEmailVerification: false,
              verifiedInDevelopment: true
            },
            { status: 201 }
          );
        }

        return NextResponse.json(
          {
            email: result.email ?? input.email,
            message: AUTH_MESSAGES.registerSuccess,
            ok: true,
            requiresEmailVerification: Boolean(result.requires_email_verification)
          },
          { status: 201 }
        );
      } catch (error) {
        return createAuthErrorResponse(error);
      }
    },

    session: async (request: Request) => {
      try {
        const accessToken = readRequestCookie(request, AUTH_COOKIE_NAMES.accessToken);

        if (!accessToken) {
          return createAuthErrorResponse(
            new ApiClientError({
              code: "unauthorized",
              message: "Missing access token",
              status: 401
            })
          );
        }

        const session = await backendRequest({
          accessToken,
          path: "/api/auth/session",
          schema: sessionResponseSchema
        });

        return createSessionResponse("ตรวจสอบ session สำเร็จ", session);
      } catch (error) {
        return createAuthErrorResponse(error);
      }
    }
  };
};

export const authRouteHandlers = createAuthRouteHandlers();

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

const createSessionResponse = (message: string, session: SessionResponse) => {
  return NextResponse.json(
    {
      access: {
        accessibleRouteGroups: session.accessible_route_groups,
        canManageUsers: session.can_manage_users,
        canViewAdminAnalytics: session.can_view_admin_analytics,
        protectedRoutes: session.protected_routes
      },
      message,
      ok: true,
      session: toAuthSession(session)
    },
    { status: 200 }
  );
};

const setTokenCookies = (response: NextResponse, token: TokenResponse) => {
  response.cookies.set(
    AUTH_COOKIE_NAMES.accessToken,
    token.access_token,
    toNextCookieOptions(createAccessTokenCookie(token.access_token, token.expires_in))
  );

  if (token.refresh_token && token.refresh_expires_in) {
    response.cookies.set(
      AUTH_COOKIE_NAMES.refreshToken,
      token.refresh_token,
      toNextCookieOptions(createRefreshTokenCookie(token.refresh_token, token.refresh_expires_in))
    );
  }
};

const clearTokenCookies = (response: NextResponse) => {
  for (const cookie of createExpiredAuthCookies()) {
    response.cookies.set(cookie.name, cookie.value, toNextCookieOptions(cookie));
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

const createAuthErrorResponse = (error: unknown) => {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        message: "ข้อมูลที่ส่งไม่ถูกต้อง",
        ok: false
      },
      { status: 400 }
    );
  }

  if (error instanceof ApiClientError) {
    return NextResponse.json(
      {
        message: mapAuthErrorToMessage(error),
        ok: false
      },
      { status: error.status ?? (error.code === "csrf_violation" ? 403 : 500) }
    );
  }

  return NextResponse.json(
    {
      message: AUTH_MESSAGES.genericError,
      ok: false
    },
    { status: 500 }
  );
};

const mapAuthErrorToMessage = (error: ApiClientError) => {
  if (isEmailVerificationError(error)) {
    return "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ";
  }

  return mapApiErrorToMessage(error);
};

const isEmailVerificationError = (error: ApiClientError) => {
  const detail = extractBackendDetail(error.details);
  const candidates = [error.message, detail].filter(Boolean).join(" ").toLowerCase();

  return candidates.includes("verify your email");
};

const extractBackendDetail = (details: unknown) => {
  if (details && typeof details === "object" && "detail" in details) {
    const detail = details.detail;

    if (typeof detail === "string") {
      return detail;
    }
  }

  return undefined;
};

function getConfiguredAllowedOrigins() {
  return (process.env.AI_TUTOR_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}
