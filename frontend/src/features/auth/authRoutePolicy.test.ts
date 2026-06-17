import { describe, expect, it } from "vitest";

import {
  canAccessRoute,
  getDefaultRouteForRole,
  resolveProtectedRouteDecision,
  resolvePublicAuthRouteDecision
} from "./authRoutePolicy";
import type { AuthRouteRole, AuthSession } from "./types";

const createSession = (role: AuthSession["user"]["role"]): AuthSession => ({
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Test User",
    email: `${role}@example.com`,
    role
  }
});

const allRoles: AuthRouteRole[] = ["user", "admin"];
const sharedRoutes = ["/", "/documents", "/chat", "/quiz", "/analytics", "/courses", "/settings"] as const;

describe("auth route policy", () => {
  it("routes every authenticated role to the unified personal workspace by default", () => {
    allRoles.forEach((role) => {
      expect(getDefaultRouteForRole(role)).toBe("/");
    });
  });

  it("requires an authenticated session before rendering protected app routes", () => {
    expect(resolveProtectedRouteDecision(null, "/chat")).toEqual({
      href: "/login",
      type: "redirect"
    });
  });

  it("allows every authenticated role to use shared core study routes", () => {
    allRoles.forEach((role) => {
      sharedRoutes.forEach((route) => {
        expect(resolveProtectedRouteDecision(createSession(role), route)).toEqual({ type: "render" });
      });
    });
  });

  it("does not treat the legacy teacher route as a protected core route", () => {
    expect(canAccessRoute("user", "/teacher")).toBe(false);
    expect(canAccessRoute("admin", "/teacher/overview")).toBe(false);
  });

  it("redirects authenticated users away from public auth routes", () => {
    expect(resolvePublicAuthRouteDecision(null)).toEqual({ type: "render" });
    expect(resolvePublicAuthRouteDecision(createSession("user"))).toEqual({
      href: "/",
      type: "redirect"
    });
  });

  it("normalizes nested shared paths before checking route access", () => {
    expect(canAccessRoute("user", "/quiz/drafts")).toBe(true);
    expect(canAccessRoute("user", "/documents/file-1")).toBe(true);
    expect(canAccessRoute("admin", "/analytics/latest")).toBe(true);
  });
});
