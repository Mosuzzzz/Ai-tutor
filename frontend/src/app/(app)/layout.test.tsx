import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthSession } from "@/features/auth/types";

const requireAuthenticatedSession = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/authGuard", () => ({
  requireAuthenticatedSession
}));

vi.mock("@/features/app-shell/AppShell", () => ({
  AppShell: ({ children, session }: { children: ReactNode; session: AuthSession }) => (
    <div data-email={session.user.email} data-testid="shared-app-shell">
      {children}
    </div>
  )
}));

const session: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Layout Learner",
    email: "layout@example.com",
    role: "user"
  }
};

describe("protected app layout", () => {
  beforeEach(() => {
    requireAuthenticatedSession.mockReset();
    requireAuthenticatedSession.mockResolvedValue(session);
  });

  it("authenticates on the server and wraps protected route content once", async () => {
    const { default: ProtectedAppLayout } = await import("./layout");

    render(
      await ProtectedAppLayout({
        children: <p>Protected route content</p>
      })
    );

    expect(requireAuthenticatedSession).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("shared-app-shell")).toHaveAttribute(
      "data-email",
      "layout@example.com"
    );
    expect(screen.getByText("Protected route content")).toBeInTheDocument();
  });
});
