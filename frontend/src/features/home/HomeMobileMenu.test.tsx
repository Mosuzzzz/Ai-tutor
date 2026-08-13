import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HomeMobileMenu } from "./HomeMobileMenu";

describe("HomeMobileMenu", () => {
  it("contains all protected links and the guest account control", () => {
    render(<HomeMobileMenu isOpen language="en" onClose={vi.fn()} session={null} triggerRef={{ current: null }} />);
    const dialog = screen.getByRole("dialog", { name: "Open navigation menu" });

    ["Dashboard", "Documents", "AI Chat", "Quiz", "Analytics"].forEach((label) => {
      expect(within(dialog).getByRole("link", { name: label })).toBeInTheDocument();
    });
    expect(within(dialog).getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
  });

  it("traps focus and closes from backdrop or Escape while restoring trigger focus", () => {
    const onClose = vi.fn();
    const trigger = document.createElement("button");
    document.body.append(trigger);
    render(<HomeMobileMenu isOpen language="en" onClose={onClose} session={null} triggerRef={{ current: trigger }} />);
    const dialog = screen.getByRole("dialog");
    const closeButton = within(dialog).getByRole("button", { name: "Close navigation menu" });
    const login = within(dialog).getByRole("link", { name: "Log in" });
    closeButton.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(login).toHaveFocus();
    login.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveFocus();
    fireEvent.click(screen.getByTestId("home-mobile-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(2);
    trigger.remove();
  });
});
