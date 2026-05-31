import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import TeacherPage from "./page";

describe("teacher dashboard route", () => {
  it("renders the teacher dashboard inside the app shell", () => {
    render(<TeacherPage />);

    expect(screen.getByRole("banner")).toHaveTextContent("AI Tutor");
    expect(screen.getByRole("main")).toHaveTextContent("แดชบอร์ดครู");
    expect(screen.getByTestId("teacher-dashboard")).toHaveAttribute("data-source", "api-ready-mock");
  });
});
