import { mapBackendRoleToFrontendRole, type SessionResponse } from "../../lib/api/authContract";
import type { AuthSession } from "./types";

export const toAuthSession = (session: SessionResponse): AuthSession => {
  return {
    mode: "http-only-cookie",
    storesTokenInClient: false,
    user: {
      displayName: session.user.full_name,
      email: session.user.email,
      role: mapBackendRoleToFrontendRole(session.user.role)
    }
  };
};
