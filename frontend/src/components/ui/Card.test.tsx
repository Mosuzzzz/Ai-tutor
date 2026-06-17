import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card } from "./Card";

describe("Card", () => {
  it("renders content as a quiet bordered surface by default", () => {
    render(<Card>Latest lesson</Card>);

    const card = screen.getByText("Latest lesson");

    expect(card).toHaveClass(
      "rounded-lg",
      "border",
      "bg-surface-container-lowest"
    );
    expect(card).not.toHaveClass("shadow-card", "shadow-elevated");
  });

  it("merges custom classes and forwards div attributes", () => {
    render(
      <Card aria-label="Summary card" className="min-h-32" data-testid="summary-card">
        Summary result
      </Card>
    );

    const card = screen.getByTestId("summary-card");

    expect(card).toHaveAccessibleName("Summary card");
    expect(card).toHaveClass("min-h-32");
  });

  it("keeps muted surfaces bordered and elevated surfaces shadow-only", () => {
    render(
      <div>
        <Card data-testid="muted-card" padding="compact" variant="muted">
          Muted
        </Card>
        <Card data-testid="elevated-card" variant="elevated">
          Elevated
        </Card>
      </div>
    );

    expect(screen.getByTestId("muted-card")).toHaveClass(
      "border",
      "bg-surface-container-low",
      "p-4"
    );
    expect(screen.getByTestId("muted-card")).not.toHaveClass("shadow-card", "shadow-elevated");
    expect(screen.getByTestId("elevated-card")).toHaveClass(
      "bg-surface-container-lowest",
      "shadow-elevated"
    );
  });
});
