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
    expect(css).toMatch(/\.home-account-dropdown \[role="status"\]\s*\{\s*color:\s*var\(--home-error-text\);/);
  });

  it("keeps the mobile menu active until the five-link desktop navigation has enough room", () => {
    expect(css).toMatch(/@media \(min-width: 1120px\)[\s\S]*?\.home-desktop-navigation\s*\{\s*display:\s*flex;/);
    expect(css).toMatch(/@media \(max-width: 1119px\)[\s\S]*?\.home-navbar-controls \.home-account-label\s*\{\s*display:\s*none;/);
  });

  it("uses the approved responsive gutters and content width", () => {
    expect(css).toMatch(/\.home-page\s*\{[^}]*overflow-x:\s*hidden;/);
    expect(css).toMatch(/\.home-hero\s*\{[^}]*max-width:\s*1200px;[^}]*padding:\s*3\.5rem 1\.25rem 2\.25rem;/);
    expect(css).toMatch(/@media \(min-width:\s*768px\)[\s\S]*?\.home-hero\s*\{[^}]*padding-left:\s*2rem;[^}]*padding-right:\s*2rem;/);
    expect(css).toMatch(/@media \(min-width:\s*1024px\)[\s\S]*?\.home-hero\s*\{[^}]*padding-left:\s*2\.5rem;[^}]*padding-right:\s*2\.5rem;/);
    expect(css).toMatch(/@media \(min-width:\s*1280px\)[\s\S]*?\.home-hero\s*\{[^}]*padding-left:\s*3rem;[^}]*padding-right:\s*3rem;/);
  });

  it("keeps the static study-paper prototype stacked before using a desktop two-column hero", () => {
    expect(css).toMatch(/\.home-study-preview\s*\{[^}]*border-radius:\s*1\.125rem;[^}]*box-shadow:\s*0 8px 24px rgba\(23, 35, 27, 0\.07\);/);
    expect(css).toMatch(/\.home-study-paper-highlight\s*\{[^}]*background:\s*var\(--home-primary-soft\);/);
    expect(css).toMatch(/@media \(min-width:\s*1024px\)[\s\S]*?\.home-hero\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1\.08fr\) minmax\(0, 0\.92fr\);/);
    const previewRule = css.match(/\.home-study-preview\s*\{[^}]*\}/)?.[0] ?? "";
    expect(previewRule).not.toContain("animation:");
  });
});
