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
  it("maps frontend role labels to backend RBAC roles", () => {
    expect(mapFrontendRoleToBackendRole("student")).toBe("learner");
    expect(mapFrontendRoleToBackendRole("teacher")).toBe("trainer");
  });

  it("maps backend roles back to frontend route families", () => {
    expect(mapBackendRoleToFrontendRole("learner")).toBe("student");
    expect(mapBackendRoleToFrontendRole("trainer")).toBe("teacher");
    expect(mapBackendRoleToFrontendRole("tenant_admin")).toBe("tenant_admin");
    expect(mapBackendRoleToFrontendRole("global_admin")).toBe("global_admin");
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
        can_manage_users: false,
        can_view_admin_analytics: false,
        protected_routes: ["/api/files/upload"],
        user: {
          created_at: "2026-06-03T10:00:00",
          email: "learner@example.com",
          full_name: "Learner One",
          id: "user-1",
          last_active_at: "2026-06-03T10:30:00",
          role: "learner",
          tenant_id: "tenant-1"
        }
      })
    ).toMatchObject({ authenticated: true });
  });

  it("rejects roles that are not part of the backend RBAC contract", () => {
    expect(backendRoleSchema.safeParse("teacher").success).toBe(false);
  });
});
