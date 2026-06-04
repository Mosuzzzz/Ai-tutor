import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAMES } from "../../lib/api/authCookies";
import { sessionResponseSchema } from "../../lib/api/authContract";
import {
  backendJsonRequest,
  type BackendJsonRequestOptions
} from "../../lib/api/backendClient";
import {
  resolveProtectedRouteDecision,
  resolvePublicAuthRouteDecision,
  type ProtectedRouteHref
} from "./authRoutePolicy";
import { toAuthSession } from "./sessionMapping";
import type { AuthSession } from "./types";

export type AuthBackendRequest = <TResponse>(
  options: BackendJsonRequestOptions<TResponse>
) => Promise<TResponse>;

export type ServerCookieStore = {
  get: (name: string) => { value: string } | undefined;
};

type ServerAuthSessionOptions = {
  backendRequest?: AuthBackendRequest;
  cookieStore?: ServerCookieStore;
};

export type PageSessionDecision =
  | {
      session: AuthSession;
      type: "render";
    }
  | {
      href: string;
      type: "redirect";
    };

export const getServerAuthSession = async ({
  backendRequest = backendJsonRequest,
  cookieStore
}: ServerAuthSessionOptions = {}): Promise<AuthSession | null> => {
  const store = cookieStore ?? (await cookies());
  const accessToken = store.get(AUTH_COOKIE_NAMES.accessToken)?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const session = await backendRequest({
      accessToken,
      path: "/api/auth/session",
      schema: sessionResponseSchema
    });

    return toAuthSession(session);
  } catch {
    return null;
  }
};

export const resolvePageSession = async (
  href: ProtectedRouteHref,
  options: ServerAuthSessionOptions = {}
): Promise<PageSessionDecision> => {
  const session = await getServerAuthSession(options);
  const decision = resolveProtectedRouteDecision(session, href);

  if (decision.type === "redirect") {
    return decision;
  }

  return {
    session: session as AuthSession,
    type: "render"
  };
};

export const requirePageSession = async (href: ProtectedRouteHref) => {
  const decision = await resolvePageSession(href);

  if (decision.type === "redirect") {
    redirect(decision.href);
  }

  return decision.session;
};

export const redirectAuthenticatedRoute = async () => {
  const session = await getServerAuthSession();
  const decision = resolvePublicAuthRouteDecision(session);

  if (decision.type === "redirect") {
    redirect(decision.href);
  }
};
