import { describe, expect, it } from "vitest";

import { normalizePercentValue, normalizeRatePercentValue } from "./percent";

describe("percent helpers", () => {
  it("normalizes whole percent values for UI-safe progress and chart rendering", () => {
    expect(normalizePercentValue(-12)).toBe(0);
    expect(normalizePercentValue(84.6)).toBe(85);
    expect(normalizePercentValue(140)).toBe(100);
  });

  it("normalizes decimal rates and whole percentages with one shared helper", () => {
    expect(normalizeRatePercentValue(0.82)).toBe(82);
    expect(normalizeRatePercentValue(74)).toBe(74);
    expect(normalizeRatePercentValue(-0.1)).toBe(0);
    expect(normalizeRatePercentValue(2)).toBe(2);
    expect(normalizeRatePercentValue(120)).toBe(100);
  });
});
