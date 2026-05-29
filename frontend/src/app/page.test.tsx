import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("Next.js foundation page", () => {
  it("renders the AI Tutor shell with core navigation and preview content", () => {
    render(<HomePage />);

    expect(screen.getByRole("banner")).toHaveTextContent("AI Tutor");
    expect(screen.getByRole("navigation", { name: "เมนูหลัก" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /แดชบอร์ด/ })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /สรุปเอกสาร/ })).toHaveAttribute(
      "href",
      "/documents"
    );
    expect(screen.getByRole("main")).toHaveTextContent("Frontend Foundation");
    expect(screen.getAllByRole("button", { name: /เริ่มเรียนเลย/ })).not.toHaveLength(0);
  });
});
