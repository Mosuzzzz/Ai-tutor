import { describe, expect, it } from "vitest";

import {
  canAccessRoute,
  getDefaultRouteForRole,
  resolveProtectedRouteDecision,
  resolvePublicAuthRouteDecision
} from "./authRoutePolicy";
import type { AuthSession } from "./types";

const createSession = (role: AuthSession["user"]["role"]): AuthSession => ({
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Test User",
    email: `${role}@example.com`,
    role
  }
});

describe("auth route policy", () => {
  it("routes every authenticated role to the unified personal workspace by default", () => {
    expect(getDefaultRouteForRole("student")).toBe("/");
    expect(getDefaultRouteForRole("teacher")).toBe("/");
    expect(getDefaultRouteForRole("tenant_admin")).toBe("/");
    expect(getDefaultRouteForRole("global_admin")).toBe("/");
  });

  it("requires an authenticated session before rendering protected app routes", () => {
    expect(resolveProtectedRouteDecision(null, "/chat")).toEqual({
      href: "/login",
      type: "redirect"
    });
  });

  it("redirects users away from routes their role cannot access", () => {
    expect(resolveProtectedRouteDecision(createSession("student"), "/teacher")).toEqual({
      href: "/",
      type: "redirect"
    });
    expect(resolveProtectedRouteDecision(createSession("teacher"), "/")).toEqual({ type: "render" });
    expect(resolveProtectedRouteDecision(createSession("global_admin"), "/teacher")).toEqual({
      href: "/",
      type: "redirect"
    });
  });

  it("allows authenticated roles to use the shared core study routes", () => {
    expect(resolveProtectedRouteDecision(createSession("teacher"), "/quiz")).toEqual({ type: "render" });
    expect(resolveProtectedRouteDecision(createSession("student"), "/quiz")).toEqual({ type: "render" });
    expect(resolveProtectedRouteDecision(createSession("global_admin"), "/quiz")).toEqual({ type: "render" });
    expect(resolveProtectedRouteDecision(createSession("student"), "/documents")).toEqual({ type: "render" });
  });

  it("redirects authenticated users away from public auth routes", () => {
    expect(resolvePublicAuthRouteDecision(null)).toEqual({ type: "render" });
    expect(resolvePublicAuthRouteDecision(createSession("teacher"))).toEqual({
      href: "/",
      type: "redirect"
    });
  });

  it("normalizes nested paths before checking route access", () => {
    expect(canAccessRoute("teacher", "/quiz/drafts")).toBe(true);
    expect(canAccessRoute("tenant_admin", "/teacher/overview")).toBe(true);
    expect(canAccessRoute("global_admin", "/teacher/overview")).toBe(false);
    expect(canAccessRoute("global_admin", "/quiz/drafts")).toBe(true);
    expect(canAccessRoute("student", "/quiz/drafts")).toBe(true);
  });
});
