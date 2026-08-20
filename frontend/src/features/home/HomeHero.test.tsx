import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeHero } from "./HomeHero";

describe("HomeHero", () => {
  it("renders the approved English guest copy and session-safe guest CTAs", () => {
    render(<HomeHero language="en" session={null} />);

    expect(screen.getByRole("heading", { level: 1, name: "Turn your documents into an AI study workspace." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create your study workspace" })).toHaveAttribute("href", "/register");
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("figure", { name: "AI study workflow: document, summary, document-based question, review quiz, and result" })).toBeInTheDocument();
    expect(screen.getByText("Why is the membrane selectively permeable?")).toBeInTheDocument();
    const pauseButton = screen.getByRole("button", { name: "Pause study story" });
    fireEvent.click(pauseButton);
    expect(screen.getByRole("button", { name: "Play study story" })).toBeInTheDocument();
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

    expect(screen.getByRole("heading", { level: 1, name: "เปลี่ยนเอกสารของคุณให้เป็นพื้นที่เรียนกับ AI" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "เปิดเอกสารของฉัน" })).toHaveAttribute("href", "/documents");
    expect(screen.getByRole("link", { name: "ไปที่แดชบอร์ดของฉัน" })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("figure", { name: "ขั้นตอนการเรียนด้วย AI จากเอกสาร สรุป คำถาม ควิซ และผลทบทวน" })).toBeInTheDocument();
  });

  it("keeps the approved headline accessible while sequencing calm copy-group entrances", () => {
    render(<HomeHero language="en" session={null} />);

    const hero = screen.getByRole("region", { name: "Turn your documents into an AI study workspace." });
    const headline = screen.getByRole("heading", { level: 1, name: "Turn your documents into an AI study workspace." });
    const sequence = Array.from(hero.querySelectorAll<HTMLElement>("[data-hero-enter]"))
      .map((element) => element.dataset.heroEnter);

    expect(sequence).toEqual([
      "eyebrow",
      "headline-line-1",
      "headline-line-2",
      "body",
      "primary-action",
      "secondary-action",
      "trust-line"
    ]);
    expect(Array.from(headline.querySelectorAll("mark"), (mark) => mark.textContent)).toEqual(["documents", "AI study workspace"]);
  });
});
