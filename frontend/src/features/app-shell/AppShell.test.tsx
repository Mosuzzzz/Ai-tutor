import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

  it("renders premium shell landmarks with a skip link and labeled search", () => {
    render(
      <AppShell session={studentSession}>
        <p>Route content</p>
      </AppShell>
    );

    expect(screen.getByRole("link", { name: "ข้ามไปยังเนื้อหาหลัก" })).toHaveAttribute(
      "href",
      "#main-content"
    );
    expect(screen.getByRole("complementary", { name: "แถบนำทางหลัก" })).toBeInTheDocument();
    expect(screen.getByRole("banner", { name: "แถบบนของแอป" })).toBeInTheDocument();
    expect(screen.getByRole("main", { name: "พื้นที่เนื้อหาหลัก" })).toHaveAttribute(
      "id",
      "main-content"
    );
    expect(screen.getByRole("searchbox", { name: "ค้นหาคอร์สและบทเรียน" })).toBeInTheDocument();
  });

  it("shows account details in the top bar without duplicating them in the sidebar footer", () => {
    render(
      <AppShell session={studentSession}>
        <p>Route content</p>
      </AppShell>
    );

    const topBar = screen.getByRole("banner", { name: "แถบบนของแอป" });
    const accountSummary = within(topBar).getByLabelText("บัญชีผู้ใช้ Student One");

    expect(accountSummary).toHaveTextContent("Student One");
    expect(accountSummary).toHaveTextContent("ผู้เรียน");
    expect(screen.queryByLabelText("ข้อมูลผู้ใช้ Student One")).not.toBeInTheDocument();
  });

  it("keeps account identity out of the sidebar and mobile drawer", () => {
    render(
      <AppShell session={studentSession}>
        <p>Route content</p>
      </AppShell>
    );

    const topBar = screen.getByRole("banner");
    const sidebar = screen.getByRole("complementary");

    expect(within(topBar).getByText("Student One")).toBeInTheDocument();
    expect(within(sidebar).queryByText("Student One")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { expanded: false }));

    expect(within(screen.getByRole("dialog")).queryByText("Student One")).not.toBeInTheDocument();
  });

  it("keeps desktop navigation targets comfortable for pointer and touch users", () => {
    render(
      <AppShell session={studentSession}>
        <p>Route content</p>
      </AppShell>
    );

    expect(screen.getByRole("link", { name: /สรุปเอกสาร/ })).toHaveClass("min-h-11");
    expect(screen.getByRole("button", { name: "การแจ้งเตือน" })).toHaveClass("min-h-11");
  });

  it("routes the primary learning action instead of rendering a dead button", () => {
    render(
      <AppShell session={studentSession}>
        <p>Route content</p>
      </AppShell>
    );

    expect(screen.getByRole("link", { name: "เริ่มเรียนเลย" })).toHaveAttribute("href", "/courses");
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

  it("closes mobile navigation with Escape and returns focus to the menu button", async () => {
    render(
      <AppShell session={studentSession}>
        <p>Route content</p>
      </AppShell>
    );

    const menuButton = screen.getByRole("button", { name: "เปิดเมนู" });
    menuButton.focus();
    fireEvent.click(menuButton);

    expect(screen.getByRole("button", { name: "ปิดเมนู" })).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "เมนูหลัก" })).not.toBeInTheDocument();
    });
    expect(menuButton).toHaveFocus();
  });

  it("traps keyboard focus inside mobile navigation", () => {
    render(
      <AppShell session={studentSession}>
        <p>Route content</p>
      </AppShell>
    );

    fireEvent.click(screen.getByRole("button", { name: "เปิดเมนู" }));

    const dialog = screen.getByRole("dialog", { name: "เมนูหลัก" });
    const closeButton = within(dialog).getByRole("button", { name: "ปิดเมนู" });
    const logoutButton = within(dialog).getByRole("button", { name: "ออกจากระบบ" });

    closeButton.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(logoutButton).toHaveFocus();

    logoutButton.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(closeButton).toHaveFocus();
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
