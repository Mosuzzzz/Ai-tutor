import { z } from "zod";

export const backendRoleSchema = z.enum(["user", "admin"]);

export type BackendRole = z.infer<typeof backendRoleSchema>;
export type FrontendAuthRole = "user";
export type FrontendRouteRole = FrontendAuthRole | "admin";

export const mapFrontendRoleToBackendRole = (role: FrontendAuthRole): BackendRole => {
  return role;
};

export const mapBackendRoleToFrontendRole = (role: BackendRole): FrontendRouteRole => {
  const roleMap: Record<BackendRole, FrontendRouteRole> = {
    admin: "admin",
    user: "user"
  };

  return roleMap[role];
};

export const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().int().positive(),
  refresh_expires_in: z.number().int().positive().optional(),
  refresh_token: z.string().min(1).optional(),
  token_type: z.literal("bearer")
});

export const authActionResponseSchema = z.object({
  dev_token: z.string().min(1).optional().nullable(),
  email: z.email().optional().nullable(),
  expires_in: z.number().int().positive().optional().nullable(),
  message: z.string().min(1),
  requires_email_verification: z.boolean().optional().nullable(),
  tenant_id: z.string().min(1).optional().nullable(),
  user_id: z.string().min(1).optional().nullable()
});

export const userResponseSchema = z.object({
  created_at: z.string().min(1),
  email: z.email(),
  full_name: z.string().nullable().optional(),
  id: z.string().min(1),
  last_active_at: z.string().min(1),
  role: backendRoleSchema
});

export const sessionResponseSchema = z.object({
  accessible_route_groups: z.array(z.string().min(1)),
  authenticated: z.literal(true),
  is_admin: z.boolean(),
  user: userResponseSchema
});

export type AuthActionResponse = z.infer<typeof authActionResponseSchema>;
export type SessionResponse = z.infer<typeof sessionResponseSchema>;
export type TokenResponse = z.infer<typeof tokenResponseSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
