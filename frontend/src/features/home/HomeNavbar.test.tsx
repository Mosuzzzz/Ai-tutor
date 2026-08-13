import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HomeNavbar } from "./HomeNavbar";

const callbacks = {
  onLanguageToggle: vi.fn(),
  onMobileMenuOpen: vi.fn(),
  onThemeToggle: vi.fn()
};

describe("HomeNavbar", () => {
  it("renders the English destinations, light controls, login link, and Home brand", () => {
    render(<HomeNavbar language="en" session={null} theme="light" {...callbacks} />);

    expect(screen.getByRole("link", { name: "AI Tutor" })).toHaveAttribute("href", "/home");
    expect(decodeURIComponent(screen.getByRole("img", { name: "AI Tutor" }).getAttribute("src") ?? "")).toContain(
      "/brand/ChatGPT Image 13 ส.ค. 2569 22_46_03.png"
    );

    ["Dashboard", "Documents", "AI Chat", "Quiz", "Analytics"].forEach((label) => {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Language: EN" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Theme: Light" })).toHaveTextContent("Sun");
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
  });

  it("localizes the Thai navigation and guest account control", () => {
    render(<HomeNavbar language="th" session={null} theme="dark" {...callbacks} />);

    ["แดชบอร์ด", "เอกสาร", "AI แชท", "ควิซ", "สถิติ"].forEach((label) => {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "ภาษา: TH" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ธีม: Dark" })).toHaveTextContent("Moon");
    expect(screen.getByRole("link", { name: "เข้าสู่ระบบ" })).toHaveAttribute("href", "/login");
  });

  it("keeps the compact mobile controls accessible while marking text for narrow-width reduction", () => {
    render(<HomeNavbar language="en" session={null} theme="light" {...callbacks} />);

    expect(screen.getByRole("link", { name: "AI Tutor" })).toHaveClass("home-brand");
    expect(screen.getByRole("button", { name: "Language: EN" })).toHaveClass("home-language-control");
    expect(screen.getByRole("button", { name: "Theme: Light" })).toHaveClass("home-theme-control");
    expect(screen.getByRole("link", { name: "Log in" })).toHaveClass("home-login-link");
    expect(screen.getByText("Log in")).toHaveClass("home-login-label");
    expect(screen.getByRole("button", { name: "Open navigation menu" })).toBeInTheDocument();
  });
});
