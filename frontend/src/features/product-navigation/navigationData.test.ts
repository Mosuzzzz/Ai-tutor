import { describe, expect, it } from "vitest";

import { getProductNavigation, marketingNavigation, productNavigation } from "./navigationData";

describe("product navigation data", () => {
  it("keeps anonymous marketing anchors scoped to Home sections", () => {
    expect(marketingNavigation.map(({ href }) => href)).toEqual([
      "#how-it-works",
      "#study-kit",
      "#progress",
      "#faq"
    ]);
  });

  it("provides the five approved direct product destinations", () => {
    expect(productNavigation.map(({ href }) => href)).toEqual([
      "/dashboard",
      "/documents",
      "/chat",
      "/quiz",
      "/analytics"
    ]);
  });

  it.each(["user", "admin"] as const)("returns the approved links for the %s role", (role) => {
    expect(getProductNavigation(role)).toHaveLength(5);
  });

  it("keeps Settings out of the primary center navigation", () => {
    expect(productNavigation.some(({ href }) => href === ("/settings" as string))).toBe(false);
  });
});
