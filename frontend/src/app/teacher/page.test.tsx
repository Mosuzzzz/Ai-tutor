import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthSession } from "@/features/auth/types";
import TeacherPage from "./page";

const teacherSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Teacher One",
    email: "teacher@example.com",
    role: "teacher"
  }
};

const requirePageSession = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/authGuard", () => ({
  requirePageSession
}));

describe("teacher dashboard route", () => {
  beforeEach(() => {
    requirePageSession.mockReset();
    requirePageSession.mockResolvedValue(teacherSession);
  });

  it("renders the teacher dashboard inside the app shell", async () => {
    render(await TeacherPage());

    expect(requirePageSession).toHaveBeenCalledWith("/teacher");
    expect(screen.getByRole("banner")).toHaveTextContent("AI Tutor");
    expect(screen.getByRole("main")).toHaveTextContent("แดชบอร์ดครู");
    expect(screen.getByTestId("teacher-dashboard")).toHaveAttribute("data-source", "api-ready-mock");
  });
});
