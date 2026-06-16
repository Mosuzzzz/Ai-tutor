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

const learnerSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Siwakorn bundi",
    email: "siwakorn@example.com",
    role: "user"
  }
};

const teacherCompatibleSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Teacher One",
    email: "teacher@example.com",
    role: "user"
  }
};

describe("AppShell navigation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    routerRefresh.mockReset();
    routerReplace.mockReset();
  });

  it("marks the current document route as active from the pathname", () => {
    render(
      <AppShell session={learnerSession}>
        <p>Route content</p>
      </AppShell>
    );

    expect(screen.getByRole("link", { name: /เอกสารของฉัน/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /^แดชบอร์ด$/ })).not.toHaveAttribute("aria-current");
  });

  it("renders premium shell landmarks with a skip link and document-first search", () => {
    render(
      <AppShell session={learnerSession}>
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
    expect(screen.getByRole("searchbox", { name: "ค้นหาเอกสาร ควิซ หรือสรุป" })).toBeInTheDocument();
  });

  it("shows a neutral account summary in the top bar without role labels or sidebar duplication", () => {
    render(
      <AppShell session={learnerSession}>
        <p>Route content</p>
      </AppShell>
    );

    const topBar = screen.getByRole("banner", { name: "แถบบนของแอป" });
    const sidebar = screen.getByRole("complementary", { name: "แถบนำทางหลัก" });
    const accountSummary = within(topBar).getByLabelText("บัญชีผู้ใช้ Siwakorn bundi");

    expect(accountSummary).toHaveTextContent("Siwakorn bundi");
    expect(accountSummary).toHaveTextContent("พื้นที่เรียนของฉัน");
    expect(accountSummary).not.toHaveTextContent("ผู้เรียน");
    expect(accountSummary).not.toHaveTextContent("ครูผู้สอน");
    expect(within(sidebar).queryByText("Siwakorn bundi")).not.toBeInTheDocument();
  });

  it("uses the same core navigation for backend-compatible teacher sessions", () => {
    render(
      <AppShell session={teacherCompatibleSession}>
        <p>Route content</p>
      </AppShell>
    );

    expect(screen.getByRole("link", { name: /^แดชบอร์ด$/ })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /ควิซทบทวน/ })).toHaveAttribute("href", "/quiz");
    expect(screen.queryByRole("link", { name: "แดชบอร์ดครู" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "คอร์สเรียน" })).not.toBeInTheDocument();
  });

  it("keeps desktop navigation targets comfortable for pointer and touch users", () => {
    render(
      <AppShell session={learnerSession}>
        <p>Route content</p>
      </AppShell>
    );

    expect(screen.getByRole("link", { name: /เอกสารของฉัน/ })).toHaveClass("min-h-11");
    expect(screen.getByRole("button", { name: "การแจ้งเตือน" })).toHaveClass("min-h-11");
  });

  it("routes the primary learning action to document upload instead of a placeholder course page", () => {
    render(
      <AppShell session={learnerSession}>
        <p>Route content</p>
      </AppShell>
    );

    expect(screen.getByRole("link", { name: "เริ่มจากเอกสาร" })).toHaveAttribute("href", "/documents");
  });

  it("opens mobile navigation from the top bar menu button", () => {
    render(
      <AppShell session={learnerSession}>
        <p>Route content</p>
      </AppShell>
    );

    fireEvent.click(screen.getByRole("button", { name: "เปิดเมนู" }));

    expect(screen.getByRole("dialog", { name: "เมนูหลัก" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /แชทกับเอกสาร/ }).length).toBeGreaterThan(0);
  });

  it("closes mobile navigation with Escape and returns focus to the menu button", async () => {
    render(
      <AppShell session={learnerSession}>
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
      <AppShell session={learnerSession}>
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

  it("logs out through the same-origin BFF and redirects to login", async () => {
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        message: "ออกจากระบบสำเร็จ",
        ok: true
      })
    );
    render(
      <AppShell session={learnerSession}>
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
