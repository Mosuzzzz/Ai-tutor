import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import tailwindConfig from "../../../tailwind.config";

type TailwindThemeExtend = {
  colors: Record<string, string>;
  boxShadow: Record<string, string>;
};

const themeExtend = tailwindConfig.theme?.extend as TailwindThemeExtend;

describe("impeccable design system tokens", () => {
  it("exposes restrained product state colors for shared surfaces", () => {
    expect(themeExtend.colors).toMatchObject({
      "accent-warm": "#C97A0E",
      info: "#2563EB",
      success: "#0E9F6E",
      warning: "#C97A0E"
    });
  });

  it("uses named product shadows instead of one ambient shadow for every surface", () => {
    expect(themeExtend.boxShadow).toMatchObject({
      card: "0 1px 1px rgba(20, 24, 29, 0.03)",
      control: "0 1px 1px rgba(20, 24, 29, 0.04)",
      elevated: "0 12px 32px -8px rgba(20, 24, 29, 0.16), 0 1px 2px rgba(20, 24, 29, 0.08)"
    });
  });

  it("keeps product typography and focus affordances in the global baseline", () => {
    const globals = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

    expect(globals).toContain("text-wrap: balance");
    expect(globals).toContain(":focus-visible");
    expect(globals).toContain("prefers-reduced-motion: reduce");
  });
});
