import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "src/features/study-dashboard/studyDashboard.module.css"), "utf8");

describe("study Dashboard motion contract", () => {
  it("defines separate hero and section entrance contracts without changing layout dimensions", () => {
    expect(css).toMatch(/\.heroFrame\s*\{[^}]*animation:/);
    expect(css).toMatch(/\.greetingBlock\s*\{[^}]*animation:/);
    expect(css).toMatch(/\.heroPanel\s*\{[^}]*animation:/);
    expect(css).toMatch(/\.delayOverview[\s\S]*?\.delayActivity[\s\S]*?\.delayDocuments[\s\S]*?\.delayReviews[\s\S]*?\.delayActions/);
    const keyframeBlocks = css.match(/@keyframes dashboard-[\s\S]*?(?=@media|$)/)?.[0] ?? "";
    expect(keyframeBlocks).not.toMatch(/(?:width|height|margin|padding):/);
  });

  it("limits hover transforms to fine pointers and keeps static metrics grounded", () => {
    expect(css).toMatch(/@media \(hover: hover\) and \(pointer: fine\)[\s\S]*?\.continuationSurface:hover[\s\S]*?\.documentRow:hover[\s\S]*?\.reviewItem:hover/);
    expect(css).toMatch(/\.overviewMetric:hover[\s\S]*?background-color:/);
    expect(css).not.toMatch(/\.overviewMetric:hover\s*\{[^}]*transform:/);
  });

  it("shows final content immediately and disables chart drawing for reduced motion", () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.heroFrame,[\s\S]*?\.greetingBlock,[\s\S]*?\.heroPanel,[\s\S]*?\.reveal,[\s\S]*?\.chartLine,[\s\S]*?\.chartPoint/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*?animation: none;[\s\S]*?opacity: 1;[\s\S]*?transform: none;[\s\S]*?stroke-dashoffset: 0;/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.dashboard :global\(a\),[\s\S]*?\.dashboard :global\(article\)[\s\S]*?transition-duration: 0\.01ms;/);
  });
});
