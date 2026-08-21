import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthShell } from "./AuthShell";

describe("AuthShell", () => {
  it("renders the approved Home wordmark and a quiet study companion", () => {
    render(
      <AuthShell mode="login">
        <div>Login form</div>
      </AuthShell>
    );

    expect(screen.getByRole("link", { name: "AI Tutor home" })).toHaveAttribute("href", "/home");
    expect(screen.getByText("AI Tutor")).toBeInTheDocument();
    expect(screen.getByTestId("auth-study-companion")).toHaveAttribute("data-state", "idle");
  });

  it("mirrors the auth panels between login and register", () => {
    const { rerender } = render(
      <AuthShell mode="login">
        <div>Login form</div>
      </AuthShell>
    );

    expect(screen.getByTestId("auth-visual-panel")).toHaveClass("lg:order-2");
    expect(screen.getByTestId("auth-form-panel")).toHaveClass("lg:order-1");

    rerender(
      <AuthShell mode="register">
        <div>Register form</div>
      </AuthShell>
    );

    expect(screen.getByTestId("auth-form-panel")).toHaveClass("lg:order-1");
    expect(screen.getByTestId("auth-visual-panel")).toHaveClass("lg:order-2");
  });

  it("exposes the current form interaction to the study companion", () => {
    render(
      <AuthShell mode="login" visualState="password-visible">
        <div>Login form</div>
      </AuthShell>
    );

    expect(screen.getByTestId("auth-study-companion")).toHaveAttribute(
      "data-state",
      "password-visible"
    );
  });
});
