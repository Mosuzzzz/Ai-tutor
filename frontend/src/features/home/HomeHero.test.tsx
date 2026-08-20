import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeHero } from "./HomeHero";

describe("HomeHero", () => {
  it("renders the approved English guest copy, both guest CTAs, and the static study workflow", () => {
    render(<HomeHero language="en" session={null} />);

    expect(screen.getByRole("heading", { level: 1, name: "Learn smarter. Understand more." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get started for free" })).toHaveAttribute("href", "/register");
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("figure", { name: "AI study workflow: Document to Highlight to Summary to Ask to Quiz" })).toBeInTheDocument();
    ["Document", "Highlight", "Summary", "Ask", "Quiz"].forEach((step) => {
      expect(screen.getByText(step)).toBeInTheDocument();
    });
  });

  it("uses authenticated destinations and the approved Thai workflow labels", () => {
    render(
      <HomeHero
        language="th"
        session={{
          mode: "http-only-cookie",
          storesTokenInClient: false,
          user: { email: "learner@example.com", role: "user" }
        }}
      />
    );

    expect(screen.getByRole("heading", { level: 1, name: "เรียนได้ฉลาดขึ้น เข้าใจได้มากกว่า" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "เริ่มจากเอกสาร" })).toHaveAttribute("href", "/documents");
    expect(screen.getByRole("link", { name: "ไปที่แดชบอร์ด" })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("figure", { name: "ขั้นตอนการเรียนด้วย AI: เอกสาร ไฮไลต์ สรุป ถาม และควิซ" })).toBeInTheDocument();
  });
});
