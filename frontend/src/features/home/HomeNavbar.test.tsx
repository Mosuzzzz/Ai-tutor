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

    expect(screen.getByRole("link", { name: "AI Tutor home" })).toHaveAttribute("href", "/home");
    expect(decodeURIComponent(screen.getByRole("link", { name: "AI Tutor home" }).querySelector("img")?.getAttribute("src") ?? "")).toContain(
      "/brand/ai-tutor-wordmark-green.png"
    );

    ["How it works", "Study kit", "Progress", "FAQ"].forEach((label) => {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    });
    expect(screen.queryByRole("link", { name: "Dashboard" })).not.toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Language: EN" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Theme: Light" })).toHaveTextContent("Sun");
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Start studying" })).toHaveAttribute("href", "/register");
  });

  it("localizes the Thai navigation and guest account control", () => {
    render(<HomeNavbar language="th" session={null} theme="dark" {...callbacks} />);

    ["วิธีการทำงาน", "ชุดเครื่องมือเรียน", "ความก้าวหน้า", "คำถามที่พบบ่อย"].forEach((label) => {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "ภาษา: TH" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ธีม: มืด" })).toHaveTextContent("ดวงจันทร์");
    expect(screen.getByRole("link", { name: "เข้าสู่ระบบ" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "เริ่มเรียน" })).toHaveAttribute("href", "/register");
  });

  it("keeps the compact mobile controls accessible while marking text for narrow-width reduction", () => {
    render(<HomeNavbar language="en" session={null} theme="light" {...callbacks} />);

    expect(screen.getByRole("link", { name: "AI Tutor home" })).toHaveClass("home-brand");
    expect(screen.getByRole("button", { name: "Language: EN" })).toHaveClass("home-language-control");
    expect(screen.getByRole("button", { name: "Theme: Light" })).toHaveClass("home-theme-control");
    expect(screen.getByRole("link", { name: "Log in" })).toHaveClass("home-login-link");
    expect(screen.getByText("Log in")).toHaveClass("home-login-label");
    expect(screen.getByRole("button", { name: "Open navigation menu" })).toBeInTheDocument();
  });

  it("replaces the guest login link with the authenticated account trigger", () => {
    render(
      <HomeNavbar
        language="en"
        session={{ mode: "http-only-cookie", storesTokenInClient: false, user: { email: "learner@example.com", role: "user" } }}
        theme="light"
        {...callbacks}
      />
    );

    const accountTrigger = screen.getByRole("button", { name: "Hello! learner@example.com" });
    expect(accountTrigger).toBeInTheDocument();
    expect(accountTrigger.querySelector(".home-account-icon")).toBeInTheDocument();
    expect(accountTrigger.querySelector(".home-account-label")).toHaveTextContent("Hello! learner@example.com");
    expect(screen.queryByRole("link", { name: "Log in" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "My workspace" })).toHaveAttribute("href", "/dashboard");
  });

  it("localizes Thai light theme state and icon text", () => {
    render(<HomeNavbar language="th" session={null} theme="light" {...callbacks} />);

    expect(screen.getByRole("button", { name: "ธีม: สว่าง" })).toHaveTextContent("ดวงอาทิตย์");
  });
});
