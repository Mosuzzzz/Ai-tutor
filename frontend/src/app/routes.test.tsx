import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthSession } from "@/features/auth/types";
import CoursesPage from "./courses/page";
import SettingsPage from "./settings/page";
import { placeholderModules } from "../features/foundation/placeholderContent";

const studentSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Student One",
    email: "student@example.com",
    role: "user"
  }
};

const requirePageSession = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/authGuard", () => ({
  requirePageSession
}));

const routePages = [
  { Component: CoursesPage, href: "/courses", placeholder: placeholderModules.courses },
  { Component: SettingsPage, href: "/settings", placeholder: placeholderModules.settings }
];

describe("placeholder routes", () => {
  beforeEach(() => {
    requirePageSession.mockReset();
    requirePageSession.mockResolvedValue(studentSession);
  });

  it.each(routePages)(
    "renders $placeholder.title route inside the app shell",
    async ({ Component, href, placeholder }) => {
      render(await Component());

      expect(requirePageSession).toHaveBeenCalledWith(href);
      expect(screen.getByRole("main")).toHaveTextContent(placeholder.title);
      expect(screen.getByRole("main")).toHaveTextContent(placeholder.statusLabel);
      expect(screen.getByRole("main")).toHaveTextContent(placeholder.handoffNote);
      expect(screen.getByRole("banner")).toHaveTextContent("AI Tutor");
    }
  );
});
