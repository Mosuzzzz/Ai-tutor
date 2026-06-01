import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PlaceholderPage } from "./PlaceholderPage";
import { getPlaceholderModule } from "./placeholderContent";

describe("PlaceholderPage", () => {
  it("renders centralized placeholder content without owning the app shell", () => {
    const placeholder = getPlaceholderModule("chat");

    render(<PlaceholderPage module={placeholder} />);

    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: placeholder.title })).toBeInTheDocument();
    expect(screen.getByText(placeholder.description)).toBeInTheDocument();
    expect(screen.getByText(placeholder.statusLabel)).toBeInTheDocument();
    expect(screen.getAllByText(placeholder.handoffNote)).toHaveLength(3);
  });

  it("renders every readiness item from the selected module", () => {
    const placeholder = getPlaceholderModule("analytics");

    render(<PlaceholderPage module={placeholder} />);

    for (const item of placeholder.readinessItems) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });
});
