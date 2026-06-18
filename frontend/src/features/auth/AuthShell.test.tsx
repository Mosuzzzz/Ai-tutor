import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthShell } from "./AuthShell";

describe("AuthShell", () => {
  it("renders the calm learning illustration without promotional copy in the visual panel", () => {
    render(
      <AuthShell mode="login">
        <div>Login form</div>
      </AuthShell>
    );

    const illustration = screen.getByTestId("auth-illustration");

    expect(decodeURIComponent(illustration.getAttribute("src") ?? "")).toContain(
      "/auth/Gemini_Generated_Image_wwfdchwwfdchwwfd.png"
    );
    expect(screen.queryByText("Personalized AI")).not.toBeInTheDocument();
    expect(screen.queryByText("Safe by design")).not.toBeInTheDocument();
  });

  it("mirrors the auth panels between login and register", () => {
    const { rerender } = render(
      <AuthShell mode="login">
        <div>Login form</div>
      </AuthShell>
    );

    expect(screen.getByTestId("auth-visual-panel")).toHaveClass("lg:order-1");
    expect(screen.getByTestId("auth-visual-panel")).toHaveClass("auth-panel-enter-from-left");
    expect(screen.getByTestId("auth-form-panel")).toHaveClass("lg:order-2");
    expect(screen.getByTestId("auth-form-panel")).toHaveClass("auth-panel-enter-from-right");

    rerender(
      <AuthShell mode="register">
        <div>Register form</div>
      </AuthShell>
    );

    expect(screen.getByTestId("auth-form-panel")).toHaveClass("lg:order-1");
    expect(screen.getByTestId("auth-form-panel")).toHaveClass("auth-panel-enter-from-left");
    expect(screen.getByTestId("auth-visual-panel")).toHaveClass("lg:order-2");
    expect(screen.getByTestId("auth-visual-panel")).toHaveClass("auth-panel-enter-from-right");
  });
});
