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
    expect(loginLinks.length).toBeGreaterThanOrEqual(2);
    loginLinks.forEach((link) => expect(link).toHaveAttribute("href", "/login"));
    expect(screen.getAllByRole("link", { name: /Create your study workspace|Create your workspace|Start studying/ }).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByRole("button", { name: "Hello! learner@example.com" })).not.toBeInTheDocument();
  });

  it("renders direct product navigation without the workspace intermediary", async () => {
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
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: "Documents" })).toHaveAttribute("href", "/documents");
    expect(screen.getByRole("link", { name: "Chat" })).toHaveAttribute("href", "/chat");
    expect(screen.getByRole("link", { name: "Quiz" })).toHaveAttribute("href", "/quiz");
    expect(screen.getByRole("link", { name: "Analytics" })).toHaveAttribute("href", "/analytics");
    expect(screen.queryByText(/My workspace|พื้นที่เรียนของฉัน/)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Log in" })).not.toBeInTheDocument();
  });
});
