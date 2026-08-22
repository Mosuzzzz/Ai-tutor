import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "src/features/home/home.css"), "utf8");
const productNavigationCss = readFileSync(join(process.cwd(), "src/features/product-navigation/product-navigation.css"), "utf8");

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
  it("uses the approved warm-light palette with WCAG AA text and action contrast", () => {
    expect(lightThemeVariable("--home-page")).toBe("#f7f5ef");
    expect(lightThemeVariable("--home-elevated-surface")).toBe("#ffffff");
    expect(lightThemeVariable("--home-text")).toBe("#17231b");
    expect(lightThemeVariable("--home-muted-text")).toBe("#657169");
    expect(lightThemeVariable("--home-primary-action")).toBe("#176b4d");
    expect(lightThemeVariable("--home-primary-hover")).toBe("#12583f");
    expect(contrastRatio(lightThemeVariable("--home-text"), lightThemeVariable("--home-page"))).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(lightThemeVariable("--home-muted-text"), lightThemeVariable("--home-page"))).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#ffffff", lightThemeVariable("--home-primary-action"))).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(lightThemeVariable("--home-control-border"), lightThemeVariable("--home-page"))).toBeGreaterThanOrEqual(3);
  });

  it("keeps the existing dark-theme actions and errors readable", () => {
    expect(contrastRatio("#ffffff", darkThemeVariable("--home-primary-action"))).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#ffffff", darkThemeVariable("--home-primary-hover"))).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(darkThemeVariable("--home-control-border"), darkThemeVariable("--home-page"))).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(lightThemeVariable("--home-error-text"), lightThemeVariable("--home-elevated-surface"))).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(darkThemeVariable("--home-error-text"), darkThemeVariable("--home-elevated-surface"))).toBeGreaterThanOrEqual(4.5);
  });

  it("uses the shared compact product navigation until all three zones have room", () => {
    expect(productNavigationCss).toMatch(/@media\(min-width:1200px\)\{\.product-desktop-nav\{display:flex\}/);
    expect(productNavigationCss).toMatch(/@media\(min-width:1200px\)[^}]*\}\.product-menu-trigger\{display:none\}/);
  });

  it("uses responsive gutters and a bounded content width", () => {
    expect(css).toMatch(/\.home-page\s*\{[^}]*overflow-x:\s*clip;/);
    expect(css).toMatch(/\.home-hero\s*\{[^}]*max-width:\s*1200px;[^}]*padding:\s*4\.25rem 1\.25rem 4rem;/);
    expect(css).toMatch(/@media \(min-width:\s*768px\)[\s\S]*?\.home-hero\s*\{[^}]*padding-left:\s*2rem;[^}]*padding-right:\s*2rem;/);
    expect(css).toMatch(/@media \(min-width:\s*1024px\)[\s\S]*?\.home-hero\s*\{[^}]*padding:\s*4rem 2\.5rem 5rem;/);
    expect(css).toMatch(/@media \(min-width:\s*1280px\)[\s\S]*?\.home-hero\s*\{[^}]*padding-left:\s*3rem;[^}]*padding-right:\s*3rem;/);
  });

  it("reserves the study-scene layout and simplifies it for reduced motion", () => {
    expect(css).toMatch(/\.home-study-scene\s*\{[^}]*min-height:\s*31rem;/);
    expect(css).toMatch(/@media \(min-width:\s*1024px\)[\s\S]*?\.home-hero\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1\.04fr\) minmax\(0, \.96fr\);/);
    expect(css).toMatch(/@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.home-scene-toggle\s*\{\s*display:\s*none;/);
  });
});
