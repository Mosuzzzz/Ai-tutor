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
      "accent-warm": "#b87516",
      info: "#22577a",
      success: "#146c43",
      warning: "#9a6400"
    });
  });

  it("uses named product shadows instead of one ambient shadow for every surface", () => {
    expect(themeExtend.boxShadow).toMatchObject({
      card: "0 1px 2px rgba(11, 28, 48, 0.06)",
      control: "0 1px 2px rgba(11, 28, 48, 0.08)",
      elevated: "0 10px 24px rgba(11, 28, 48, 0.1)"
    });
  });

  it("keeps product typography and focus affordances in the global baseline", () => {
    const globals = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

    expect(globals).toContain("text-wrap: balance");
    expect(globals).toContain(":focus-visible");
    expect(globals).toContain("prefers-reduced-motion: reduce");
  });
});
