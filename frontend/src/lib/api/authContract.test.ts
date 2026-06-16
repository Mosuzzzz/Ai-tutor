import { describe, expect, it } from "vitest";

import {
  authActionResponseSchema,
  backendRoleSchema,
  mapBackendRoleToFrontendRole,
  mapFrontendRoleToBackendRole,
  sessionResponseSchema,
  tokenResponseSchema
} from "./authContract";

describe("auth API contract", () => {
  it("maps the unified frontend role labels to backend RBAC roles", () => {
    expect(mapFrontendRoleToBackendRole("user")).toBe("user");
  });

  it("maps backend single-user roles back to frontend route families", () => {
    expect(mapBackendRoleToFrontendRole("user")).toBe("user");
    expect(mapBackendRoleToFrontendRole("admin")).toBe("admin");
  });

  it("validates backend token, action, and session payloads", () => {
    expect(
      tokenResponseSchema.parse({
        access_token: "access-token",
        expires_in: 900,
        refresh_expires_in: 2592000,
        refresh_token: "refresh-token",
        token_type: "bearer"
      })
    ).toMatchObject({ token_type: "bearer" });

    expect(
      authActionResponseSchema.parse({
        email: "learner@example.com",
        message: "Registration complete.",
        requires_email_verification: true
      })
    ).toMatchObject({ requires_email_verification: true });

    expect(
      sessionResponseSchema.parse({
        accessible_route_groups: ["dashboard", "documents"],
        authenticated: true,
        is_admin: false,
        user: {
          created_at: "2026-06-03T10:00:00",
          email: "learner@example.com",
          full_name: "Learner One",
          id: "user-1",
          last_active_at: "2026-06-03T10:30:00",
          role: "user"
        }
      })
    ).toMatchObject({ authenticated: true });
  });

  it("rejects roles that are not part of the backend RBAC contract", () => {
    expect(backendRoleSchema.safeParse("teacher").success).toBe(false);
    expect(backendRoleSchema.safeParse("learner").success).toBe(false);
  });
});
