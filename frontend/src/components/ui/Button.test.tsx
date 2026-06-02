import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("renders as a safe button by default", () => {
    render(<Button>Start learning</Button>);

    const button = screen.getByRole("button", { name: "Start learning" });

    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("inline-flex", "min-h-12", "bg-primary", "text-on-primary");
  });

  it("allows explicit submit type, secondary variant, and custom classes", () => {
    render(
      <Button className="w-full" type="submit" variant="secondary">
        Save
      </Button>
    );

    const button = screen.getByRole("button", { name: "Save" });

    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveClass("border", "bg-surface-container-low", "text-primary", "w-full");
  });

  it("forwards native button attributes", () => {
    render(
      <Button aria-label="Close" disabled variant="ghost">
        X
      </Button>
    );

    const button = screen.getByRole("button", { name: "Close" });

    expect(button).toBeDisabled();
    expect(button).toHaveClass("text-on-surface-variant");
  });
});
