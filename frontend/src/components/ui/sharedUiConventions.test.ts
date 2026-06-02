import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sharedUiFiles = [
  "src/components/ui/Button.tsx",
  "src/components/ui/Card.tsx",
  "src/lib/cn.ts"
];

describe("shared UI conventions", () => {
  it("uses arrow exports and avoids unsafe TypeScript shortcuts", () => {
    for (const filePath of sharedUiFiles) {
      const source = readFileSync(join(process.cwd(), filePath), "utf8");

      expect(source).not.toMatch(/export function /);
      expect(source).not.toMatch(/React\.FC/);
      expect(source).not.toMatch(/\bany\b/);
    }
  });
});
