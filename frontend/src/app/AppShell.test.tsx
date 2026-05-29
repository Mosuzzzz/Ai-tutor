import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppShell } from "./AppShell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/documents"
}));

describe("AppShell navigation", () => {
  it("marks the current route as active from the pathname", () => {
    render(
      <AppShell>
        <p>Route content</p>
      </AppShell>
    );

    expect(screen.getByRole("link", { name: /สรุปเอกสาร/ })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: /แดชบอร์ด/ })).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("opens mobile navigation from the top bar menu button", () => {
    render(
      <AppShell>
        <p>Route content</p>
      </AppShell>
    );

    fireEvent.click(screen.getByRole("button", { name: "เปิดเมนู" }));

    expect(screen.getByRole("dialog", { name: "เมนูหลัก" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /แชท AI/ }).length).toBeGreaterThan(0);
  });
});
