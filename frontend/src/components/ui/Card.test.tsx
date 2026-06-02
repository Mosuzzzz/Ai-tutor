import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card } from "./Card";

describe("Card", () => {
  it("renders content with the shared card surface classes", () => {
    render(<Card>Latest lesson</Card>);

    const card = screen.getByText("Latest lesson");

    expect(card).toHaveClass(
      "rounded-xl",
      "border",
      "bg-surface-container-lowest",
      "shadow-ambient"
    );
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
});
