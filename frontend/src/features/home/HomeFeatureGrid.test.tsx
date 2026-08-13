import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeFeatureGrid } from "./HomeFeatureGrid";

describe("HomeFeatureGrid", () => {
  it("renders exactly three English feature cards with headings below the Hero h1", () => {
    render(
      <main>
        <h1>Learn smarter. Understand more.</h1>
        <HomeFeatureGrid language="en" />
      </main>
    );

    expect(screen.getAllByRole("article")).toHaveLength(3);
    ["Personalized learning", "Grounded AI help", "Track your progress"].forEach((title) => {
      expect(screen.getByRole("heading", { level: 2, name: title })).toBeInTheDocument();
    });
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("localizes all three feature card headings in Thai", () => {
    render(<HomeFeatureGrid language="th" />);

    ["การเรียนรู้ที่เหมาะกับคุณ", "AI ตอบจากเอกสาร", "ติดตามความก้าวหน้า"].forEach((title) => {
      expect(screen.getByRole("heading", { level: 2, name: title })).toBeInTheDocument();
    });
  });
});
