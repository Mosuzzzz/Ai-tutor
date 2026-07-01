import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("renders as a safe button by default", () => {
    render(<Button>Start learning</Button>);

    const button = screen.getByRole("button", { name: "Start learning" });

    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass(
      "inline-flex",
      "min-h-11",
      "rounded",
      "bg-primary",
      "text-on-primary",
      "shadow-control"
    );
  });

  it("allows explicit submit type, secondary variant, and custom classes", () => {
    render(
      <Button className="w-full" type="submit" variant="secondary">
        Save
      </Button>
    );

    const button = screen.getByRole("button", { name: "Save" });

    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveClass("border", "bg-surface-container-lowest", "text-primary", "w-full");
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

  it("forwards refs for accessible focus restoration", () => {
    const buttonRef = { current: null as HTMLButtonElement | null };

    render(<Button ref={buttonRef}>Open document library</Button>);

    expect(buttonRef.current).toBe(screen.getByRole("button", { name: "Open document library" }));
  });

  it("exposes loading state without dropping the accessible label", () => {
    render(
      <Button isLoading loadingLabel="กำลังบันทึก">
        Save
      </Button>
    );

    const button = screen.getByRole("button", { name: "กำลังบันทึก" });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveClass("cursor-wait");
  });

  it("supports a restrained destructive state", () => {
    render(<Button variant="danger">Delete document</Button>);

    const button = screen.getByRole("button", { name: "Delete document" });

    expect(button).toHaveClass("bg-error-container", "text-on-error-container");
  });
});
