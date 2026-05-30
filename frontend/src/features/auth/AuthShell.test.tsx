import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthShell } from "./AuthShell";

describe("AuthShell", () => {
  it("renders the login visual carousel with the provided learning images", () => {
    render(
      <AuthShell mode="login">
        <div>Login form</div>
      </AuthShell>
    );

    const slides = screen.getAllByTestId("auth-visual-slide");

    expect(slides).toHaveLength(3);
    expect(decodeURIComponent(slides[0].getAttribute("src") ?? "")).toContain(
      "/auth/login-slide-1.webp"
    );
    expect(decodeURIComponent(slides[1].getAttribute("src") ?? "")).toContain(
      "/auth/login-slide-2.webp"
    );
    expect(decodeURIComponent(slides[2].getAttribute("src") ?? "")).toContain(
      "/auth/login-slide-3.webp"
    );
    expect(screen.getByTestId("auth-visual-carousel")).toHaveClass("animate-auth-carousel");
  });
});
