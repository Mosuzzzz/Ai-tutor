import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeHero } from "./HomeHero";

describe("HomeHero", () => {
  it("renders the approved English guest copy, registration CTA, and responsive learner photograph", () => {
    render(<HomeHero language="en" session={null} />);

    expect(screen.getByRole("heading", { level: 1, name: "Learn smarter. Understand more." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get started for free" })).toHaveAttribute("href", "/register");

    const image = screen.getByRole("img", { name: "Learner studying with an AI Tutor" });
    expect(decodeURIComponent(image.getAttribute("src") ?? "")).toContain(
      "/home/ChatGPT Image 13 ส.ค. 2569 22_15_52.png"
    );
    expect(image).toHaveAttribute("sizes");
    expect(image.getAttribute("sizes")).not.toBe("");
  });

  it("uses the authenticated destination and approved Thai heading", () => {
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
  });
});
