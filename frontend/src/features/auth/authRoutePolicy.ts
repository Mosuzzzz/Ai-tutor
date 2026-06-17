import type { NavigationItem } from "../app-shell/types";
import type { AuthRouteRole, AuthSession } from "./types";

export type ProtectedRouteHref =
  | "/"
  | "/analytics"
  | "/chat"
  | "/courses"
  | "/documents"
  | "/quiz"
  | "/settings";

export type AuthRouteDecision =
  | {
      type: "render";
    }
  | {
      href: string;
      type: "redirect";
    };

const ALL_AUTH_ROLES = ["user", "admin"] as const;

export const protectedRouteRoles = {
  "/": ALL_AUTH_ROLES,
  "/analytics": ALL_AUTH_ROLES,
  "/chat": ALL_AUTH_ROLES,
  "/courses": ALL_AUTH_ROLES,
  "/documents": ALL_AUTH_ROLES,
  "/quiz": ALL_AUTH_ROLES,
  "/settings": ALL_AUTH_ROLES
} satisfies Record<ProtectedRouteHref, readonly AuthRouteRole[]>;

export const getDefaultRouteForRole = (_role: AuthRouteRole) => {
  return "/";
};

export const canAccessRoute = (role: AuthRouteRole, href: string) => {
  const route = getProtectedRouteForHref(href);

  if (!route) {
    return false;
  }

  const allowedRoles: readonly AuthRouteRole[] = protectedRouteRoles[route];

  return allowedRoles.includes(role);
};

export const resolveProtectedRouteDecision = (
  session: AuthSession | null,
  href: ProtectedRouteHref
): AuthRouteDecision => {
  if (!session) {
    return {
      href: "/login",
      type: "redirect"
    };
  }

  if (!canAccessRoute(session.user.role, href)) {
    return {
      href: getDefaultRouteForRole(session.user.role),
      type: "redirect"
    };
  }

  return { type: "render" };
};

export const resolvePublicAuthRouteDecision = (session: AuthSession | null): AuthRouteDecision => {
  if (!session) {
    return { type: "render" };
  }

  return {
    href: getDefaultRouteForRole(session.user.role),
    type: "redirect"
  };
};

export const filterNavigationItemsForRole = <TItem extends NavigationItem>(
  items: readonly TItem[],
  role: AuthRouteRole
) => {
  return items.filter((item) => item.allowedRoles.includes(role) && canAccessRoute(role, item.href));
};

const getProtectedRouteForHref = (href: string): ProtectedRouteHref | undefined => {
  const normalizedHref = href === "/" ? "/" : `/${href.split("?")[0]?.split("#")[0]?.split("/").filter(Boolean)[0] ?? ""}`;

  if (normalizedHref in protectedRouteRoles) {
    return normalizedHref as ProtectedRouteHref;
  }

  return undefined;
};
