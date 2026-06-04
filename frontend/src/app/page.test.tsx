import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthSession } from "@/features/auth/types";
import HomePage from "./page";

const studentSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Student One",
    email: "student@example.com",
    role: "student"
  }
};

const requirePageSession = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/authGuard", () => ({
  requirePageSession
}));

describe("Student dashboard page", () => {
  beforeEach(() => {
    requirePageSession.mockReset();
    requirePageSession.mockResolvedValue(studentSession);
  });

  it("renders the AI Tutor shell with the API-ready student dashboard", async () => {
    render(await HomePage());

    expect(requirePageSession).toHaveBeenCalledWith("/");
    expect(screen.getByRole("banner")).toHaveTextContent("AI Tutor");
    expect(screen.getByRole("main")).toHaveTextContent("แดชบอร์ดผู้เรียน");
    expect(screen.getByRole("main")).toHaveTextContent("24");
    expect(screen.getByRole("main")).toHaveTextContent("85%");
    expect(screen.getByTestId("student-dashboard")).toHaveAttribute("data-source", "api-ready-mock");
  });
});
