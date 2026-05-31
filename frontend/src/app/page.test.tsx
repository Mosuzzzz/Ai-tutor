import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("Student dashboard page", () => {
  it("renders the AI Tutor shell with the API-ready student dashboard", async () => {
    render(await HomePage());

    expect(screen.getByRole("banner")).toHaveTextContent("AI Tutor");
    expect(screen.getByRole("main")).toHaveTextContent("แดชบอร์ดผู้เรียน");
    expect(screen.getByRole("main")).toHaveTextContent("24");
    expect(screen.getByRole("main")).toHaveTextContent("85%");
    expect(screen.getByTestId("student-dashboard")).toHaveAttribute("data-source", "api-ready-mock");
  });
});
