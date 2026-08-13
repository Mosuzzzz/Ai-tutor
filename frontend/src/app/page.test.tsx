import { describe, expect, it, vi } from "vitest";

import RootPage from "./page";

const redirect = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  redirect
}));

describe("root route", () => {
  it("redirects every visitor to the public Home page", () => {
    RootPage();

    expect(redirect).toHaveBeenCalledWith("/home");
  });
});
