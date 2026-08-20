import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeFeatureGrid } from "./HomeFeatureGrid";

describe("HomeFeatureGrid", () => {
  it("renders the four connected product promises below the Hero h1", () => {
    render(
      <main>
        <h1>Turn your documents into an AI study workspace.</h1>
        <HomeFeatureGrid language="en" />
      </main>
    );

    expect(screen.getAllByRole("article")).toHaveLength(4);
    ["Understand the source", "Ask with context", "Review actively", "See what comes next"].forEach((title) => {
      expect(screen.getByRole("heading", { level: 2, name: title })).toBeInTheDocument();
    });
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("localizes all four editorial capability headings in Thai", () => {
    render(<HomeFeatureGrid language="th" />);

    expect(screen.getByRole("region", { name: "ฟีเจอร์การเรียนรู้" })).toBeInTheDocument();
    ["เข้าใจเนื้อหาต้นฉบับ", "ถามจากบริบท", "ทบทวนแบบลงมือทำ", "เห็นสิ่งที่ควรเรียนต่อ"].forEach((title) => {
      expect(screen.getByRole("heading", { level: 2, name: title })).toBeInTheDocument();
    });
  });
});
