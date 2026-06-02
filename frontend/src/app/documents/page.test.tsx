import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DocumentsPage from "./page";

describe("documents route", () => {
  it("renders the document summary feature inside the app shell", () => {
    render(<DocumentsPage />);

    expect(screen.getByRole("banner")).toHaveTextContent("AI Tutor");
    expect(screen.getByRole("main")).toHaveTextContent("สรุปเอกสารด้วย AI");
    expect(screen.getByTestId("document-summary")).toBeInTheDocument();
  });
});
