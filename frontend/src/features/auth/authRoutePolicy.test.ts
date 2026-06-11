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
  it("routes learners to the student dashboard, trainers to teacher dashboard, and global admins to analytics", () => {
    expect(getDefaultRouteForRole("student")).toBe("/");
    expect(getDefaultRouteForRole("teacher")).toBe("/teacher");
    expect(getDefaultRouteForRole("tenant_admin")).toBe("/teacher");
    expect(getDefaultRouteForRole("global_admin")).toBe("/analytics");
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
    expect(resolveProtectedRouteDecision(createSession("teacher"), "/")).toEqual({
      href: "/teacher",
      type: "redirect"
    });
    expect(resolveProtectedRouteDecision(createSession("global_admin"), "/teacher")).toEqual({
      href: "/analytics",
      type: "redirect"
    });
  });

  it("allows role-matched protected routes", () => {
    expect(resolveProtectedRouteDecision(createSession("teacher"), "/quiz")).toEqual({ type: "render" });
    expect(resolveProtectedRouteDecision(createSession("student"), "/quiz")).toEqual({ type: "render" });
    expect(resolveProtectedRouteDecision(createSession("student"), "/documents")).toEqual({ type: "render" });
  });

  it("redirects authenticated users away from public auth routes", () => {
    expect(resolvePublicAuthRouteDecision(null)).toEqual({ type: "render" });
    expect(resolvePublicAuthRouteDecision(createSession("teacher"))).toEqual({
      href: "/teacher",
      type: "redirect"
    });
  });

  it("normalizes nested paths before checking route access", () => {
    expect(canAccessRoute("teacher", "/quiz/drafts")).toBe(true);
    expect(canAccessRoute("tenant_admin", "/teacher/overview")).toBe(true);
    expect(canAccessRoute("global_admin", "/teacher/overview")).toBe(false);
    expect(canAccessRoute("global_admin", "/quiz/drafts")).toBe(false);
    expect(canAccessRoute("student", "/quiz/drafts")).toBe(true);
  });
});
