import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "./AppShell";
import type { AuthSession } from "../auth/types";

const routerRefresh = vi.hoisted(() => vi.fn());
const routerReplace = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: () => "/documents",
  useRouter: () => ({
    refresh: routerRefresh,
    replace: routerReplace
  })
}));

const jsonResponse = (body: unknown, init: ResponseInit = {}) => {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status: init.status ?? 200
  });
};

const studentSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Student One",
    email: "student@example.com",
    role: "student"
  }
};

const teacherSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Teacher One",
    email: "teacher@example.com",
    role: "teacher"
  }
};

describe("AppShell navigation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    routerRefresh.mockReset();
    routerReplace.mockReset();
  });

  it("marks the current route as active from the pathname", () => {
    render(
      <AppShell session={studentSession}>
        <p>Route content</p>
      </AppShell>
    );

    expect(screen.getByRole("link", { name: /สรุปเอกสาร/ })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: /^แดชบอร์ด$/ })).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("opens mobile navigation from the top bar menu button", () => {
    render(
      <AppShell session={studentSession}>
        <p>Route content</p>
      </AppShell>
    );

    fireEvent.click(screen.getByRole("button", { name: "เปิดเมนู" }));

    expect(screen.getByRole("dialog", { name: "เมนูหลัก" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /แชท AI/ }).length).toBeGreaterThan(0);
  });

  it("hides teacher-only navigation for learners", () => {
    render(
      <AppShell session={studentSession}>
        <p>Route content</p>
      </AppShell>
    );

    expect(screen.queryByRole("link", { name: "แดชบอร์ดครู" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "สร้างควิซ" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^แดชบอร์ด$/ })).toHaveAttribute("href", "/");
  });

  it("shows teacher navigation and profile details for teacher sessions", () => {
    render(
      <AppShell session={teacherSession}>
        <p>Route content</p>
      </AppShell>
    );

    expect(screen.getByRole("link", { name: "แดชบอร์ดครู" })).toHaveAttribute("href", "/teacher");
    expect(screen.getByRole("link", { name: "สร้างควิซ" })).toHaveAttribute("href", "/quiz");
    expect(screen.queryByRole("link", { name: /^แดชบอร์ด$/ })).not.toBeInTheDocument();
    expect(screen.getByLabelText("บัญชีผู้ใช้ Teacher One")).toHaveTextContent("T");
  });

  it("logs out through the same-origin BFF and redirects to login", async () => {
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        message: "ออกจากระบบสำเร็จ",
        ok: true
      })
    );
    render(
      <AppShell session={studentSession}>
        <p>Route content</p>
      </AppShell>
    );

    fireEvent.click(screen.getByRole("button", { name: "ออกจากระบบ" }));

    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledWith(
        "/api/auth/logout",
        expect.objectContaining({
          credentials: "same-origin",
          method: "POST"
        })
      );
    });
    expect(routerReplace).toHaveBeenCalledWith("/login");
    expect(routerRefresh).toHaveBeenCalled();
  });
});
