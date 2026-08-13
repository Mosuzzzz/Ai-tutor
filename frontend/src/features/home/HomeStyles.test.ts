import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

const channelToLinear = (channel: number) => {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex: string) => {
  const channels = hex.match(/[a-f\d]{2}/gi)?.map((channel) => channelToLinear(Number.parseInt(channel, 16)));
  if (!channels || channels.length !== 3) throw new Error(`Invalid color: ${hex}`);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

const contrastRatio = (first: string, second: string) => {
  const [bright, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (bright + 0.05) / (dark + 0.05);
};

const darkThemeVariable = (name: string) => {
  const darkTheme = css.match(/\.home-page\[data-home-theme="dark"\]\s*\{([^}]+)\}/)?.[1] ?? "";
  const value = darkTheme.match(new RegExp(`${name}:\\s*(#[a-f\\d]{6})`, "i"))?.[1];
  if (!value) throw new Error(`Missing dark Home variable ${name}`);
  return value;
};

const lightThemeVariable = (name: string) => {
  const lightTheme = css.match(/\.home-page\s*\{([^}]+)\}/)?.[1] ?? "";
  const value = lightTheme.match(new RegExp(`${name}:\\s*(#[a-f\\d]{6})`, "i"))?.[1];
  if (!value) throw new Error(`Missing light Home variable ${name}`);
  return value;
};

describe("Home style contracts", () => {
  it("keeps white action text WCAG AA against dark-theme primary and hover colors", () => {
    expect(contrastRatio("#ffffff", darkThemeVariable("--home-primary-action"))).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#ffffff", darkThemeVariable("--home-primary-hover"))).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps account error text WCAG AA against its elevated surface in both themes", () => {
    expect(contrastRatio(lightThemeVariable("--home-error-text"), lightThemeVariable("--home-elevated-surface"))).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(darkThemeVariable("--home-error-text"), darkThemeVariable("--home-elevated-surface"))).toBeGreaterThanOrEqual(4.5);
    expect(css).toMatch(/\.home-account-dropdown \[role="status"\]\s*\{\s*color:\s*var\(--home-error-text\);/);
  });

  it("keeps the mobile menu active until the five-link desktop navigation has enough room", () => {
    expect(css).toMatch(/@media \(min-width: 1120px\)[\s\S]*?\.home-desktop-navigation\s*\{\s*display:\s*flex;/);
    expect(css).toMatch(/@media \(max-width: 1119px\)[\s\S]*?\.home-navbar-controls \.home-account-label\s*\{\s*display:\s*none;/);
  });

  it("keeps the hero photograph safely stacked on small screens", () => {
    expect(css).toMatch(/\.home-hero-image-wrap\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*3;/);
    expect(css).toMatch(/\.home-page\s*\{[^}]*overflow-x:\s*hidden;/);
    expect(css).toMatch(/\.home-hero\s*\{[^}]*overflow-x:\s*hidden;/);
  });

  it("makes the desktop hero photograph full bleed without a frame", () => {
    expect(css).toMatch(/@media \(min-width: 1024px\)[\s\S]*?\.home-hero\s*\{[^}]*padding-top:\s*0;/);
    expect(css).toMatch(/@media \(min-width: 1024px\)[\s\S]*?\.home-hero-image-wrap\s*\{[^}]*border:\s*0;[^}]*border-radius:\s*0;/);
    expect(css).toMatch(/@media \(min-width: 1024px\)[\s\S]*?\.home-hero-image-wrap\s*\{[^}]*margin-right:\s*calc\(/);
    expect(css).toMatch(/\.home-hero-image-wrap::before\s*\{[^}]*linear-gradient\(90deg,[^}]*transparent/);
  });
});
