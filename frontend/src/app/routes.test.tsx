import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthSession } from "@/features/auth/types";
import CoursesPage from "./(app)/courses/page";
import SettingsPage from "./(app)/settings/page";
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
    "preserves $placeholder.title route content for the shared app layout",
    async ({ Component, href, placeholder }) => {
      render(await Component());

      expect(requirePageSession).toHaveBeenCalledWith(href);
      expect(screen.getByText(placeholder.title)).toBeInTheDocument();
      expect(screen.getByText(placeholder.statusLabel)).toBeInTheDocument();
      expect(screen.getAllByText(placeholder.handoffNote)).toHaveLength(3);
    }
  );
});
