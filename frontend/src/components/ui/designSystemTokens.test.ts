import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import tailwindConfig from "../../../tailwind.config";

type TailwindThemeExtend = {
  colors: Record<string, string | Record<string, string>>;
  borderRadius: Record<string, string>;
  boxShadow: Record<string, string>;
  fontSize: Record<string, [string, { fontWeight: string; lineHeight: string }] | string>;
  maxWidth: Record<string, string>;
  spacing: Record<string, string>;
  transitionDuration: Record<string, string>;
  transitionTimingFunction: Record<string, string>;
};

const themeExtend = tailwindConfig.theme?.extend as TailwindThemeExtend;

describe("impeccable design system tokens", () => {
  it("exposes the approved R01 palette without replacing legacy consumer tokens", () => {
    expect(themeExtend.colors.foundation).toEqual({
      brand: "#176B4D",
      "brand-active": "#0D4632",
      "brand-hover": "#12583F",
      "brand-soft": "#E4F1E9",
      "border-control": "#829087",
      "border-subtle": "#D8DED7",
      canvas: "#F7F5EF",
      error: "#B42318",
      focus: "#0F766E",
      ink: "#17231B",
      "ink-muted": "#657169",
      "ink-secondary": "#46564B",
      success: "#1F7A50",
      surface: "#FCFBF7",
      "surface-elevated": "#FFFFFF",
      warning: "#8A5A00"
    });

    expect(themeExtend.colors).toMatchObject({
      background: "#f7f8fb",
      primary: "#3026a8",
      "surface-container-lowest": "#ffffff"
    });
  });

  it("defines the editorial type, container, and motion foundation for progressive migration", () => {
    expect(themeExtend.fontSize).toMatchObject({
      "display-xl": ["clamp(2.75rem, 5vw, 4.5rem)", { fontWeight: "700", lineHeight: "1.08" }],
      caption: ["12px", { fontWeight: "500", lineHeight: "1.5" }]
    });
    expect(themeExtend.maxWidth).toMatchObject({ content: "1200px", prose: "720px" });
    expect(themeExtend.spacing).toMatchObject({
      "page-desktop": "2.5rem",
      "page-mobile": "1.25rem",
      "page-tablet": "2rem",
      "page-wide": "3rem",
      "section-desktop": "6rem",
      "section-mobile": "4rem",
      "section-tablet": "5rem",
      "section-wide": "7rem"
    });
    expect(themeExtend.borderRadius).toMatchObject({
      "foundation-lg": "1.125rem",
      "foundation-md": "0.75rem",
      "foundation-sm": "0.375rem"
    });
    expect(themeExtend.boxShadow).toMatchObject({
      "foundation-control": "0 1px 2px rgba(23, 35, 27, 0.07)",
      "foundation-overlay": "0 24px 60px rgba(23, 35, 27, 0.14)",
      "foundation-surface": "0 8px 24px rgba(23, 35, 27, 0.07)"
    });
    expect(themeExtend.transitionDuration).toMatchObject({ control: "180ms", reveal: "420ms" });
    expect(themeExtend.transitionTimingFunction).toMatchObject({
      emphasis: "cubic-bezier(0.16, 1, 0.3, 1)",
      standard: "cubic-bezier(0.2, 0.8, 0.2, 1)"
    });
  });

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
    expect(globals).toContain("--font-display: var(--font-noto-thai)");
    expect(globals).toContain("--font-body: var(--font-noto-thai)");
    expect(globals).not.toContain('"Fraunces"');
    expect(globals).not.toContain('"DM Sans"');
    expect(globals).toContain(":focus-visible");
    expect(globals).toContain("prefers-reduced-motion: reduce");
  });
});
