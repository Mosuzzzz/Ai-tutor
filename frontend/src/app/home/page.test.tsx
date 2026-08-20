import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import HomePage from "./page";
import type { AuthSession } from "@/features/auth/types";

const getServerAuthSession = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/authGuard", () => ({
  getServerAuthSession
}));

describe("public Home page", () => {
  beforeEach(() => {
    getServerAuthSession.mockReset();
  });

  it("renders the guest landing controls when the server finds no session", async () => {
    getServerAuthSession.mockResolvedValue(null);

    render(await HomePage());

    expect(getServerAuthSession).toHaveBeenCalledTimes(1);
    const loginLinks = screen.getAllByRole("link", { name: "Log in" });
    expect(loginLinks).toHaveLength(2);
    loginLinks.forEach((link) => expect(link).toHaveAttribute("href", "/login"));
    expect(screen.queryByRole("button", { name: "Hello! learner@example.com" })).not.toBeInTheDocument();
  });

  it("renders the authenticated greeting from the server session", async () => {
    const session: AuthSession = {
      mode: "http-only-cookie",
      storesTokenInClient: false,
      user: {
        displayName: "Learner",
        email: "learner@example.com",
        role: "user"
      }
    };
    getServerAuthSession.mockResolvedValue(session);

    render(await HomePage());

    expect(getServerAuthSession).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Hello! learner@example.com" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Log in" })).not.toBeInTheDocument();
  });
});
