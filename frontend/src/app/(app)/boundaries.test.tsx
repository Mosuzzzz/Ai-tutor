import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ProtectedRouteError from "./error";
import ProtectedRouteLoading from "./loading";

describe("protected route boundaries", () => {
  it("announces route loading without inventing a feature data shape", () => {
    render(<ProtectedRouteLoading />);

    expect(screen.getByRole("status")).toHaveTextContent("กำลังเปิดพื้นที่เรียน");
    expect(screen.queryByTestId(/dashboard|documents|chat|quiz|analytics/)).not.toBeInTheDocument();
  });

  it("shows a safe retry action without exposing raw error details", () => {
    const reset = vi.fn();
    render(<ProtectedRouteError reset={reset} />);

    expect(screen.getByRole("heading", { name: "เปิดหน้านี้ไม่สำเร็จ" })).toBeInTheDocument();
    expect(screen.queryByText(/stack|exception|digest/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "ลองอีกครั้ง" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
