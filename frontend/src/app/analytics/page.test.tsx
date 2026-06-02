import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AnalyticsPage from "./page";

describe("analytics route", () => {
  it("renders the learning analytics feature inside the app shell", () => {
    render(<AnalyticsPage />);

    expect(screen.getByRole("banner")).toHaveTextContent("AI Tutor");
    expect(screen.getByRole("main")).toHaveTextContent("สถิติการเรียน");
    expect(screen.getByTestId("learning-analytics")).toBeInTheDocument();
  });
});
